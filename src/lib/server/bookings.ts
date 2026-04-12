import { and, count, eq, gte, inArray, lt, ne, or } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import {
	addDaysToDateKey,
	formatTimeInTimeZone,
	getDateKeyInTimeZone,
	getZonedParts,
	zonedDateTimeToUtc
} from '$lib/timezone';
import { db } from '$lib/server/db';
import {
	availabilityOverride,
	availabilityOverrideWindow,
	booking,
	customer,
	service,
	weeklyAvailability,
	workspace
} from '$lib/server/db/schema';
import { getWorkspaceBySlug } from '$lib/server/workspace';
import {
	createZohoMeeting,
	deleteZohoMeeting,
	formatZohoStartTime,
	updateZohoMeeting
} from '$lib/server/zoho';

export type PublicWorkspace = typeof workspace.$inferSelect;
export type PublicService = typeof service.$inferSelect;

const MINUTE = 60 * 1000;

function isBookingOverlapConstraintError(error: unknown) {
	if (!error || typeof error !== 'object') {
		return false;
	}

	return (
		'code' in error &&
		error.code === '23P01' &&
		'constraint_name' in error &&
		error.constraint_name === 'booking_workspace_scheduled_no_overlap'
	);
}

export function parseTimeToMinutes(value: string) {
	const [hours, minutes] = value.split(':').map(Number);
	return hours * 60 + minutes;
}

export async function getPublicBookingContext(slug: string) {
	const workspace = await getWorkspaceBySlug(slug);
	if (!workspace) {
		return null;
	}

	const services = await db.query.service.findMany({
		where: and(eq(service.workspaceId, workspace.id), eq(service.isActive, true)),
		orderBy: (service, { asc }) => [asc(service.name)]
	});

	return {
		workspace,
		services
	};
}

export async function getBookingsForWorkspace(workspaceId: string) {
	const bookings = await db.query.booking.findMany({
		where: eq(booking.workspaceId, workspaceId),
		orderBy: (booking, { desc }) => [desc(booking.startAt)]
	});

	const services = await db.query.service.findMany({
		where: eq(service.workspaceId, workspaceId)
	});
	const customers = await db.query.customer.findMany({
		where: eq(customer.workspaceId, workspaceId)
	});

	const serviceMap = new Map(services.map((item) => [item.id, item]));
	const customerMap = new Map(customers.map((item) => [item.id, item]));

	return bookings.map((item) => ({
		...item,
		service: serviceMap.get(item.serviceId) ?? null,
		customer: customerMap.get(item.customerId) ?? null
	}));
}

export function shouldArchiveBooking(
	bookingRecord: Awaited<ReturnType<typeof getBookingsForWorkspace>>[number],
	now: Date,
	archiveAfterDays = 30
) {
	if (bookingRecord.archivedAt) {
		return true;
	}

	if (bookingRecord.status === 'scheduled') {
		return false;
	}

	const archivedAt = bookingRecord.cancelledAt ?? bookingRecord.completedAt;
	if (!archivedAt) {
		return false;
	}

	const archiveThreshold = new Date(archivedAt);
	archiveThreshold.setDate(archiveThreshold.getDate() + archiveAfterDays);
	return archiveThreshold <= now;
}

async function getOccupiedBookingsForRange(
	workspaceId: string,
	from: Date,
	to: Date,
	excludeBookingId?: string
) {
	const conditions = [
		eq(booking.workspaceId, workspaceId),
		eq(booking.status, 'scheduled'),
		or(
			and(gte(booking.startAt, from), lt(booking.startAt, to)),
			and(gte(booking.endAt, from), lt(booking.endAt, to)),
			and(lt(booking.startAt, from), gte(booking.endAt, to))
		)
	];

	if (excludeBookingId) {
		conditions.push(ne(booking.id, excludeBookingId));
	}

	const bookings = await db.query.booking.findMany({
		where: and(...conditions)
	});

	if (bookings.length === 0) {
		return [];
	}

	const serviceIds = [...new Set(bookings.map((item) => item.serviceId))];
	const bookedServices = await db.query.service.findMany({
		where: inArray(service.id, serviceIds)
	});
	const serviceMap = new Map(bookedServices.map((item) => [item.id, item]));

	return bookings.map((item) => {
		const bookedService = serviceMap.get(item.serviceId);
		const bufferBefore = bookedService?.bufferBeforeMinutes ?? 0;
		const bufferAfter = bookedService?.bufferAfterMinutes ?? 0;

		return {
			...item,
			blockedStart: new Date(item.startAt.getTime() - bufferBefore * MINUTE),
			blockedEnd: new Date(item.endAt.getTime() + bufferAfter * MINUTE)
		};
	});
}

