import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockBooking = {
	id: string;
	workspaceId: string;
	serviceId: string;
	status: 'scheduled' | 'cancelled' | 'completed';
	startAt: Date;
	endAt: Date;
	customerId: string;
	customerNameSnapshot: string;
	customerEmailSnapshot: string;
	customerNotes: string | null;
	zohoMeetingKey: string | null;
	zohoJoinLink: string | null;
	zohoStartLink: string | null;
	zohoMeetingPayload: string | null;
};

type MockService = {
	id: string;
	workspaceId: string;
	name: string;
	durationMinutes: number;
	bufferBeforeMinutes: number;
	bufferAfterMinutes: number;
};

type MockCustomer = {
	id: string;
	workspaceId: string;
	name: string;
	email: string;
};

const mockState = vi.hoisted(() => ({
	override: null as { id: string; isUnavailable: boolean } | null,
	overrideWindows: [] as Array<{ startTime: string; endTime: string }>,
	weeklyWindows: [] as Array<{ startTime: string; endTime: string }>,
	bookings: [] as MockBooking[],
	services: [] as MockService[],
	findFirstCustomer: null as MockCustomer | null,
	findFirstBooking: null as MockBooking | null,
	findFirstService: null as MockService | null,
	lastUpdateValues: null as Record<string, unknown> | null,
	nextInsertResults: [] as Array<unknown[]>,
	nextUpdateResults: [] as Array<unknown[]>,
	nextInsertErrors: [] as unknown[],
	nextUpdateErrors: [] as unknown[]
}));

const zohoMocks = vi.hoisted(() => ({
	createZohoMeeting: vi.fn(),
	deleteZohoMeeting: vi.fn(),
	formatZohoStartTime: vi.fn((date: Date) => date.toISOString()),
	updateZohoMeeting: vi.fn()
}));

const dbMocks = vi.hoisted(() => {
	const returning = vi.fn(async () => {
		const nextUpdateError = mockState.nextUpdateErrors.shift();
		if (nextUpdateError) {
			const error = nextUpdateError;
			throw error;
		}

		const queuedResult = mockState.nextUpdateResults.shift();
		if (queuedResult) {
			return queuedResult;
		}

		if (mockState.findFirstBooking) {
			return [mockState.findFirstBooking];
		}

		return [];
	});

	const where = vi.fn(() => ({
		returning
	}));

	const set = vi.fn((values: Record<string, unknown>) => {
		mockState.lastUpdateValues = values;

		if (mockState.findFirstBooking) {
			mockState.findFirstBooking = {
				...mockState.findFirstBooking,
				...values
			};
		}

		return {
			where
		};
	});

	const update = vi.fn(() => ({
		set
	}));

	const insertReturning = vi.fn(async () => {
		const nextInsertError = mockState.nextInsertErrors.shift();
		if (nextInsertError) {
			const error = nextInsertError;
			throw error;
		}

		return mockState.nextInsertResults.shift() ?? [];
	});

	const insertValues = vi.fn(() => ({
		returning: insertReturning
	}));

	const insert = vi.fn(() => ({
		values: insertValues
	}));

	return {
		insert,
		insertReturning,
		insertValues,
		update,
		set,
		where,
		returning
	};
});

vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			availabilityOverride: {
				findFirst: vi.fn(async () => mockState.override)
			},
			availabilityOverrideWindow: {
				findMany: vi.fn(async () => mockState.overrideWindows)
			},
			weeklyAvailability: {
				findMany: vi.fn(async () => mockState.weeklyWindows)
			},
			booking: {
				findMany: vi.fn(async () => mockState.bookings),
				findFirst: vi.fn(async () => mockState.findFirstBooking)
			},
			customer: {
				findFirst: vi.fn(async () => mockState.findFirstCustomer)
			},
			service: {
				findMany: vi.fn(async () => mockState.services),
				findFirst: vi.fn(async () => mockState.findFirstService)
			}
		},
		insert: dbMocks.insert,
		update: dbMocks.update
	}
}));

