import { env } from '$env/dynamic/private';
import { fail, error, type Actions, type ServerLoad } from '@sveltejs/kit';
import {
	cancelBookingForCustomer,
	getCustomerManageContext,
	rescheduleBookingForCustomer
} from '$lib/server/bookings';
import { sendBookingCancelledEmails, sendBookingRescheduledEmails } from '$lib/server/email';
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

function getManageUrl(token: string, fallbackOrigin: string) {
	return `${env.ORIGIN?.trim() || fallbackOrigin}/manage/${token}`;
}

function getBookingDateLabel(date: Date, timeZone: string) {
	return date.toLocaleDateString('en-US', {
		timeZone,
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});
}

function getBookingTimeLabel(date: Date, timeZone: string) {
	return date.toLocaleTimeString('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit'
	});
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
		const context = await getCustomerManageContext(token);

		if (!context) {
			return fail(404, {
				manageMessage: 'Booking not found.'
			});
		}

		try {
			const updatedBooking = await cancelBookingForCustomer(token);

			if (!updatedBooking) {
				return fail(404, {
					manageMessage: 'Booking not found.'
				});
			}

			if (updatedBooking.status === 'cancelled') {
				try {
					await sendBookingCancelledEmails({
						customerName: updatedBooking.customerNameSnapshot,
						customerEmail: updatedBooking.customerEmailSnapshot,
						service: context.service,
						workspace: context.workspace,
						startAt: updatedBooking.startAt,
						endAt: updatedBooking.endAt,
						dateLabel: getBookingDateLabel(updatedBooking.startAt, context.workspace.timezone),
						timeLabel: getBookingTimeLabel(updatedBooking.startAt, context.workspace.timezone),
						meetingLink: null,
						manageUrl: null
					});
				} catch (emailError) {
					console.error('Customer cancellation email failed', emailError);
				}
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
	rescheduleBooking: async ({ params, request, url }) => {
		const token = requireManageToken(params.token);
		const context = await getCustomerManageContext(token);

		if (!context) {
			return fail(404, {
				manageMessage: 'Booking not found.'
			});
		}
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

			if (updatedBooking.status === 'scheduled') {
				try {
					await sendBookingRescheduledEmails({
						customerName: updatedBooking.customerNameSnapshot,
						customerEmail: updatedBooking.customerEmailSnapshot,
						service: context.service,
						workspace: context.workspace,
						startAt: updatedBooking.startAt,
						endAt: updatedBooking.endAt,
						dateLabel: getBookingDateLabel(updatedBooking.startAt, context.workspace.timezone),
						timeLabel: getBookingTimeLabel(updatedBooking.startAt, context.workspace.timezone),
						meetingLink: updatedBooking.zohoJoinLink ?? null,
						manageUrl: getManageUrl(token, url.origin)
					});
				} catch (emailError) {
					console.error('Customer reschedule email failed', emailError);
				}
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
