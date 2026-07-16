import { redirect, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { isBackendOwner } from '$lib/server/backend-access';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user || !isBackendOwner(locals.user.email)) {
		throw redirect(302, '/auth/sign-in');
	}

	const workspace = await getWorkspaceForUser(locals.user.id);
	if (!workspace) {
		throw redirect(302, '/onboarding');
	}

	return {
		user: locals.user,
		workspace
	};
}) satisfies ServerLoad;
