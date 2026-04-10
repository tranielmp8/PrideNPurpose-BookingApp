import type { RequestEvent, ServerLoad } from '@sveltejs/kit';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const load = (async ({ locals }: RequestEvent) => {
	const user = locals.user ?? null;
	const session = locals.session ?? null;
	const workspace = user ? await getWorkspaceForUser(user.id) : null;

	return {
		user,
		session,
		workspace
	};
}) satisfies ServerLoad;
