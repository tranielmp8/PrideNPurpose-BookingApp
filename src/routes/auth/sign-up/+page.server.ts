import { fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { isBackendOwner, isBackendOwnerConfigured } from '$lib/server/backend-access';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user || !isBackendOwner(locals.user.email)) {
		return {};
	}

	const workspace = await getWorkspaceForUser(locals.user.id);
	throw redirect(302, workspace ? '/app/dashboard' : '/onboarding');
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const businessName = formData.get('businessName')?.toString().trim() ?? '';
		const timezone = formData.get('timezone')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!name || !businessName || !timezone || !email || !password) {
			return fail(400, {
				message: 'All fields are required.',
				values: { name, businessName, timezone, email }
			});
		}

		if (password.length < 8) {
			return fail(400, {
				message: 'Password must be at least 8 characters.',
				values: { name, businessName, timezone, email }
			});
		}

		if (!isBackendOwnerConfigured()) {
			return fail(503, {
				message: 'Backend access has not been configured.',
				values: { name, businessName, timezone, email }
			});
		}

		if (!isBackendOwner(email)) {
			return fail(403, {
				message: 'This email is not authorized to create a backend account.',
				values: { name, businessName, timezone, email }
			});
		}

		try {
			await auth.api.signUpEmail({
				headers: event.request.headers,
				body: {
					email,
					password,
					name
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Registration failed.',
					values: { name, businessName, timezone, email }
				});
			}

			return fail(500, {
				message: 'Unexpected error while creating your account.',
				values: { name, businessName, timezone, email }
			});
		}

		throw redirect(302, `/onboarding?businessName=${encodeURIComponent(businessName)}&timezone=${encodeURIComponent(timezone)}&contactEmail=${encodeURIComponent(email)}`);
	}
};
