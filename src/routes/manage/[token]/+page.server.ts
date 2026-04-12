import { fail, error, type Actions, type ServerLoad } from '@sveltejs/kit';
import {
	cancelBookingForCustomer,
	getCustomerManageContext,
	rescheduleBookingForCustomer
} from '$lib/server/bookings';
import { getZonedParts } from '$lib/timezone';

function getDefaultDateValue(date: Date, timeZone: string) {
	const parts = getZonedParts(date, timeZone);
	return `${parts.year.toString().padStart(4, '0')}-${parts.month.toString().padStart(2, '0')}-${parts.day
		.toString()
		.padStart(2, '0')}`;
}

function getDefaultTimeValue(date: Date, timeZone: string) {
	const parts = getZonedParts(date, timeZone);
	return `${parts.hour.toString().padStart(2, '0')}:${parts.minute.toString().padStart(2, '0')}`;
}

function requireManageToken(token: string | undefined) {
	if (!token) {
		throw error(404, 'Booking not found');
	}

	return token;
}

export const load = (async ({ params }) => {
	const context = await getCustomerManageContext(requireManageToken(params.token));

	if (!context) {
		throw error(404, 'Booking not found');
	}

	return {
		booking: context.booking,
		service: context.service,
		workspace: context.workspace,
		canChange: context.canChange,
		defaultRescheduleDate: getDefaultDateValue(context.booking.startAt, context.workspace.timezone),
		defaultRescheduleTime: getDefaultTimeValue(context.booking.startAt, context.workspace.timezone)
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	cancelBooking: async ({ params }) => {
		const token = requireManageToken(params.token);

		try {
			const updatedBooking = await cancelBookingForCustomer(token);

			if (!updatedBooking) {
				return fail(404, {
					manageMessage: 'Booking not found.'
				});
			}

			return {
				manageMessage:
					updatedBooking.status === 'cancelled'
						? 'Your booking has been cancelled.'
						: 'This booking can no longer be cancelled online.'
			};
		} catch (error) {
			return fail(400, {
				manageMessage:
					error instanceof Error ? `Cancellation failed: ${error.message}` : 'Cancellation failed.'
			});
		}
	},
	rescheduleBooking: async ({ params, request }) => {
		const token = requireManageToken(params.token);
		const formData = await request.formData();
		const rescheduleDate = formData.get('rescheduleDate')?.toString().trim() ?? '';
		const rescheduleTime = formData.get('rescheduleTime')?.toString().trim() ?? '';

		if (!rescheduleDate || !rescheduleTime) {
			return fail(400, {
				manageMessage: 'Date and time are required to reschedule.',
				rescheduleValues: { rescheduleDate, rescheduleTime }
			});
		}

		try {
			const updatedBooking = await rescheduleBookingForCustomer({
				manageToken: token,
				dateKey: rescheduleDate,
				time: rescheduleTime
			});

			if (!updatedBooking) {
				return fail(404, {
					manageMessage: 'Booking not found.',
					rescheduleValues: { rescheduleDate, rescheduleTime }
				});
			}

			return {
				manageMessage:
					updatedBooking.status === 'scheduled'
						? 'Your booking has been rescheduled.'
						: 'This booking can no longer be rescheduled online.'
			};
		} catch (error) {
			return fail(400, {
				manageMessage:
					error instanceof Error ? `Reschedule failed: ${error.message}` : 'Reschedule failed.',
				rescheduleValues: { rescheduleDate, rescheduleTime }
			});
		}
	}
};
