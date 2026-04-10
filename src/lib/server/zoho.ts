import { env } from '$env/dynamic/private';
import { getZonedParts } from '$lib/timezone';

const DEFAULT_ACCOUNTS_DOMAIN = 'https://accounts.zoho.com';

const DATA_CENTER_ACCOUNTS_DOMAIN: Record<string, string> = {
	com: 'https://accounts.zoho.com',
	eu: 'https://accounts.zoho.eu',
	in: 'https://accounts.zoho.in',
	'com.au': 'https://accounts.zoho.com.au',
	'com.cn': 'https://accounts.zoho.com.cn',
	jp: 'https://accounts.zoho.jp',
	sa: 'https://accounts.zoho.sa',
	ca: 'https://accounts.zohocloud.ca'
};

export function getZohoAccountsDomain(dataCenter?: string | null) {
	if (env.ZOHO_ACCOUNTS_DOMAIN?.trim()) {
		return env.ZOHO_ACCOUNTS_DOMAIN.trim();
	}

	if (!dataCenter) {
		return DEFAULT_ACCOUNTS_DOMAIN;
	}

	return DATA_CENTER_ACCOUNTS_DOMAIN[dataCenter.trim().toLowerCase()] ?? DEFAULT_ACCOUNTS_DOMAIN;
}

export function getZohoSecretStatus() {
	return {
		hasClientId: Boolean(env.ZOHO_CLIENT_ID?.trim()),
		hasClientSecret: Boolean(env.ZOHO_CLIENT_SECRET?.trim()),
		hasRefreshToken: Boolean(env.ZOHO_REFRESH_TOKEN?.trim())
	};
}

export function getZohoWorkspaceStatus(workspace: {
	zohoDataCenter: string | null;
	zohoZsoid: string | null;
	zohoPresenterUserId: string | null;
}) {
	const secretStatus = getZohoSecretStatus();

	return {
		...secretStatus,
		hasDataCenter: Boolean(workspace.zohoDataCenter),
		hasZsoid: Boolean(workspace.zohoZsoid),
		hasPresenterUserId: Boolean(workspace.zohoPresenterUserId),
		readyForMeetingCreation:
			secretStatus.hasClientId &&
			secretStatus.hasClientSecret &&
			secretStatus.hasRefreshToken &&
			Boolean(workspace.zohoDataCenter) &&
			Boolean(workspace.zohoZsoid) &&
			Boolean(workspace.zohoPresenterUserId)
	};
}

