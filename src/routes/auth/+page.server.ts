import { redirect, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getCustomerAccountForUser } from '$lib/server/customer-accounts';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return {};
	}

	const providerWorkspace = await getWorkspaceForUser(locals.user.id);
	if (providerWorkspace) {
		throw redirect(302, '/app/dashboard');
	}

	const customerAccount = await getCustomerAccountForUser(locals.user.id);
	if (customerAccount) {
		throw redirect(302, '/customer/dashboard');
	}

	return {};
}) satisfies ServerLoad;