vi.mock('$lib/server/workspace', () => ({
	getWorkspaceBySlug: vi.fn()
}));

vi.mock('$lib/server/zoho', () => zohoMocks);

import {
	createBookingForPublicPage,
	cancelBookingForWorkspace,
	completeBookingForWorkspace,
	generateSlotsForService,
	parseTimeToMinutes,
	rescheduleBookingForWorkspace
} from './bookings';

function createWorkspace(overrides: Record<string, unknown> = {}) {
	return {
		id: 'workspace-1',
		name: 'Pride N Purpose',
		slug: 'lets-meet',
		timezone: 'UTC',
		minNoticeMinutes: 120,
		bookingWindowDays: 60,
		maxBookingsPerDay: null,
		zohoDataCenter: null,
		zohoZsoid: null,
		zohoPresenterUserId: null,
		zohoXZsource: null,
		zohoDefaultMeetingTopic: null,
		zohoDefaultAgenda: null,
		zohoAddAttendeeEmails: false,
		...overrides
	} as Parameters<typeof generateSlotsForService>[0]['workspace'];
}

function createService(overrides: Record<string, unknown> = {}) {
	return {
		id: 'service-1',
		workspaceId: 'workspace-1',
		name: 'Discovery Session',
		durationMinutes: 60,
		bufferBeforeMinutes: 0,
		bufferAfterMinutes: 0,
		...overrides
	} as Parameters<typeof generateSlotsForService>[0]['service'];
}

function createBooking(overrides: Partial<MockBooking> = {}) {
	return {
		id: 'booking-1',
		workspaceId: 'workspace-1',
		serviceId: 'service-1',
		status: 'scheduled',
		startAt: new Date('2026-04-11T09:00:00.000Z'),
		endAt: new Date('2026-04-11T10:00:00.000Z'),
		customerId: 'customer-1',
		customerNameSnapshot: 'Jane Example',
		customerEmailSnapshot: 'jane@example.com',
		customerNotes: 'Looking forward to it',
		zohoMeetingKey: null,
		zohoJoinLink: null,
		zohoStartLink: null,
		zohoMeetingPayload: null,
		...overrides
	} satisfies MockBooking;
}

function createCustomer(overrides: Partial<MockCustomer> = {}) {
	return {
		id: 'customer-1',
		workspaceId: 'workspace-1',
		name: 'Jane Example',
		email: 'jane@example.com',
		...overrides
	} satisfies MockCustomer;
}

describe('parseTimeToMinutes', () => {
	it('converts a clock string into total minutes', () => {
		expect(parseTimeToMinutes('09:30')).toBe(570);
		expect(parseTimeToMinutes('00:15')).toBe(15);
	});
});

