import { error, type ServerLoad } from '@sveltejs/kit';
import { getWorkspaceBySlug } from '$lib/server/workspace';

export const load = (async ({ params }) => {
	const slug = params.slug;
	if (!slug) {
		throw error(404, 'Booking page not found');
	}

	const workspace = await getWorkspaceBySlug(slug);
	if (!workspace) {
		throw error(404, 'Booking page not found');
	}

	return {
		workspace
	};
}) satisfies ServerLoad;
