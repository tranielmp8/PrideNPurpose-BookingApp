import type { ServerLoad } from '@sveltejs/kit';
import { getBookingsForCustomerAccount } from '$lib/server/customer-accounts';

export const load = (async ({ parent }) => {
	const { customerAccount } = await parent();
	const bookings = await getBookingsForCustomerAccount(customerAccount.id);
	const now = new Date();

	return {
		upcomingBookings: bookings.filter(
			(booking) => booking.status === 'scheduled' && new Date(booking.startAt) >= now
		),
		pastBookings: bookings.filter(
			(booking) => booking.status !== 'scheduled' || new Date(booking.startAt) < now
		)
	};
}) satisfies ServerLoad;