describe('generateSlotsForService', () => {
	beforeEach(() => {
		mockState.override = null;
		mockState.overrideWindows = [];
		mockState.weeklyWindows = [{ startTime: '09:00', endTime: '12:00' }];
		mockState.bookings = [];
		mockState.services = [];
		mockState.findFirstCustomer = null;
		mockState.findFirstBooking = null;
		mockState.findFirstService = null;
		mockState.lastUpdateValues = null;
		mockState.nextInsertResults = [];
		mockState.nextUpdateResults = [];
		mockState.nextInsertErrors = [];
		mockState.nextUpdateErrors = [];
	});

	it('returns no slots outside the booking window', async () => {
		const workspace = createWorkspace({ bookingWindowDays: 2 });
		const service = createService();

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-15',
			now: new Date('2026-04-10T08:00:00.000Z')
		});

		expect(slots).toEqual([]);
	});

	it('respects minimum notice on the same day', async () => {
		const workspace = createWorkspace({ minNoticeMinutes: 120 });
		const service = createService();

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-10',
			now: new Date('2026-04-10T08:30:00.000Z')
		});

		expect(slots.map((slot) => slot.label)).toEqual(['11:00 AM']);
	});

	it('blocks overlapping slots when an existing booking buffer extends the occupied time', async () => {
		const workspace = createWorkspace();
		const service = createService();

		mockState.bookings = [
			createBooking({
				id: 'booking-existing',
				serviceId: 'existing-service',
				startAt: new Date('2026-04-11T10:00:00.000Z'),
				endAt: new Date('2026-04-11T11:00:00.000Z')
			})
		];
		mockState.services = [
			createService({
				id: 'existing-service',
				bufferBeforeMinutes: 0,
				bufferAfterMinutes: 30
			})
		];

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-11',
			now: new Date('2026-04-10T08:00:00.000Z')
		});

		expect(slots.map((slot) => slot.label)).toEqual(['9:00 AM']);
	});

	it('stops offering slots when the daily booking cap is already reached', async () => {
		const workspace = createWorkspace({ maxBookingsPerDay: 1 });
		const service = createService();

		mockState.bookings = [
			createBooking({
				id: 'booking-existing',
				serviceId: 'existing-service'
			})
		];
		mockState.services = [
			createService({
				id: 'existing-service',
				bufferBeforeMinutes: 0,
				bufferAfterMinutes: 0
			})
		];

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-11',
			now: new Date('2026-04-10T08:00:00.000Z')
		});

		expect(slots).toEqual([]);
	});

	it('returns no slots when an override marks the date unavailable', async () => {
		const workspace = createWorkspace();
		const service = createService();

		mockState.override = { id: 'override-1', isUnavailable: true };

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-11',
			now: new Date('2026-04-10T08:00:00.000Z')
		});

		expect(slots).toEqual([]);
	});

	it('uses override windows instead of weekly availability when a custom date override exists', async () => {
		const workspace = createWorkspace();
		const service = createService();

		mockState.override = { id: 'override-1', isUnavailable: false };
		mockState.overrideWindows = [{ startTime: '13:00', endTime: '15:00' }];

		const slots = await generateSlotsForService({
			workspace,
			service,
			dateKey: '2026-04-11',
			now: new Date('2026-04-10T08:00:00.000Z')
		});

		expect(slots.map((slot) => slot.label)).toEqual(['1:00 PM', '2:00 PM']);
	});
});

