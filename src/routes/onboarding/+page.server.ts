import { fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { createWorkspaceForUser, generateWorkspaceSlug, getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals, url }: RequestEvent) => {
	if (!locals.user) {
		throw redirect(302, '/auth/sign-in');
	}

	const existingWorkspace = await getWorkspaceForUser(locals.user.id);
	if (existingWorkspace) {
		throw redirect(302, '/app/dashboard');
	}

	return {
		email: locals.user.email ?? '',
		businessName: url.searchParams.get('businessName') ?? '',
		timezone: url.searchParams.get('timezone') ?? '',
		contactEmail: url.searchParams.get('contactEmail') ?? locals.user.email ?? ''
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, '/auth/sign-in');
		}

		const existingWorkspace = await getWorkspaceForUser(locals.user.id);
		if (existingWorkspace) {
			throw redirect(302, '/app/dashboard');
		}

		const formData = await request.formData();
		const businessName = formData.get('businessName')?.toString().trim() ?? '';
		const timezone = formData.get('timezone')?.toString().trim() ?? '';
		const contactEmail = formData.get('contactEmail')?.toString().trim().toLowerCase() ?? '';

		if (!businessName || !timezone || !contactEmail) {
			return fail(400, {
				message: 'Business name, timezone, and contact email are required.',
				values: { businessName, timezone, contactEmail }
			});
		}

		await createWorkspaceForUser({
			userId: locals.user.id,
			name: businessName,
			slug: await generateWorkspaceSlug(businessName),
			timezone,
			contactEmail
		});

		throw redirect(302, '/app/dashboard');
	}
};
