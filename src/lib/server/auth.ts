import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

const trustedOrigins = Array.from(
	new Set(
		[
			env.ORIGIN,
			'http://localhost:5173',
			'http://127.0.0.1:5173',
			'https://bookings.pridenpurpose.com'
		].filter((value): value is string => Boolean(value?.trim()))
	)
);

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	trustedOrigins,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