async function getAvailabilityWindowsForDate(workspaceId: string, targetDateKey: string, dayOfWeek: number) {
	const override = await db.query.availabilityOverride.findFirst({
		where: and(
			eq(availabilityOverride.workspaceId, workspaceId),
			eq(availabilityOverride.overrideDate, targetDateKey)
		)
	});

	if (override) {
		if (override.isUnavailable) {
			return [];
		}

		return db.query.availabilityOverrideWindow.findMany({
			where: eq(availabilityOverrideWindow.overrideId, override.id),
			orderBy: (availabilityOverrideWindow, { asc }) => [
				asc(availabilityOverrideWindow.startTime),
				asc(availabilityOverrideWindow.endTime)
			]
		});
	}

	return db.query.weeklyAvailability.findMany({
		where: and(
			eq(weeklyAvailability.workspaceId, workspaceId),
			eq(weeklyAvailability.dayOfWeek, dayOfWeek),
			eq(weeklyAvailability.isActive, true)
		),
		orderBy: (weeklyAvailability, { asc }) => [
			asc(weeklyAvailability.startTime),
			asc(weeklyAvailability.endTime)
		]
	});
}

export async function generateSlotsForService(input: {
	workspace: PublicWorkspace;
	service: PublicService;
	dateKey: string;
	now?: Date;
	excludeBookingId?: string;
}) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateKey)) {
		return [];
	}

	const now = input.now ?? new Date();
	const todayKey = getDateKeyInTimeZone(now, input.workspace.timezone);
	const lastBookableKey = addDaysToDateKey(todayKey, input.workspace.bookingWindowDays);

	if (input.dateKey < todayKey || input.dateKey > lastBookableKey) {
		return [];
	}

	const midday = zonedDateTimeToUtc(input.dateKey, '12:00', input.workspace.timezone);
	const dayOfWeek = getZonedParts(midday, input.workspace.timezone).weekday;

	const windows = await getAvailabilityWindowsForDate(
		input.workspace.id,
		input.dateKey,
		dayOfWeek
	);

	if (windows.length === 0) {
		return [];
	}

	const occupied = await getOccupiedBookingsForRange(
		input.workspace.id,
		zonedDateTimeToUtc(input.dateKey, '00:00', input.workspace.timezone),
		zonedDateTimeToUtc(addDaysToDateKey(input.dateKey, 1), '00:00', input.workspace.timezone),
		input.excludeBookingId
	);

	const earliestStart = new Date(now.getTime() + input.workspace.minNoticeMinutes * MINUTE);
	const slots: { startAt: Date; endAt: Date; label: string }[] = [];

	for (const window of windows) {
		const windowStartMinutes = parseTimeToMinutes(window.startTime);
		const windowEndMinutes = parseTimeToMinutes(window.endTime);

		for (
			let startMinutes = windowStartMinutes;
			startMinutes + input.service.durationMinutes <= windowEndMinutes;
			startMinutes += input.service.durationMinutes
		) {
			const hours = Math.floor(startMinutes / 60)
				.toString()
				.padStart(2, '0');
			const minutes = (startMinutes % 60).toString().padStart(2, '0');
			const startAt = zonedDateTimeToUtc(
				input.dateKey,
				`${hours}:${minutes}`,
				input.workspace.timezone
			);
			const endAt = new Date(startAt.getTime() + input.service.durationMinutes * MINUTE);

			if (startAt < earliestStart) {
				continue;
			}

			const candidateBlockedStart = new Date(
				startAt.getTime() - input.service.bufferBeforeMinutes * MINUTE
			);
			const candidateBlockedEnd = new Date(
				endAt.getTime() + input.service.bufferAfterMinutes * MINUTE
			);

			const hasConflict = occupied.some(
				(booking) =>
					candidateBlockedStart < booking.blockedEnd && candidateBlockedEnd > booking.blockedStart
			);

			if (!hasConflict) {
				slots.push({
					startAt,
					endAt,
					label: formatTimeInTimeZone(startAt, input.workspace.timezone)
				});
			}
		}
	}

	if (input.workspace.maxBookingsPerDay !== null && occupied.length >= input.workspace.maxBookingsPerDay) {
		return [];
	}

	return slots;
}