describe('createBookingForPublicPage', () => {
	beforeEach(() => {
		mockState.override = null;
		mockState.overrideWindows = [];
		mockState.weeklyWindows = [{ startTime: '09:00', endTime: '12:00' }];
		mockState.bookings = [];
		mockState.services = [];
		mockState.findFirstCustomer = null;
		mockState.findFirstBooking = null;
		mockState.findFirstService = null;
		mockState.lastUpdateValues = null;
		mockState.nextInsertResults = [];
		mockState.nextUpdateResults = [];
		mockState.nextInsertErrors = [];
		mockState.nextUpdateErrors = [];
		dbMocks.insert.mockClear();
		dbMocks.insertValues.mockClear();
		dbMocks.insertReturning.mockClear();
		dbMocks.update.mockClear();
		dbMocks.set.mockClear();
		dbMocks.where.mockClear();
		dbMocks.returning.mockClear();
		zohoMocks.createZohoMeeting.mockReset();
		zohoMocks.formatZohoStartTime.mockClear();
	});

	it('returns null when the requested start time is no longer available', async () => {
		const workspace = createWorkspace();
		const service = createService();

		const result = await createBookingForPublicPage({
			workspace,
			service,
			startAt: new Date('2026-04-11T15:00:00.000Z'),
			name: 'Jane Example',
			email: 'jane@example.com',
			notes: ''
		});

		expect(result).toBeNull();
		expect(dbMocks.insert).not.toHaveBeenCalled();
	});

	it('creates a new customer and booking for an available slot', async () => {
		const workspace = createWorkspace();
		const service = createService();
		const createdCustomer = createCustomer();
		const createdBooking = createBooking();

		mockState.nextInsertResults = [[createdCustomer], [createdBooking]];

		const result = await createBookingForPublicPage({
			workspace,
			service,
			startAt: new Date('2026-04-11T09:00:00.000Z'),
			name: 'Jane Example',
			email: 'jane@example.com',
			notes: 'First conversation'
		});

		expect(dbMocks.insert).toHaveBeenCalledTimes(2);
		expect(result).toEqual(createdBooking);
	});

	it('updates an existing customer name before creating the booking', async () => {
		const workspace = createWorkspace();
		const service = createService();
		const existingCustomer = createCustomer({ name: 'Old Name' });
		const updatedCustomer = createCustomer({ name: 'Jane Example' });
		const createdBooking = createBooking();

		mockState.findFirstCustomer = existingCustomer;
		mockState.nextUpdateResults = [[updatedCustomer]];
		mockState.nextInsertResults = [[createdBooking]];

		const result = await createBookingForPublicPage({
			workspace,
			service,
			startAt: new Date('2026-04-11T09:00:00.000Z'),
			name: 'Jane Example',
			email: 'jane@example.com',
			notes: ''
		});

		expect(dbMocks.update).toHaveBeenCalledOnce();
		expect(mockState.lastUpdateValues).toMatchObject({
			name: 'Jane Example'
		});
		expect(result).toEqual(createdBooking);
	});

	it('stores Zoho meeting data when auto-create is enabled', async () => {
		const workspace = createWorkspace({
			zohoAutoCreateMeetings: true,
			zohoDataCenter: 'com',
			zohoZsoid: 'zsoid-1',
			zohoPresenterUserId: 'presenter-1',
			zohoXZsource: 'Pride N Purpose',
			zohoDefaultMeetingTopic: 'Session with {customer_name}',
			zohoDefaultAgenda: 'Purpose conversation',
			zohoAddAttendeeEmails: true
		});
		const service = createService();
		const createdCustomer = createCustomer();
		const createdBooking = createBooking();
		const syncedBooking = createBooking({
			zohoMeetingKey: 'meeting-123',
			zohoJoinLink: 'https://meet.zoho.com/join/123',
			zohoStartLink: 'https://meet.zoho.com/start/123',
			zohoMeetingPayload: JSON.stringify({
				session: {
					meetingKey: 'meeting-123',
					joinLink: 'https://meet.zoho.com/join/123',
					startLink: 'https://meet.zoho.com/start/123'
				}
			})
		});

		mockState.nextInsertResults = [[createdCustomer], [createdBooking]];
		mockState.nextUpdateResults = [[syncedBooking]];
		zohoMocks.createZohoMeeting.mockResolvedValue({
			payload: {
				session: {
					meetingKey: 'meeting-123',
					joinLink: 'https://meet.zoho.com/join/123',
					startLink: 'https://meet.zoho.com/start/123'
				}
			}
		});

		const result = await createBookingForPublicPage({
			workspace,
			service,
			startAt: new Date('2026-04-11T09:00:00.000Z'),
			name: 'Jane Example',
			email: 'jane@example.com',
			notes: 'First conversation'
		});

		expect(zohoMocks.createZohoMeeting).toHaveBeenCalledOnce();
		expect(zohoMocks.createZohoMeeting.mock.calls[0]?.[0]).toMatchObject({
			dataCenter: 'com',
			zsoid: 'zsoid-1',
			presenter: 'presenter-1',
			topic: 'Session with Jane Example',
			agenda: 'Purpose conversation',
			timezone: 'UTC',
			xZsource: 'Pride N Purpose',
			participants: [{ email: 'jane@example.com' }]
		});
		expect(result).toEqual(syncedBooking);
	});

	it('returns null when the database overlap constraint rejects a race-condition insert', async () => {
		const workspace = createWorkspace();
		const service = createService();
		const createdCustomer = createCustomer();

		mockState.nextInsertResults = [[createdCustomer]];
		mockState.nextInsertErrors = [
			null,
			{
			code: '23P01',
			constraint_name: 'booking_workspace_scheduled_no_overlap'
			}
		];

		const result = await createBookingForPublicPage({
			workspace,
			service,
			startAt: new Date('2026-04-11T09:00:00.000Z'),
			name: 'Jane Example',
			email: 'jane@example.com',
			notes: ''
		});

		expect(result).toBeNull();
	});
});

