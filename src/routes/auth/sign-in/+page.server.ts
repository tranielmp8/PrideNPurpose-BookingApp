import { fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return {};
	}

	const workspace = await getWorkspaceForUser(locals.user.id);
	throw redirect(302, workspace ? '/app/dashboard' : '/onboarding');
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, {
				message: 'Email and password are required.',
				email
			});
		}

		try {
			await auth.api.signInEmail({
				headers: event.request.headers,
				body: {
					email,
					password
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, {
					message: error.message || 'Sign-in failed.',
					email
				});
			}

			return fail(500, {
				message: 'Unexpected error while signing in.',
				email
			});
		}

		throw redirect(302, '/app/dashboard');
	}
};
