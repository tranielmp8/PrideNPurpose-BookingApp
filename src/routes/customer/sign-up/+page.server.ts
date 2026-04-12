import { fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import {
	createCustomerAccountForUser,
	getCustomerAccountForUser,
	linkGuestBookingsToCustomerAccount
} from '$lib/server/customer-accounts';
import { getWorkspaceBySlug, getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals, url }: RequestEvent) => {
	if (locals.user) {
		const providerWorkspace = await getWorkspaceForUser(locals.user.id);
		if (providerWorkspace) {
			throw redirect(302, '/app/dashboard');
		}

		const customerAccount = await getCustomerAccountForUser(locals.user.id);
		if (customerAccount) {
			throw redirect(302, '/customer/dashboard');
		}
	}

	const workspaceSlug = url.searchParams.get('workspace') ?? '';
	const workspace = workspaceSlug ? await getWorkspaceBySlug(workspaceSlug) : null;

	return {
		workspaceSlug,
		workspace
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const workspaceSlug = formData.get('workspaceSlug')?.toString().trim() ?? '';

		if (!name || !email || !password || !workspaceSlug) {
			return fail(400, {
				message: 'Name, email, password, and workspace are required.',
				values: { name, email, workspaceSlug }
			});
		}

		if (password.length < 8) {
			return fail(400, {
				message: 'Password must be at least 8 characters.',
				values: { name, email, workspaceSlug }
			});
		}

		const workspace = await getWorkspaceBySlug(workspaceSlug);
		if (!workspace) {
			return fail(404, {
				message: 'Booking workspace not found.',
				values: { name, email, workspaceSlug }
			});
		}

		let authResult: unknown;

		try {
			authResult = await auth.api.signUpEmail({
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
					values: { name, email, workspaceSlug }
				});
			}

			return fail(500, {
				message: 'Unexpected error while creating your account.',
				values: { name, email, workspaceSlug }
			});
		}

		const createdUserId =
			authResult &&
			typeof authResult === 'object' &&
			'user' in authResult &&
			authResult.user &&
			typeof authResult.user === 'object' &&
			'id' in authResult.user &&
			typeof authResult.user.id === 'string'
				? authResult.user.id
				: null;

		if (!createdUserId) {
			return fail(500, {
				message: 'Customer account was created, but profile setup could not be completed.',
				values: { name, email, workspaceSlug }
			});
		}

		const createdCustomerAccount = await createCustomerAccountForUser({
			userId: createdUserId,
			workspaceId: workspace.id,
			name,
			email
		});

		await linkGuestBookingsToCustomerAccount({
			customerAccountId: createdCustomerAccount.id,
			workspaceId: workspace.id,
			email
		});

		throw redirect(302, '/customer/dashboard');
	}
};