function buildZohoMeetingInput(input: {
	workspace: PublicWorkspace;
	service: PublicService;
	bookingRecord: typeof booking.$inferSelect;
	startAt: Date;
	endAt: Date;
}) {
	const topicTemplate = input.workspace.zohoDefaultMeetingTopic || input.service.name;
	const topic = topicTemplate.replaceAll('{customer_name}', input.bookingRecord.customerNameSnapshot);
	const agenda =
		input.workspace.zohoDefaultAgenda ||
		input.bookingRecord.customerNotes ||
		`Booking for ${input.service.name}`;
	const participants = input.workspace.zohoAddAttendeeEmails
		? [{ email: input.bookingRecord.customerEmailSnapshot }]
		: [];

	return {
		dataCenter: input.workspace.zohoDataCenter,
		zsoid: input.workspace.zohoZsoid!,
		presenter: input.workspace.zohoPresenterUserId!,
		topic,
		agenda,
		startTime: formatZohoStartTime(input.startAt, input.workspace.timezone),
		durationMs: input.endAt.getTime() - input.startAt.getTime(),
		timezone: input.workspace.timezone,
		xZsource: input.workspace.zohoXZsource || input.workspace.name,
		participants
	};
}

function shouldSyncZohoMeeting(
	workspace: PublicWorkspace,
	bookingRecord: typeof booking.$inferSelect
) {
	return Boolean(
		bookingRecord.zohoMeetingKey &&
			workspace.zohoDataCenter &&
			workspace.zohoZsoid &&
			workspace.zohoPresenterUserId
	);
}

function getZohoMeetingKeyFromPayload(payload: string | null) {
	if (!payload) {
		return null;
	}

	try {
		const parsed = JSON.parse(payload) as {
			session?: {
				meetingKey?: string | number | null;
			};
		};
		const meetingKey = parsed.session?.meetingKey;
		return meetingKey == null ? null : meetingKey.toString();
	} catch {
		return null;
	}
}

function getStoredZohoMeetingKey(bookingRecord: typeof booking.$inferSelect) {
	return bookingRecord.zohoMeetingKey ?? getZohoMeetingKeyFromPayload(bookingRecord.zohoMeetingPayload);
}

function createBookingManageToken() {
	return randomBytes(24).toString('base64url');
}

async function getBookingCountForService(input: {
	workspaceId: string;
	serviceId: string;
	customerId?: string | null;
	customerAccountId?: string | null;
}) {
	const customerCondition = input.customerAccountId
		? eq(booking.customerAccountId, input.customerAccountId)
		: input.customerId
			? eq(booking.customerId, input.customerId)
			: eq(booking.id, '');

	const [result] = await db
		.select({ value: count() })
		.from(booking)
		.where(
			and(
				eq(booking.workspaceId, input.workspaceId),
				eq(booking.serviceId, input.serviceId),
				customerCondition
			)
		);

	return Number(result?.value ?? 0);
}

function isCustomerChangeWindowOpen(workspaceRecord: PublicWorkspace, bookingRecord: typeof booking.$inferSelect) {
	const cutoffTime = new Date(
		new Date(bookingRecord.startAt).getTime() - workspaceRecord.customerChangeCutoffMinutes * MINUTE
	);

	return Date.now() <= cutoffTime.getTime();
}

function assertCustomerCanChangeBooking(
	workspaceRecord: PublicWorkspace,
	bookingRecord: typeof booking.$inferSelect
) {
	if (!isCustomerChangeWindowOpen(workspaceRecord, bookingRecord)) {
		throw new Error('This booking can no longer be changed online.');
	}
}

