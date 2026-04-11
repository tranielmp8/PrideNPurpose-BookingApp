import { fail, type Actions, type ServerLoad } from '@sveltejs/kit';
import { getEmailConfigurationStatus } from '$lib/server/email';
import { slugify } from '$lib/server/slug';
import { getZonedParts } from '$lib/timezone';
import { getWorkspaceForUser, slugExists, updateWorkspaceSettings } from '$lib/server/workspace';
import { createZohoMeeting, getZohoWorkspaceStatus, refreshZohoAccessToken } from '$lib/server/zoho';

export const load = (async ({ parent }) => {
	const { workspace } = await parent();

	return {
		workspace,
		zohoStatus: getZohoWorkspaceStatus(workspace),
		emailStatus: getEmailConfigurationStatus()
	};
}) satisfies ServerLoad;

function normalizeOptional(value: FormDataEntryValue | null) {
	const normalized = value?.toString().trim() ?? '';
	return normalized || null;
}

function formatZohoStartTime(date: Date, timeZone: string) {
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

export const actions: Actions = {
	saveSettings: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { settingsMessage: 'You must be signed in.' });
		}
		const workspace = await getWorkspaceForUser(locals.user.id);
		if (!workspace) {
			return fail(404, { settingsMessage: 'Workspace not found.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const slugInput = formData.get('slug')?.toString().trim() ?? '';
		const timezone = formData.get('timezone')?.toString().trim() ?? '';
		const description = normalizeOptional(formData.get('description'));
		const locationLabel = normalizeOptional(formData.get('locationLabel'));
		const contactEmail = normalizeOptional(formData.get('contactEmail'));
		const defaultConfirmationMessage = normalizeOptional(formData.get('defaultConfirmationMessage'));
		const zohoDataCenter = normalizeOptional(formData.get('zohoDataCenter'));
		const zohoZsoid = normalizeOptional(formData.get('zohoZsoid'));
		const zohoPresenterUserId = normalizeOptional(formData.get('zohoPresenterUserId'));
		const zohoXZsource = normalizeOptional(formData.get('zohoXZsource'));
		const zohoDefaultMeetingTopic = normalizeOptional(formData.get('zohoDefaultMeetingTopic'));
		const zohoDefaultAgenda = normalizeOptional(formData.get('zohoDefaultAgenda'));
		const zohoAddAttendeeEmails = formData.get('zohoAddAttendeeEmails') === 'on';
		const zohoAutoCreateMeetings = formData.get('zohoAutoCreateMeetings') === 'on';

		if (!name || !slugInput || !timezone) {
			return fail(400, {
				settingsMessage: 'Business name, booking slug, and timezone are required.'
			});
		}

		const normalizedSlug = slugify(slugInput);
		if (!normalizedSlug) {
			return fail(400, {
				settingsMessage: 'Booking slug must contain letters or numbers.'
			});
		}

		if (normalizedSlug !== workspace.slug && (await slugExists(normalizedSlug))) {
			return fail(400, {
				settingsMessage: 'That booking slug is already in use.'
			});
		}

		await updateWorkspaceSettings(workspace.id, {
			name,
			slug: normalizedSlug,
			timezone,
			description,
			locationLabel,
			contactEmail,
			defaultConfirmationMessage,
			zohoDataCenter,
			zohoZsoid,
			zohoPresenterUserId,
			zohoXZsource,
			zohoDefaultMeetingTopic,
			zohoDefaultAgenda,
			zohoAddAttendeeEmails,
			zohoAutoCreateMeetings
		});

		return {
			settingsMessage: 'Settings saved.'
		};
	},
	testZohoAuth: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { settingsMessage: 'You must be signed in.' });
		}
		const workspace = await getWorkspaceForUser(locals.user.id);
		if (!workspace) {
			return fail(404, { settingsMessage: 'Workspace not found.' });
		}

		try {
			const token = await refreshZohoAccessToken(workspace.zohoDataCenter);
			return {
				settingsMessage: 'Zoho OAuth refresh succeeded.',
				zohoTestResult: {
					apiDomain: token.api_domain ?? 'unknown',
					expiresIn: token.expires_in ?? null
				}
			};
		} catch (error) {
			return fail(400, {
				settingsMessage:
					error instanceof Error ? `Zoho auth test failed: ${error.message}` : 'Zoho auth test failed.'
			});
		}
	},
	testZohoMeeting: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { settingsMessage: 'You must be signed in.' });
		}
		const workspace = await getWorkspaceForUser(locals.user.id);
		if (!workspace) {
			return fail(404, { settingsMessage: 'Workspace not found.' });
		}
		if (!workspace.zohoDataCenter || !workspace.zohoZsoid || !workspace.zohoPresenterUserId) {
			return fail(400, {
				settingsMessage: 'Save Zoho data center, zsoid, and presenter user ID first.'
			});
		}

		try {
			const futureStart = new Date(Date.now() + 2 * 60 * 60 * 1000);
			const result = await createZohoMeeting({
				dataCenter: workspace.zohoDataCenter,
				zsoid: workspace.zohoZsoid,
				presenter: workspace.zohoPresenterUserId,
				topic: workspace.zohoDefaultMeetingTopic || 'Discuss Plans - Test',
				agenda: workspace.zohoDefaultAgenda || 'Booking app integration test meeting.',
				startTime: formatZohoStartTime(futureStart, workspace.timezone),
				durationMs: 30 * 60 * 1000,
				timezone: workspace.timezone,
				xZsource: workspace.zohoXZsource || workspace.name,
				participants: workspace.zohoAddAttendeeEmails
					? [{ email: workspace.contactEmail || locals.user.email || 'test@example.com' }]
					: []
			});
			const session = result.payload?.session;

			return {
				settingsMessage: 'Zoho meeting creation succeeded.',
				zohoMeetingResult: {
					meetingKey: session?.meetingKey ?? null,
					joinLink: session?.joinLink ?? null,
					startLink: session?.startLink ?? null
				}
			};
		} catch (error) {
			return fail(400, {
				settingsMessage:
					error instanceof Error
						? `Zoho meeting test failed: ${error.message}`
						: 'Zoho meeting test failed.'
			});
		}
	}
};
