import { redirect, type RequestEvent, type ServerLoad } from '@sveltejs/kit';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	if (!locals.user) {
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