function shouldDeleteZohoMeeting(
	workspace: PublicWorkspace,
	bookingRecord: typeof booking.$inferSelect
) {
	return Boolean(getStoredZohoMeetingKey(bookingRecord) && workspace.zohoDataCenter && workspace.zohoZsoid);
}

export async function createBookingForPublicPage(input: {
	workspace: PublicWorkspace;
	service: PublicService;
	startAt: Date;
	name: string;
	email: string;
	notes: string;
	customerAccountId?: string | null;
}) {
	const slots = await generateSlotsForService({
		workspace: input.workspace,
		service: input.service,
		dateKey: getDateKeyInTimeZone(input.startAt, input.workspace.timezone)
	});
	const matchingSlot = slots.find((slot) => slot.startAt.getTime() === input.startAt.getTime());

	if (!matchingSlot) {
		return null;
	}

	let existingCustomer = await db.query.customer.findFirst({
		where: and(eq(customer.workspaceId, input.workspace.id), eq(customer.email, input.email))
	});

	if (!existingCustomer) {
		const [createdCustomer] = await db
			.insert(customer)
			.values({
				workspaceId: input.workspace.id,
				name: input.name,
				email: input.email
			})
			.returning();
		existingCustomer = createdCustomer;
	} else if (existingCustomer.name !== input.name) {
		const [updatedCustomer] = await db
			.update(customer)
			.set({
				name: input.name,
				updatedAt: new Date()
			})
			.where(eq(customer.id, existingCustomer.id))
			.returning();
		existingCustomer = updatedCustomer;
	}

	if (!input.service.allowGuestBooking && !input.customerAccountId) {
		throw new Error('This service requires a customer account before booking.');
	}

	if (input.service.requiresCustomerAccount && !input.customerAccountId) {
		throw new Error('Please sign in to book this service.');
	}

	if (input.service.maxBookingsPerCustomer !== null) {
		const existingBookingsForService = await getBookingCountForService({
			workspaceId: input.workspace.id,
			serviceId: input.service.id,
			customerId: existingCustomer.id,
			customerAccountId: input.customerAccountId ?? null
		});

		if (existingBookingsForService >= input.service.maxBookingsPerCustomer) {
			throw new Error('This service has reached its booking limit for this customer.');
		}
	}

	let createdBooking: typeof booking.$inferSelect;

	try {
		const [insertedBooking] = await db
			.insert(booking)
			.values({
				workspaceId: input.workspace.id,
				serviceId: input.service.id,
				customerId: existingCustomer.id,
				customerAccountId: input.customerAccountId ?? null,
				startAt: matchingSlot.startAt,
				endAt: matchingSlot.endAt,
				customerNameSnapshot: input.name,
				customerEmailSnapshot: input.email,
				customerNotes: input.notes || null,
				manageToken: createBookingManageToken()
			})
			.returning();

		createdBooking = insertedBooking;
	} catch (error) {
		if (isBookingOverlapConstraintError(error)) {
			return null;
		}

		throw error;
	}

	if (
		input.workspace.zohoAutoCreateMeetings &&
		input.workspace.zohoDataCenter &&
		input.workspace.zohoZsoid &&
		input.workspace.zohoPresenterUserId
	) {
		try {
			const topicTemplate = input.workspace.zohoDefaultMeetingTopic || input.service.name;
			const topic = topicTemplate.replaceAll('{customer_name}', input.name);
			const agenda = input.workspace.zohoDefaultAgenda || input.notes || `Booking for ${input.service.name}`;
			const participants = input.workspace.zohoAddAttendeeEmails ? [{ email: input.email }] : [];
			const zohoMeeting = await createZohoMeeting({
				dataCenter: input.workspace.zohoDataCenter,
				zsoid: input.workspace.zohoZsoid,
				presenter: input.workspace.zohoPresenterUserId,
				topic,
				agenda,
				startTime: formatZohoStartTime(matchingSlot.startAt, input.workspace.timezone),
				durationMs: input.service.durationMinutes * MINUTE,
				timezone: input.workspace.timezone,
				xZsource: input.workspace.zohoXZsource || input.workspace.name,
				participants
			});
			const session = zohoMeeting.payload?.session;

			const [updatedBooking] = await db
				.update(booking)
				.set({
					zohoMeetingKey: session?.meetingKey?.toString() ?? null,
					zohoJoinLink: session?.joinLink ?? null,
					zohoStartLink: session?.startLink ?? null,
					zohoMeetingPayload: JSON.stringify(zohoMeeting.payload),
					updatedAt: new Date()
				})
				.where(eq(booking.id, createdBooking.id))
				.returning();

			return updatedBooking;
		} catch (error) {
			const [updatedBooking] = await db
				.update(booking)
				.set({
					zohoMeetingPayload: JSON.stringify({
						error: error instanceof Error ? error.message : 'Zoho meeting creation failed.'
					}),
					updatedAt: new Date()
				})
				.where(eq(booking.id, createdBooking.id))
				.returning();

			return updatedBooking;
		}
	}

	return createdBooking;
}

