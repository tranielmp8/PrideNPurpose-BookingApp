import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	availabilityOverride,
	availabilityOverrideWindow,
	weeklyAvailability,
	workspace
} from '$lib/server/db/schema';

export const DAYS = [
	{ value: 0, label: 'Sunday' },
	{ value: 1, label: 'Monday' },
	{ value: 2, label: 'Tuesday' },
	{ value: 3, label: 'Wednesday' },
	{ value: 4, label: 'Thursday' },
	{ value: 5, label: 'Friday' },
	{ value: 6, label: 'Saturday' }
];

export function isValidTime(value: string) {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function compareTimes(startTime: string, endTime: string) {
	return startTime.localeCompare(endTime);
}

export async function getWeeklyAvailabilityForWorkspace(workspaceId: string) {
	return db.query.weeklyAvailability.findMany({
		where: eq(weeklyAvailability.workspaceId, workspaceId),
		orderBy: (weeklyAvailability, { asc }) => [
			asc(weeklyAvailability.dayOfWeek),
			asc(weeklyAvailability.startTime)
		]
	});
}

export async function getAvailabilityOverridesForWorkspace(workspaceId: string) {
	const overrides = await db.query.availabilityOverride.findMany({
		where: eq(availabilityOverride.workspaceId, workspaceId),
		orderBy: (availabilityOverride, { asc }) => [asc(availabilityOverride.overrideDate)]
	});

	const windows = await db.query.availabilityOverrideWindow.findMany({
		orderBy: (availabilityOverrideWindow, { asc }) => [
			asc(availabilityOverrideWindow.startTime),
			asc(availabilityOverrideWindow.endTime)
		]
	});

	return overrides.map((override) => ({
		...override,
		windows: windows.filter((window) => window.overrideId === override.id)
	}));
}

export async function updateWorkspaceBookingRules(input: {
	workspaceId: string;
	minNoticeMinutes: number;
	bookingWindowDays: number;
	maxBookingsPerDay: number | null;
}) {
	const [updatedWorkspace] = await db
		.update(workspace)
		.set({
			minNoticeMinutes: input.minNoticeMinutes,
			bookingWindowDays: input.bookingWindowDays,
			maxBookingsPerDay: input.maxBookingsPerDay,
			updatedAt: new Date()
		})
		.where(eq(workspace.id, input.workspaceId))
		.returning();

	return updatedWorkspace;
}
