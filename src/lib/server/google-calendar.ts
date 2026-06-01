import { env } from '$env/dynamic/private';
import { randomUUID } from 'node:crypto';

const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

function getOrigin() {
	return env.ORIGIN?.trim() || 'http://localhost:5173';
}

export function getGoogleRedirectUri() {
	return `${getOrigin()}/oauth/google/callback`;
}

export function getGoogleCalendarSecretStatus() {
	return {
		hasClientId: Boolean(env.GOOGLE_CLIENT_ID?.trim()),
		hasClientSecret: Boolean(env.GOOGLE_CLIENT_SECRET?.trim()),
		hasRefreshToken: Boolean(env.GOOGLE_REFRESH_TOKEN?.trim()),
		hasCalendarId: Boolean((env.GOOGLE_CALENDAR_ID?.trim() || 'primary').trim()),
		calendarId: getGoogleCalendarId()
	};
}

export function getGoogleCalendarId() {
	return env.GOOGLE_CALENDAR_ID?.trim() || 'primary';
}

export function getGoogleCalendarAuthUrl(state: string) {
	const clientId = env.GOOGLE_CLIENT_ID?.trim();
	if (!clientId) {
		throw new Error('GOOGLE_CLIENT_ID is not set.');
	}

	const url = new URL(GOOGLE_OAUTH_BASE_URL);
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('redirect_uri', getGoogleRedirectUri());
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', CALENDAR_SCOPE);
	url.searchParams.set('access_type', 'offline');
	url.searchParams.set('prompt', 'consent');
	url.searchParams.set('state', state);

	return url.toString();
}

export async function exchangeGoogleAuthCodeForTokens(code: string) {
	const clientId = env.GOOGLE_CLIENT_ID?.trim();
	const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();

	if (!clientId || !clientSecret) {
		throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set first.');
	}

	const response = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: getGoogleRedirectUri(),
			grant_type: 'authorization_code'
		})
	});

	const payload = (await response.json()) as
		| {
				access_token?: string;
				expires_in?: number;
				refresh_token?: string;
				scope?: string;
				token_type?: string;
		  }
		| {
				error: string;
				error_description?: string;
		  };

	if (!response.ok || 'error' in payload) {
		if ('error' in payload) {
			throw new Error(
				payload.error_description ? `${payload.error}: ${payload.error_description}` : payload.error
			);
		}

		throw new Error(`Google token exchange failed with status ${response.status}.`);
	}

	return payload;
}

export async function refreshGoogleAccessToken() {
	const clientId = env.GOOGLE_CLIENT_ID?.trim();
	const clientSecret = env.GOOGLE_CLIENT_SECRET?.trim();
	const refreshToken = env.GOOGLE_REFRESH_TOKEN?.trim();

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error('Google Calendar OAuth env vars are incomplete.');
	}

	const response = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: refreshToken,
			grant_type: 'refresh_token'
		})
	});

	const payload = (await response.json()) as
		| {
				access_token: string;
				expires_in?: number;
				scope?: string;
				token_type?: string;
		  }
		| {
				error: string;
				error_description?: string;
		  };

	if (!response.ok || 'error' in payload) {
		if ('error' in payload) {
			throw new Error(
				payload.error_description ? `${payload.error}: ${payload.error_description}` : payload.error
			);
		}

		throw new Error(`Google token refresh failed with status ${response.status}.`);
	}

	return payload;
}

export function isGoogleCalendarConfigured() {
	const status = getGoogleCalendarSecretStatus();
	return status.hasClientId && status.hasClientSecret && status.hasRefreshToken && status.hasCalendarId;
}

type GoogleCalendarEventInput = {
	summary: string;
	description?: string | null;
	startAt: Date;
	endAt: Date;
	timeZone: string;
	attendees?: Array<{ email: string }>;
};

type GoogleCalendarEventResponse = {
	id?: string;
	htmlLink?: string;
	hangoutLink?: string;
	conferenceData?: {
		entryPoints?: Array<{
			entryPointType?: string;
			uri?: string;
		}>;
	};
	[key: string]: unknown;
};

function getGoogleMeetLink(payload: GoogleCalendarEventResponse | null) {
	return (
		payload?.hangoutLink ??
		payload?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri ??
		null
	);
}

function buildEventBody(input: GoogleCalendarEventInput, includeConferenceData: boolean) {
	return {
		summary: input.summary,
		description: input.description ?? '',
		start: {
			dateTime: input.startAt.toISOString(),
			timeZone: input.timeZone
		},
		end: {
			dateTime: input.endAt.toISOString(),
			timeZone: input.timeZone
		},
		...(input.attendees?.length ? { attendees: input.attendees } : {}),
		...(includeConferenceData
			? {
					conferenceData: {
						createRequest: {
							requestId: randomUUID(),
							conferenceSolutionKey: {
								type: 'hangoutsMeet'
							}
						}
					}
				}
			: {})
	};
}

async function googleCalendarRequest(input: {
	path: string;
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	body?: unknown;
}) {
	const token = await refreshGoogleAccessToken();
	const response = await fetch(`${GOOGLE_CALENDAR_BASE_URL}${input.path}`, {
		method: input.method,
		headers: {
			Authorization: `Bearer ${token.access_token}`,
			...(input.body ? { 'Content-Type': 'application/json' } : {})
		},
		...(input.body ? { body: JSON.stringify(input.body) } : {})
	});

	if (response.status === 204) {
		return {
			token,
			payload: null
		};
	}

	const text = await response.text();
	const payload = text ? JSON.parse(text) : null;

	if (!response.ok) {
		const message =
			payload?.error?.message ||
			payload?.error_description ||
			`Google Calendar request failed with status ${response.status}.`;
		throw new Error(`${message} (status ${response.status})`);
	}

	return {
		token,
		payload: payload as GoogleCalendarEventResponse | null
	};
}

export async function createGoogleCalendarMeeting(input: GoogleCalendarEventInput) {
	const calendarId = encodeURIComponent(getGoogleCalendarId());
	const result = await googleCalendarRequest({
		path: `/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
		method: 'POST',
		body: buildEventBody(input, true)
	});

	return {
		...result,
		eventId: result.payload?.id ?? null,
		joinLink: getGoogleMeetLink(result.payload),
		hostLink: result.payload?.htmlLink ?? null
	};
}

export async function updateGoogleCalendarMeeting(
	input: GoogleCalendarEventInput & {
		eventId: string;
	}
) {
	const calendarId = encodeURIComponent(getGoogleCalendarId());
	const result = await googleCalendarRequest({
		path: `/calendars/${calendarId}/events/${encodeURIComponent(input.eventId)}?conferenceDataVersion=1&sendUpdates=all`,
		method: 'PATCH',
		body: buildEventBody(input, false)
	});

	return {
		...result,
		eventId: result.payload?.id ?? input.eventId,
		joinLink: getGoogleMeetLink(result.payload),
		hostLink: result.payload?.htmlLink ?? null
	};
}

export async function deleteGoogleCalendarMeeting(eventId: string) {
	const calendarId = encodeURIComponent(getGoogleCalendarId());
	return googleCalendarRequest({
		path: `/calendars/${calendarId}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
		method: 'DELETE'
	});
}
