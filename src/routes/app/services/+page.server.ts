import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { service } from '$lib/server/db/schema';
import { generateServiceSlug, getServicesForWorkspace } from '$lib/server/services';
import { getWorkspaceForUser } from '$lib/server/workspace';

function parsePriceToCents(value: string) {
	if (!value.trim()) {
		return null;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return Number.NaN;
	}

	return Math.round(parsed * 100);
}

function parseNonNegativeInteger(value: string) {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 0) {
		return Number.NaN;
	}

	return parsed;
}

function serviceFormValues(formData: FormData) {
	return {
		name: formData.get('name')?.toString().trim() ?? '',
		description: formData.get('description')?.toString().trim() ?? '',
		confirmationMessage: formData.get('confirmationMessage')?.toString().trim() ?? '',
		durationMinutes: formData.get('durationMinutes')?.toString().trim() ?? '',
		price: formData.get('price')?.toString().trim() ?? '',
		currencyCode: formData.get('currencyCode')?.toString().trim().toUpperCase() ?? 'USD',
		bufferBeforeMinutes: formData.get('bufferBeforeMinutes')?.toString().trim() ?? '0',
		bufferAfterMinutes: formData.get('bufferAfterMinutes')?.toString().trim() ?? '0',
		maxBookingsPerCustomer: formData.get('maxBookingsPerCustomer')?.toString().trim() ?? '',
		isIntroOffer: formData.get('isIntroOffer') === 'on',
		allowGuestBooking: formData.get('allowGuestBooking') === 'on',
		requiresCustomerAccount: formData.get('requiresCustomerAccount') === 'on'
	};
}

export const load = (async ({ parent }) => {
	const { workspace } = await parent();

	return {
		services: await getServicesForWorkspace(workspace.id)
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	createService: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const values = serviceFormValues(await request.formData());
		const durationMinutes = Number(values.durationMinutes);
		const priceCents = parsePriceToCents(values.price);
		const bufferBeforeMinutes = parseNonNegativeInteger(values.bufferBeforeMinutes);
		const bufferAfterMinutes = parseNonNegativeInteger(values.bufferAfterMinutes);
		const maxBookingsPerCustomer = values.maxBookingsPerCustomer
			? parseNonNegativeInteger(values.maxBookingsPerCustomer)
			: null;

		if (!workspace) {
			return fail(401, {
				serviceMessage: 'Workspace not found.'
			});
		}

		if (!values.name || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
			return fail(400, {
				serviceMessage: 'Service name and a positive duration are required.',
				serviceValues: values
			});
		}

		if (Number.isNaN(priceCents)) {
			return fail(400, {
				serviceMessage: 'Price must be a valid positive number.',
				serviceValues: values
			});
		}

		if (Number.isNaN(bufferBeforeMinutes) || Number.isNaN(bufferAfterMinutes)) {
			return fail(400, {
				serviceMessage: 'Buffers must use whole numbers that are zero or greater.',
				serviceValues: values
			});
		}

		if (maxBookingsPerCustomer !== null && Number.isNaN(maxBookingsPerCustomer)) {
			return fail(400, {
				serviceMessage: 'Max bookings per customer must be a whole number that is zero or greater.',
				serviceValues: values
			});
		}

		await db.insert(service).values({
			workspaceId: workspace.id,
			name: values.name,
			slug: await generateServiceSlug(workspace.id, values.name),
			description: values.description || null,
			confirmationMessage: values.confirmationMessage || null,
			durationMinutes,
			priceCents,
			currencyCode: values.currencyCode || 'USD',
			bufferBeforeMinutes,
			bufferAfterMinutes,
			isIntroOffer: values.isIntroOffer,
			allowGuestBooking: values.allowGuestBooking,
			requiresCustomerAccount: values.requiresCustomerAccount,
			maxBookingsPerCustomer
		});

		return {
			serviceMessage: `Created ${values.name}.`
		};
	},
	updateService: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		const serviceId = formData.get('serviceId')?.toString() ?? '';
		const values = serviceFormValues(formData);
		const durationMinutes = Number(values.durationMinutes);
		const priceCents = parsePriceToCents(values.price);
		const bufferBeforeMinutes = parseNonNegativeInteger(values.bufferBeforeMinutes);
		const bufferAfterMinutes = parseNonNegativeInteger(values.bufferAfterMinutes);
		const maxBookingsPerCustomer = values.maxBookingsPerCustomer
			? parseNonNegativeInteger(values.maxBookingsPerCustomer)
			: null;

		if (!workspace) {
			return fail(401, {
				serviceMessage: 'Workspace not found.'
			});
		}

		if (!serviceId || !values.name || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
			return fail(400, {
				serviceMessage: 'Each service needs a name and a positive duration.'
			});
		}

		if (Number.isNaN(priceCents)) {
			return fail(400, {
				serviceMessage: 'Price must be a valid positive number.'
			});
		}

		if (Number.isNaN(bufferBeforeMinutes) || Number.isNaN(bufferAfterMinutes)) {
			return fail(400, {
				serviceMessage: 'Buffers must use whole numbers that are zero or greater.'
			});
		}

		if (maxBookingsPerCustomer !== null && Number.isNaN(maxBookingsPerCustomer)) {
			return fail(400, {
				serviceMessage: 'Max bookings per customer must be a whole number that is zero or greater.'
			});
		}

		await db
			.update(service)
			.set({
				name: values.name,
				slug: await generateServiceSlug(workspace.id, values.name, serviceId),
				description: values.description || null,
				confirmationMessage: values.confirmationMessage || null,
				durationMinutes,
				priceCents,
				currencyCode: values.currencyCode || 'USD',
				bufferBeforeMinutes,
				bufferAfterMinutes,
				isIntroOffer: values.isIntroOffer,
				allowGuestBooking: values.allowGuestBooking,
				requiresCustomerAccount: values.requiresCustomerAccount,
				maxBookingsPerCustomer,
				updatedAt: new Date()
			})
			.where(and(eq(service.id, serviceId), eq(service.workspaceId, workspace.id)));

		return {
			serviceMessage: `Updated ${values.name}.`
		};
	},
	toggleService: async (event) => {
		const { request, locals } = event;
		const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
		const formData = await request.formData();
		const serviceId = formData.get('serviceId')?.toString() ?? '';
		const isActive = formData.get('isActive')?.toString() === 'true';

		if (!workspace) {
			return fail(401, {
				serviceMessage: 'Workspace not found.'
			});
		}

		if (!serviceId) {
			return fail(400, {
				serviceMessage: 'Missing service selection.'
			});
		}

		await db
			.update(service)
			.set({
				isActive: !isActive,
				updatedAt: new Date()
			})
			.where(and(eq(service.id, serviceId), eq(service.workspaceId, workspace.id)));

		return {
			serviceMessage: isActive ? 'Service archived.' : 'Service reactivated.'
		};
	}
};