describe('booking state changes', () => {
	beforeEach(() => {
		mockState.findFirstCustomer = null;
		mockState.findFirstBooking = null;
		mockState.findFirstService = null;
		mockState.lastUpdateValues = null;
		mockState.nextInsertResults = [];
		mockState.nextUpdateResults = [];
		mockState.nextInsertErrors = [];
		mockState.nextUpdateErrors = [];
		mockState.override = null;
		mockState.overrideWindows = [];
		mockState.weeklyWindows = [{ startTime: '09:00', endTime: '12:00' }];
		mockState.bookings = [];
		mockState.services = [];
		dbMocks.insert.mockClear();
		dbMocks.insertValues.mockClear();
		dbMocks.insertReturning.mockClear();
		dbMocks.update.mockClear();
		dbMocks.set.mockClear();
		dbMocks.where.mockClear();
		dbMocks.returning.mockClear();
		zohoMocks.deleteZohoMeeting.mockReset();
		zohoMocks.updateZohoMeeting.mockReset();
		zohoMocks.createZohoMeeting.mockReset();
		zohoMocks.formatZohoStartTime.mockClear();
	});

	it('marks a scheduled booking as completed', async () => {
		mockState.findFirstBooking = createBooking();

		const updatedBooking = await completeBookingForWorkspace('workspace-1', 'booking-1');

		expect(updatedBooking?.status).toBe('completed');
		expect(mockState.lastUpdateValues).toMatchObject({
			status: 'completed'
		});
		expect(mockState.lastUpdateValues?.completedAt).toBeInstanceOf(Date);
		expect(dbMocks.update).toHaveBeenCalledOnce();
	});

	it('cancels a booking locally when no Zoho sync is configured', async () => {
		const workspace = createWorkspace();
		mockState.findFirstBooking = createBooking({
			zohoJoinLink: 'https://meet.zoho.com/join/123',
			zohoStartLink: 'https://meet.zoho.com/start/123'
		});

		const updatedBooking = await cancelBookingForWorkspace(workspace, 'booking-1');

		expect(updatedBooking?.status).toBe('cancelled');
		expect(zohoMocks.deleteZohoMeeting).not.toHaveBeenCalled();
		expect(mockState.lastUpdateValues).toMatchObject({
			status: 'cancelled',
			zohoJoinLink: 'https://meet.zoho.com/join/123',
			zohoStartLink: 'https://meet.zoho.com/start/123'
		});
		expect(mockState.lastUpdateValues?.cancelledAt).toBeInstanceOf(Date);
	});

	it('cancels a booking and removes Zoho links when sync is configured', async () => {
		const workspace = createWorkspace({
			zohoDataCenter: 'com',
			zohoZsoid: 'zsoid-1',
			zohoPresenterUserId: 'presenter-1',
			zohoXZsource: 'Pride N Purpose'
		});
		mockState.findFirstBooking = createBooking({
			zohoMeetingKey: 'meeting-123',
			zohoJoinLink: 'https://meet.zoho.com/join/123',
			zohoStartLink: 'https://meet.zoho.com/start/123'
		});

		await cancelBookingForWorkspace(workspace, 'booking-1');

		expect(zohoMocks.deleteZohoMeeting).toHaveBeenCalledWith({
			dataCenter: 'com',
			zsoid: 'zsoid-1',
			meetingKey: 'meeting-123',
			xZsource: 'Pride N Purpose'
		});
		expect(mockState.lastUpdateValues).toMatchObject({
			status: 'cancelled',
			zohoJoinLink: null,
			zohoStartLink: null
		});
	});

	it('reschedules a booking and pushes the new time to Zoho', async () => {
		const workspace = createWorkspace({
			zohoDataCenter: 'com',
			zohoZsoid: 'zsoid-1',
			zohoPresenterUserId: 'presenter-1',
			zohoXZsource: 'Pride N Purpose',
			zohoDefaultMeetingTopic: 'Session with {customer_name}',
			zohoDefaultAgenda: 'Purpose conversation',
			zohoAddAttendeeEmails: true
		});
		const service = createService();

		mockState.findFirstBooking = createBooking({
			zohoMeetingKey: 'meeting-123',
			zohoJoinLink: 'https://meet.zoho.com/join/123',
			zohoStartLink: 'https://meet.zoho.com/start/123',
			zohoMeetingPayload: '{"session":{"meetingKey":"meeting-123"}}'
		});
		mockState.findFirstService = service;
		mockState.services = [service];
		zohoMocks.updateZohoMeeting.mockResolvedValue({
			payload: {
				session: {
					meetingKey: 'meeting-456',
					joinLink: 'https://meet.zoho.com/join/456',
					startLink: 'https://meet.zoho.com/start/456'
				}
			}
		});

		const updatedBooking = await rescheduleBookingForWorkspace({
			workspace,
			bookingId: 'booking-1',
			dateKey: '2026-04-11',
			time: '11:00'
		});

		expect(zohoMocks.updateZohoMeeting).toHaveBeenCalledOnce();
		expect(zohoMocks.updateZohoMeeting.mock.calls[0]?.[0]).toMatchObject({
			dataCenter: 'com',
			zsoid: 'zsoid-1',
			presenter: 'presenter-1',
			meetingKey: 'meeting-123',
			topic: 'Session with Jane Example',
			agenda: 'Purpose conversation',
			timezone: 'UTC',
			xZsource: 'Pride N Purpose',
			participants: [{ email: 'jane@example.com' }]
		});
		expect(mockState.lastUpdateValues).toMatchObject({
			startAt: new Date('2026-04-11T11:00:00.000Z'),
			endAt: new Date('2026-04-11T12:00:00.000Z'),
			zohoMeetingKey: 'meeting-456',
			zohoJoinLink: 'https://meet.zoho.com/join/456',
			zohoStartLink: 'https://meet.zoho.com/start/456',
			zohoMeetingPayload: JSON.stringify({
				session: {
					meetingKey: 'meeting-456',
					joinLink: 'https://meet.zoho.com/join/456',
					startLink: 'https://meet.zoho.com/start/456'
				}
			})
		});
		expect(updatedBooking?.startAt.toISOString()).toBe('2026-04-11T11:00:00.000Z');
	});

	it('throws when a reschedule target is no longer available', async () => {
		const workspace = createWorkspace();
		const service = createService();

		mockState.findFirstBooking = createBooking();
		mockState.findFirstService = service;
		mockState.weeklyWindows = [{ startTime: '09:00', endTime: '10:00' }];

		await expect(
			rescheduleBookingForWorkspace({
				workspace,
				bookingId: 'booking-1',
				dateKey: '2026-04-11',
				time: '11:00'
			})
		).rejects.toThrow('That new time is not available under the current booking rules.');
	});

	it('throws a friendly message when the database overlap constraint rejects a reschedule race', async () => {
		const workspace = createWorkspace();
		const service = createService();

		mockState.findFirstBooking = createBooking();
		mockState.findFirstService = service;
		mockState.nextUpdateErrors = [
			{
			code: '23P01',
			constraint_name: 'booking_workspace_scheduled_no_overlap'
			}
		];

		await expect(
			rescheduleBookingForWorkspace({
				workspace,
				bookingId: 'booking-1',
				dateKey: '2026-04-11',
				time: '11:00'
			})
		).rejects.toThrow('That new time is no longer available. Please choose another time.');
	});
});