export async function completeBookingForWorkspace(workspaceId: string, bookingId: string) {
	const existingBooking = await db.query.booking.findFirst({
		where: and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceId))
	});

	if (!existingBooking) {
		return null;
	}

	if (existingBooking.status !== 'scheduled') {
		return existingBooking;
	}

	const [updatedBooking] = await db
		.update(booking)
		.set({
			status: 'completed',
			completedAt: new Date(),
			archivedAt: null,
			updatedAt: new Date()
		})
		.where(and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceId)))
		.returning();

	return updatedBooking;
}

export async function getCustomerManageContext(manageToken: string) {
	const bookingRecord = await db.query.booking.findFirst({
		where: eq(booking.manageToken, manageToken)
	});

	if (!bookingRecord) {
		return null;
	}

	const workspaceRecord = await db.query.workspace.findFirst({
		where: eq(workspace.id, bookingRecord.workspaceId)
	});
	const serviceRecord = await db.query.service.findFirst({
		where: eq(service.id, bookingRecord.serviceId)
	});

	if (!workspaceRecord || !serviceRecord) {
		return null;
	}

	return {
		booking: bookingRecord,
		workspace: workspaceRecord,
		service: serviceRecord,
		canChange: bookingRecord.status === 'scheduled' && isCustomerChangeWindowOpen(workspaceRecord, bookingRecord)
	};
}

export async function cancelBookingForCustomer(manageToken: string) {
	const context = await getCustomerManageContext(manageToken);

	if (!context) {
		return null;
	}

	if (context.booking.status !== 'scheduled') {
		return context.booking;
	}

	assertCustomerCanChangeBooking(context.workspace, context.booking);

	return cancelBookingForWorkspace(context.workspace, context.booking.id);
}

export async function rescheduleBookingForCustomer(input: {
	manageToken: string;
	dateKey: string;
	time: string;
}) {
	const context = await getCustomerManageContext(input.manageToken);

	if (!context) {
		return null;
	}

	if (context.booking.status !== 'scheduled') {
		return context.booking;
	}

	assertCustomerCanChangeBooking(context.workspace, context.booking);

	return rescheduleBookingForWorkspace({
		workspace: context.workspace,
		bookingId: context.booking.id,
		dateKey: input.dateKey,
		time: input.time
	});
}

export async function cancelBookingForWorkspace(
	workspaceRecord: PublicWorkspace,
	bookingId: string
) {
	const existingBooking = await db.query.booking.findFirst({
		where: and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceRecord.id))
	});

	if (!existingBooking) {
		return null;
	}

	if (existingBooking.status !== 'scheduled') {
		return existingBooking;
	}

	const zohoMeetingKey = getStoredZohoMeetingKey(existingBooking);
	const shouldRemoveZohoMeeting = shouldDeleteZohoMeeting(workspaceRecord, existingBooking);

	if (shouldRemoveZohoMeeting) {
		await deleteZohoMeeting({
			dataCenter: workspaceRecord.zohoDataCenter,
			zsoid: workspaceRecord.zohoZsoid!,
			meetingKey: zohoMeetingKey!,
			xZsource: workspaceRecord.zohoXZsource || workspaceRecord.name
		});
	}

	const [updatedBooking] = await db
		.update(booking)
		.set({
			status: 'cancelled',
			cancelledAt: new Date(),
			archivedAt: null,
			zohoMeetingKey: shouldRemoveZohoMeeting ? null : existingBooking.zohoMeetingKey,
			zohoJoinLink: shouldRemoveZohoMeeting ? null : existingBooking.zohoJoinLink,
			zohoStartLink: shouldRemoveZohoMeeting ? null : existingBooking.zohoStartLink,
			zohoMeetingPayload: shouldRemoveZohoMeeting ? null : existingBooking.zohoMeetingPayload,
			updatedAt: new Date()
		})
		.where(and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceRecord.id)))
		.returning();

	return updatedBooking;
}

