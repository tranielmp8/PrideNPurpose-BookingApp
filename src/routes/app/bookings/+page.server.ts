import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import {
	cancelBookingForWorkspace,
	completeBookingForWorkspace,
	getBookingsForWorkspace,
	rescheduleBookingForWorkspace
} from '$lib/server/bookings';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ parent }) => {
	const { workspace } = await parent();

	return {
		bookings: await getBookingsForWorkspace(workspace.id)
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	cancelBooking: async ({ locals, request }) => {
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		if (!workspace) {
			return fail(401, {
				bookingMessage: 'Workspace not found.'
			});
		}

		const formData = await request.formData();
		const bookingId = formData.get('bookingId')?.toString() ?? '';

		if (!bookingId) {
			return fail(400, {
				bookingMessage: 'Missing booking selection.'
			});
		}

		try {
			const updatedBooking = await cancelBookingForWorkspace(workspace, bookingId);
			if (!updatedBooking) {
				return fail(404, {
					bookingMessage: 'Booking not found.'
				});
			}

			return {
				bookingMessage:
					updatedBooking.status === 'cancelled'
						? 'Booking cancelled.'
						: 'Booking could not be cancelled because it is no longer scheduled.'
			};
		} catch (error) {
			return fail(400, {
				bookingMessage:
					error instanceof Error
						? `Cancellation failed: ${error.message}`
						: 'Cancellation failed.'
			});
		}
	},
	completeBooking: async ({ locals, request }) => {
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		if (!workspace) {
			return fail(401, {
				bookingMessage: 'Workspace not found.'
			});
		}

		const formData = await request.formData();
		const bookingId = formData.get('bookingId')?.toString() ?? '';

		if (!bookingId) {
			return fail(400, {
				bookingMessage: 'Missing booking selection.'
			});
		}

		const updatedBooking = await completeBookingForWorkspace(workspace.id, bookingId);
		if (!updatedBooking) {
			return fail(404, {
				bookingMessage: 'Booking not found.'
			});
		}

		return {
			bookingMessage:
				updatedBooking.status === 'completed'
					? 'Booking marked as completed.'
					: 'Booking could not be completed because it is no longer scheduled.'
		};
	},
	rescheduleBooking: async ({ locals, request }) => {
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		if (!workspace) {
			return fail(401, {
				bookingMessage: 'Workspace not found.'
			});
		}

		const formData = await request.formData();
		const bookingId = formData.get('bookingId')?.toString() ?? '';
		const rescheduleDate = formData.get('rescheduleDate')?.toString().trim() ?? '';
		const rescheduleTime = formData.get('rescheduleTime')?.toString().trim() ?? '';

		if (!bookingId || !rescheduleDate || !rescheduleTime) {
			return fail(400, {
				bookingMessage: 'Booking, date, and time are required to reschedule.',
				rescheduleValues: { bookingId, rescheduleDate, rescheduleTime }
			});
		}

		try {
			const updatedBooking = await rescheduleBookingForWorkspace({
				workspace,
				bookingId,
				dateKey: rescheduleDate,
				time: rescheduleTime
			});

			if (!updatedBooking) {
				return fail(404, {
					bookingMessage: 'Booking not found.',
					rescheduleValues: { bookingId, rescheduleDate, rescheduleTime }
				});
			}

			return {
				bookingMessage:
					updatedBooking.status === 'scheduled'
						? 'Booking rescheduled.'
						: 'Booking could not be rescheduled because it is no longer scheduled.'
			};
		} catch (error) {
			return fail(400, {
				bookingMessage:
					error instanceof Error
						? `Reschedule failed: ${error.message}`
						: 'Reschedule failed.',
				rescheduleValues: { bookingId, rescheduleDate, rescheduleTime }
			});
		}
	}
};
