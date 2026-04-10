import { fail, error, type Actions, type ServerLoad } from '@sveltejs/kit';
import {
	createBookingForPublicPage,
	generateSlotsForService,
	getPublicBookingContext
} from '$lib/server/bookings';
import { getDateKeyInTimeZone } from '$lib/timezone';

function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

export const load = (async ({ params, url }) => {
	const slug = params.slug;
	if (!slug) {
		throw error(404, 'Booking page not found');
	}

	const context = await getPublicBookingContext(slug);
	if (!context) {
		throw error(404, 'Booking page not found');
	}

	const selectedServiceId = url.searchParams.get('service') ?? context.services[0]?.id ?? '';
	const selectedService =
		context.services.find((service) => service.id === selectedServiceId) ?? context.services[0] ?? null;
	const selectedDate = url.searchParams.get('date') ?? getDateKeyInTimeZone(new Date(), context.workspace.timezone);

	const slots = selectedService
		? await generateSlotsForService({
				workspace: context.workspace,
				service: selectedService,
				dateKey: selectedDate
			})
		: [];

	return {
		workspace: context.workspace,
		services: context.services,
		selectedServiceId: selectedService?.id ?? '',
		selectedDate,
		slots,
		timezone: context.workspace.timezone
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	createBooking: async ({ params, request }) => {
		const slug = params.slug;
		if (!slug) {
			throw error(404, 'Booking page not found');
		}

		const context = await getPublicBookingContext(slug);
		if (!context) {
			throw error(404, 'Booking page not found');
		}

		const formData = await request.formData();
		const serviceId = formData.get('serviceId')?.toString() ?? '';
		const selectedDate = formData.get('selectedDate')?.toString() ?? '';
		const slotStartAt = formData.get('slotStartAt')?.toString() ?? '';
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = normalizeEmail(formData.get('email')?.toString() ?? '');
		const notes = formData.get('notes')?.toString().trim() ?? '';

		const selectedService = context.services.find((service) => service.id === serviceId);
		if (!selectedService) {
			return fail(400, { bookingMessage: 'Choose a valid service.' });
		}

		if (!selectedDate || !slotStartAt || !name || !email) {
			return fail(400, {
				bookingMessage: 'Service, date, time, name, and email are required.',
				bookingValues: { name, email, notes, serviceId, selectedDate }
			});
		}

		const bookingStart = new Date(slotStartAt);
		if (Number.isNaN(bookingStart.getTime())) {
			return fail(400, {
				bookingMessage: 'Choose a valid time slot.',
				bookingValues: { name, email, notes, serviceId, selectedDate }
			});
		}

		const createdBooking = await createBookingForPublicPage({
			workspace: context.workspace,
			service: selectedService,
			startAt: bookingStart,
			name,
			email,
			notes
		});

		if (!createdBooking) {
			return fail(409, {
				bookingMessage: 'That slot is no longer available. Please choose another time.',
				bookingValues: { name, email, notes, serviceId, selectedDate }
			});
		}

		return {
			bookingMessage: 'Booking confirmed.',
			bookingSuccess: true,
			confirmedBooking: {
				startAt: createdBooking.startAt.toISOString(),
				endAt: createdBooking.endAt.toISOString(),
				zohoJoinLink: createdBooking.zohoJoinLink ?? null
			}
		};
	}
};
