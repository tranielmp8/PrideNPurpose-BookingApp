import type { ServerLoad } from '@sveltejs/kit';
import { getBookingsForWorkspace } from '$lib/server/bookings';

export const load = (async ({ parent }) => {
	const { user, workspace } = await parent();
	const bookings = await getBookingsForWorkspace(workspace.id);

	return {
		user,
		workspace,
		upcomingBookings: bookings.filter((booking) => booking.status === 'scheduled').slice(0, 5),
		cancelledBookings: bookings.filter((booking) => booking.status === 'cancelled').slice(0, 5)
	};
}) satisfies ServerLoad;
