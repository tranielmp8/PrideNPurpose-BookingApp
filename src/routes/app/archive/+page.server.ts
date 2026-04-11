import type { ServerLoad } from '@sveltejs/kit';
import { getBookingsForWorkspace, shouldArchiveBooking } from '$lib/server/bookings';

const ARCHIVE_AFTER_DAYS = 30;

export const load = (async ({ parent }) => {
	const { workspace } = await parent();
	const bookings = await getBookingsForWorkspace(workspace.id);
	const now = new Date();

	return {
		bookings: bookings.filter((booking) => shouldArchiveBooking(booking, now, ARCHIVE_AFTER_DAYS)),
		archiveAfterDays: ARCHIVE_AFTER_DAYS
	};
}) satisfies ServerLoad;
