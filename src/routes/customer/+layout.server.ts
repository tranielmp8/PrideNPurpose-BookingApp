import { redirect, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getCustomerAccountForUser } from '$lib/server/customer-accounts';
import { getWorkspaceById, getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		throw redirect(302, '/customer/sign-in');
	}

	const customerAccount = await getCustomerAccountForUser(locals.user.id);
	if (!customerAccount) {
		const providerWorkspace = await getWorkspaceForUser(locals.user.id);
		throw redirect(302, providerWorkspace ? '/app/dashboard' : '/customer/sign-in');
	}

	const workspace = await getWorkspaceById(customerAccount.workspaceId);
	if (!workspace) {
		throw redirect(302, '/customer/sign-in');
	}

	return {
		user: locals.user,
		customerAccount,
		workspace
	};
}) satisfies ServerLoad;