export async function rescheduleBookingForWorkspace(input: {
	workspace: PublicWorkspace;
	bookingId: string;
	dateKey: string;
	time: string;
}) {
	const existingBooking = await db.query.booking.findFirst({
		where: and(eq(booking.id, input.bookingId), eq(booking.workspaceId, input.workspace.id))
	});

	if (!existingBooking) {
		return null;
	}

	if (existingBooking.status !== 'scheduled') {
		return existingBooking;
	}

	const bookedService = await db.query.service.findFirst({
		where: and(eq(service.id, existingBooking.serviceId), eq(service.workspaceId, input.workspace.id))
	});

	if (!bookedService) {
		throw new Error('The service attached to this booking could not be found.');
	}

	const startAt = zonedDateTimeToUtc(input.dateKey, input.time, input.workspace.timezone);
	const slots = await generateSlotsForService({
		workspace: input.workspace,
		service: bookedService,
		dateKey: input.dateKey,
		excludeBookingId: existingBooking.id
	});
	const matchingSlot = slots.find((slot) => slot.startAt.getTime() === startAt.getTime());

	if (!matchingSlot) {
		throw new Error('That new time is not available under the current booking rules.');
	}

	let zohoUpdate:
		| {
				payload: {
					session?: {
						meetingKey?: string | number;
						joinLink?: string;
						startLink?: string;
					};
				} | null;
		  }
		| undefined;

	if (shouldSyncZohoMeeting(input.workspace, existingBooking)) {
		zohoUpdate = await updateZohoMeeting({
			...buildZohoMeetingInput({
				workspace: input.workspace,
				service: bookedService,
				bookingRecord: existingBooking,
				startAt: matchingSlot.startAt,
				endAt: matchingSlot.endAt
			}),
			meetingKey: existingBooking.zohoMeetingKey!
		});
	}

	let updatedBooking: typeof booking.$inferSelect;

	try {
		const [nextBooking] = await db
			.update(booking)
			.set({
				startAt: matchingSlot.startAt,
				endAt: matchingSlot.endAt,
				archivedAt: null,
				zohoMeetingKey:
					zohoUpdate?.payload?.session?.meetingKey?.toString() ?? existingBooking.zohoMeetingKey,
				zohoJoinLink: zohoUpdate?.payload?.session?.joinLink ?? existingBooking.zohoJoinLink,
				zohoStartLink: zohoUpdate?.payload?.session?.startLink ?? existingBooking.zohoStartLink,
				zohoMeetingPayload: zohoUpdate?.payload
					? JSON.stringify(zohoUpdate.payload)
					: existingBooking.zohoMeetingPayload,
				updatedAt: new Date()
			})
			.where(and(eq(booking.id, input.bookingId), eq(booking.workspaceId, input.workspace.id)))
			.returning();

		updatedBooking = nextBooking;
	} catch (error) {
		if (isBookingOverlapConstraintError(error)) {
			throw new Error('That new time is no longer available. Please choose another time.');
		}

		throw error;
	}

	return updatedBooking;
}

export async function archiveBookingForWorkspace(workspaceId: string, bookingId: string) {
	const existingBooking = await db.query.booking.findFirst({
		where: and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceId))
	});

	if (!existingBooking) {
		return null;
	}

	if (existingBooking.status === 'scheduled') {
		throw new Error('Scheduled bookings cannot be archived.');
	}

	if (existingBooking.archivedAt) {
		return existingBooking;
	}

	const [updatedBooking] = await db
		.update(booking)
		.set({
			archivedAt: new Date(),
			updatedAt: new Date()
		})
		.where(and(eq(booking.id, bookingId), eq(booking.workspaceId, workspaceId)))
		.returning();

	return updatedBooking;
}
