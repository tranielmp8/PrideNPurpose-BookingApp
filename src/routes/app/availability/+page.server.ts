import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	availabilityOverride,
	availabilityOverrideWindow,
	weeklyAvailability
} from '$lib/server/db/schema';
import {
	DAYS,
	compareTimes,
	getAvailabilityOverridesForWorkspace,
	getWeeklyAvailabilityForWorkspace,
	isValidTime,
	updateWorkspaceBookingRules
} from '$lib/server/availability';
import { getWorkspaceForUser } from '$lib/server/workspace';

function parsePositiveInteger(value: string) {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0) {
		return Number.NaN;
	}

	return parsed;
}

export const load = (async ({ parent }) => {
	const { workspace } = await parent();

		return {
			days: DAYS,
			weeklyAvailability: await getWeeklyAvailabilityForWorkspace(workspace.id),
			availabilityOverrides: await getAvailabilityOverridesForWorkspace(workspace.id),
			bookingRules: {
				minNoticeMinutes: workspace.minNoticeMinutes,
				customerChangeCutoffMinutes: workspace.customerChangeCutoffMinutes,
				bookingWindowDays: workspace.bookingWindowDays,
				maxBookingsPerDay: workspace.maxBookingsPerDay
			}
		};
}) satisfies ServerLoad;

export const actions: Actions = {
	updateBookingRules: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const minNoticeMinutes = parsePositiveInteger(
			formData.get('minNoticeMinutes')?.toString().trim() ?? ''
		);
		const customerChangeCutoffMinutes = parsePositiveInteger(
			formData.get('customerChangeCutoffMinutes')?.toString().trim() ?? ''
		);
		const bookingWindowDays = parsePositiveInteger(
			formData.get('bookingWindowDays')?.toString().trim() ?? ''
		);
		const maxBookingsRaw = formData.get('maxBookingsPerDay')?.toString().trim() ?? '';
		const maxBookingsPerDay = maxBookingsRaw ? parsePositiveInteger(maxBookingsRaw) : null;

		if (
			Number.isNaN(minNoticeMinutes) ||
			Number.isNaN(customerChangeCutoffMinutes) ||
			Number.isNaN(bookingWindowDays) ||
			(maxBookingsPerDay !== null && Number.isNaN(maxBookingsPerDay))
		) {
			return fail(400, {
				availabilityMessage: 'Booking rules must use whole numbers.'
			});
		}

		await updateWorkspaceBookingRules({
			workspaceId: workspace.id,
			minNoticeMinutes,
			customerChangeCutoffMinutes,
			bookingWindowDays,
			maxBookingsPerDay
		});

		return {
			availabilityMessage: 'Booking rules updated.'
		};
	},
	createWeeklyWindow: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const dayOfWeek = Number(formData.get('dayOfWeek')?.toString() ?? '');
		const startTime = formData.get('startTime')?.toString().trim() ?? '';
		const endTime = formData.get('endTime')?.toString().trim() ?? '';

		if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
			return fail(400, {
				availabilityMessage: 'Choose a valid day of the week.'
			});
		}

		if (!isValidTime(startTime) || !isValidTime(endTime) || compareTimes(startTime, endTime) >= 0) {
			return fail(400, {
				availabilityMessage: 'Weekly windows need valid start and end times.'
			});
		}

		await db.insert(weeklyAvailability).values({
			workspaceId: workspace.id,
			dayOfWeek,
			startTime,
			endTime
		});

		return {
			availabilityMessage: 'Weekly availability window added.'
		};
	},
	updateWeeklyWindow: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const availabilityId = formData.get('availabilityId')?.toString() ?? '';
		const startTime = formData.get('startTime')?.toString().trim() ?? '';
		const endTime = formData.get('endTime')?.toString().trim() ?? '';

		if (!availabilityId || !isValidTime(startTime) || !isValidTime(endTime) || compareTimes(startTime, endTime) >= 0) {
			return fail(400, {
				availabilityMessage: 'Weekly windows need valid start and end times.'
			});
		}

		await db
			.update(weeklyAvailability)
			.set({ startTime, endTime })
			.where(
				and(eq(weeklyAvailability.id, availabilityId), eq(weeklyAvailability.workspaceId, workspace.id))
			);

		return {
			availabilityMessage: 'Weekly availability window updated.'
		};
	},
	deleteWeeklyWindow: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const availabilityId = formData.get('availabilityId')?.toString() ?? '';

		if (!availabilityId) {
			return fail(400, {
				availabilityMessage: 'Missing weekly availability row.'
			});
		}

		await db
			.delete(weeklyAvailability)
			.where(
				and(eq(weeklyAvailability.id, availabilityId), eq(weeklyAvailability.workspaceId, workspace.id))
			);

		return {
			availabilityMessage: 'Weekly availability window removed.'
		};
	},
	createOverride: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const overrideDate = formData.get('overrideDate')?.toString().trim() ?? '';
		const mode = formData.get('mode')?.toString() ?? 'unavailable';
		const startTime = formData.get('startTime')?.toString().trim() ?? '';
		const endTime = formData.get('endTime')?.toString().trim() ?? '';

		if (!overrideDate) {
			return fail(400, {
				availabilityMessage: 'Choose a date for the override.'
			});
		}

		if (mode === 'custom' && (!isValidTime(startTime) || !isValidTime(endTime) || compareTimes(startTime, endTime) >= 0)) {
			return fail(400, {
				availabilityMessage: 'Custom-date overrides need valid start and end times.'
			});
		}

		const [createdOverride] = await db
			.insert(availabilityOverride)
			.values({
				workspaceId: workspace.id,
				overrideDate,
				isUnavailable: mode !== 'custom'
			})
			.onConflictDoUpdate({
				target: [availabilityOverride.workspaceId, availabilityOverride.overrideDate],
				set: {
					isUnavailable: mode !== 'custom'
				}
			})
			.returning();

		await db
			.delete(availabilityOverrideWindow)
			.where(eq(availabilityOverrideWindow.overrideId, createdOverride.id));

		if (mode === 'custom') {
			await db.insert(availabilityOverrideWindow).values({
				overrideId: createdOverride.id,
				startTime,
				endTime
			});
		}

		return {
			availabilityMessage: mode === 'custom' ? 'Custom-date override saved.' : 'Blackout date saved.'
		};
	},
	deleteOverride: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		if (!workspace) {
			return fail(401, {
				availabilityMessage: 'Workspace not found.'
			});
		}
		const overrideId = formData.get('overrideId')?.toString() ?? '';

		if (!overrideId) {
			return fail(400, {
				availabilityMessage: 'Missing override selection.'
			});
		}

		await db
			.delete(availabilityOverride)
			.where(
				and(eq(availabilityOverride.id, overrideId), eq(availabilityOverride.workspaceId, workspace.id))
			);

		return {
			availabilityMessage: 'Date override removed.'
		};
	}
};
