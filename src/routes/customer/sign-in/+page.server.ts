import { fail, redirect, type Actions, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import {
	createCustomerAccountForUser,
	findWorkspaceMatchForCustomerEmail,
	getCustomerAccountForUser,
	linkGuestBookingsToCustomerAccount
} from '$lib/server/customer-accounts';
import { getWorkspaceBySlug, getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals, url }: RequestEvent) => {
	if (!locals.user) {
		const workspaceSlug = url.searchParams.get('workspace') ?? '';
		const workspace = workspaceSlug ? await getWorkspaceBySlug(workspaceSlug) : null;
		return {
			workspaceSlug,
			workspace
		};
	}

	const providerWorkspace = await getWorkspaceForUser(locals.user.id);
	if (providerWorkspace) {
		throw redirect(302, '/app/dashboard');
	}

	const customerAccount = await getCustomerAccountForUser(locals.user.id);
	if (customerAccount) {
		throw redirect(302, '/customer/dashboard');
	}

	return {
		workspaceSlug: url.searchParams.get('workspace') ?? '',
		workspace: null
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const workspaceSlug = formData.get('workspaceSlug')?.toString().trim() ?? '';
		let authResult: unknown;

		if (!email || !password) {
			return fail(400, {
				message: 'Email and password are required.',
				email,
				workspaceSlug
			});
		}

		try {
			authResult = await auth.api.signInEmail({
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
					email,
					workspaceSlug
				});
			}

			return fail(500, {
				message: 'Unexpected error while signing in.',
				email,
				workspaceSlug
			});
		}

		const signedInUserId =
			authResult &&
			typeof authResult === 'object' &&
			'user' in authResult &&
			authResult.user &&
			typeof authResult.user === 'object' &&
			'id' in authResult.user &&
			typeof authResult.user.id === 'string'
				? authResult.user.id
				: null;

		const signedInUserName =
			authResult &&
			typeof authResult === 'object' &&
			'user' in authResult &&
			authResult.user &&
			typeof authResult.user === 'object' &&
			'name' in authResult.user &&
			typeof authResult.user.name === 'string'
				? authResult.user.name
				: '';

		if (signedInUserId) {
			let customerAccount = await getCustomerAccountForUser(signedInUserId);

			if (!customerAccount) {
				const workspaceFromSlug = workspaceSlug ? await getWorkspaceBySlug(workspaceSlug) : null;
				const matchedCustomer = workspaceFromSlug
					? null
					: await findWorkspaceMatchForCustomerEmail(email);
				const targetWorkspaceId = workspaceFromSlug?.id ?? matchedCustomer?.workspaceId ?? null;
				const targetName = signedInUserName || matchedCustomer?.name || email;

				if (targetWorkspaceId) {
					customerAccount = await createCustomerAccountForUser({
						userId: signedInUserId,
						workspaceId: targetWorkspaceId,
						name: targetName,
						email
					});
				}
			}

			if (customerAccount) {
				await linkGuestBookingsToCustomerAccount({
					customerAccountId: customerAccount.id,
					workspaceId: customerAccount.workspaceId,
					email: customerAccount.email
				});

				throw redirect(302, '/customer/dashboard');
			}
		}

		return fail(400, {
			message:
				'This sign-in was successful, but no customer booking profile was found yet. Start from a booking page or create your customer account from that workspace first.',
			email,
			workspaceSlug
		});
	}
};