export async function refreshZohoAccessToken(dataCenter?: string | null) {
	const clientId = env.ZOHO_CLIENT_ID?.trim();
	const clientSecret = env.ZOHO_CLIENT_SECRET?.trim();
	const refreshToken = env.ZOHO_REFRESH_TOKEN?.trim();

	if (!clientId || !clientSecret || !refreshToken) {
		throw new Error('Zoho OAuth env vars are incomplete.');
	}

	const response = await fetch(`${getZohoAccountsDomain(dataCenter)}/oauth/v2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'refresh_token'
		})
	});

	const payload = (await response.json()) as
		| {
				access_token: string;
				api_domain?: string;
				token_type?: string;
				expires_in?: number;
		  }
		| {
				error: string;
				error_description?: string;
		  };

	if (!response.ok || 'error' in payload) {
		if ('error' in payload) {
			const detail = payload.error_description;
			throw new Error(detail ? `${payload.error}: ${detail}` : payload.error);
		}

		throw new Error(`Zoho token refresh failed with status ${response.status}.`);
	}

	return payload;
}

type ZohoCreateMeetingInput = {
	dataCenter?: string | null;
	zsoid: string;
	presenter: string;
	topic: string;
	agenda?: string | null;
	startTime: string;
	durationMs: number;
	timezone: string;
	xZsource?: string | null;
	participants?: Array<{ email: string }>;
};

type ZohoMeetingResponse = {
	session?: {
		meetingKey?: string | number;
		joinLink?: string;
		startLink?: string;
		topic?: string;
	};
	error?: string;
	message?: string;
	[key: string]: unknown;
};

type ZohoDeleteMeetingInput = {
	dataCenter?: string | null;
	zsoid: string;
	meetingKey: string;
	xZsource?: string | null;
};

function stringifyZohoError(payload: ZohoMeetingResponse) {
	if (payload.message && typeof payload.message === 'string') {
		return payload.message;
	}

	if (payload.error && typeof payload.error === 'string') {
		return payload.error;
	}

	try {
		return JSON.stringify(payload);
	} catch {
		return 'Unknown Zoho Meeting error.';
	}
}

async function parseZohoResponse(response: Response) {
	if (response.status === 204) {
		return null;
	}

	const text = await response.text();
	if (!text.trim()) {
		return null;
	}

	try {
		return JSON.parse(text) as ZohoMeetingResponse;
	} catch {
		return {
			message: text
		} satisfies ZohoMeetingResponse;
	}
}

async function zohoMeetingRequest(
	input: Pick<ZohoCreateMeetingInput, 'dataCenter' | 'zsoid'> & {
		path: string;
		method: 'POST' | 'PUT' | 'DELETE';
		xZsource?: string | null;
		body?: string;
	}
) {
	const token = await refreshZohoAccessToken(input.dataCenter);
	const response = await fetch(`https://meeting.zoho.com/api/v2/${input.zsoid}${input.path}`, {
		method: input.method,
		headers: {
			Authorization: `Zoho-oauthtoken ${token.access_token}`,
			'Content-Type': 'application/json;charset=UTF-8',
			...(input.xZsource ? { 'X-ZSOURCE': input.xZsource } : {})
		},
		...(input.body ? { body: input.body } : {})
	});

	const payload = await parseZohoResponse(response);

	if (!response.ok || (payload && 'error' in payload && payload.error)) {
		throw new Error(
			`${payload ? stringifyZohoError(payload) : 'Zoho Meeting request failed.'} (status ${response.status})`
		);
	}

	return {
		token,
		payload
	};
}

export async function createZohoMeeting(input: ZohoCreateMeetingInput) {
	return zohoMeetingRequest({
		dataCenter: input.dataCenter,
		zsoid: input.zsoid,
		path: '/sessions.json',
		method: 'POST',
		xZsource: input.xZsource,
		body: JSON.stringify({
			session: {
				topic: input.topic,
				agenda: input.agenda ?? '',
				presenter: input.presenter,
				startTime: input.startTime,
				duration: input.durationMs,
				timezone: input.timezone,
				...(input.participants?.length ? { participants: input.participants } : {})
			}
		})
	});
}

export async function updateZohoMeeting(
	input: ZohoCreateMeetingInput & {
		meetingKey: string;
	}
) {
	return zohoMeetingRequest({
		dataCenter: input.dataCenter,
		zsoid: input.zsoid,
		path: `/sessions/${input.meetingKey}.json`,
		method: 'PUT',
		xZsource: input.xZsource,
		body: JSON.stringify({
			session: {
				topic: input.topic,
				agenda: input.agenda ?? '',
				presenter: input.presenter,
				startTime: input.startTime,
				duration: input.durationMs,
				timezone: input.timezone,
				...(input.participants?.length ? { participants: input.participants } : {})
			}
		})
	});
}

export async function deleteZohoMeeting(input: ZohoDeleteMeetingInput) {
	return zohoMeetingRequest({
		dataCenter: input.dataCenter,
		zsoid: input.zsoid,
		path: `/sessions/${input.meetingKey}.json`,
		method: 'DELETE',
		xZsource: input.xZsource
	});
}

export function formatZohoStartTime(date: Date, timeZone: string) {
	const parts = getZonedParts(date, timeZone);
	const month = new Intl.DateTimeFormat('en-US', {
		timeZone,
		month: 'short'
	}).format(date);
	const day = parts.day.toString().padStart(2, '0');
	const minute = parts.minute.toString().padStart(2, '0');
	const hour12 = parts.hour % 12 || 12;
	const meridiem = parts.hour >= 12 ? 'PM' : 'AM';

	return `${month} ${day}, ${parts.year} ${hour12}:${minute} ${meridiem}`;
}
