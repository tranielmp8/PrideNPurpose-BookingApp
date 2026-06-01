import { randomBytes } from 'node:crypto';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { getGoogleCalendarAuthUrl } from '$lib/server/google-calendar';

export const GET: RequestHandler = ({ cookies }) => {
	const state = randomBytes(24).toString('base64url');
	cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		maxAge: 10 * 60
	});

	throw redirect(302, getGoogleCalendarAuthUrl(state));
};
