import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const POST = async ({ request }) => {
	await auth.api.signOut({
		headers: request.headers
	});

	throw redirect(302, '/customer/sign-in');
};
