import { describe, expect, it } from 'vitest';
import { resolveConfirmationEmailMessage } from './email';

function createWorkspace(overrides: Record<string, unknown> = {}) {
	return {
		id: 'workspace-1',
		ownerUserId: 'user-1',
		name: 'Pride N Purpose',
		slug: 'lets-meet',
		timezone: 'UTC',
		description: null,
		locationLabel: null,
		contactEmail: 'owner@example.com',
		defaultConfirmationMessage:
			'Thank you {customer_name}. Your {service_name} is booked for {start_date} at {start_time}.',
		zohoDataCenter: null,
		zohoZsoid: null,
		zohoPresenterUserId: null,
		zohoXZsource: null,
		zohoDefaultMeetingTopic: null,
		zohoDefaultAgenda: null,
		zohoAddAttendeeEmails: true,
		zohoAutoCreateMeetings: true,
		minNoticeMinutes: 120,
		bookingWindowDays: 60,
		maxBookingsPerDay: null,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides
	};
}

function createService(overrides: Record<string, unknown> = {}) {
	return {
		id: 'service-1',
		workspaceId: 'workspace-1',
		name: 'Discovery Session',
		slug: 'discovery-session',
		description: null,
		durationMinutes: 60,
		priceCents: null,
		currencyCode: 'USD',
		bufferBeforeMinutes: 0,
		bufferAfterMinutes: 0,
		confirmationMessage: null,
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides
	};
}

describe('resolveConfirmationEmailMessage', () => {
	it('uses the service-specific message before the workspace default', () => {
		const message = resolveConfirmationEmailMessage({
			customerName: 'Jane Example',
			customerEmail: 'jane@example.com',
			service: createService({
				confirmationMessage:
					'Custom prep for {service_name}: join at {meeting_link} and bring your notes.'
			}),
			workspace: createWorkspace(),
			startAt: new Date('2026-04-11T15:00:00.000Z'),
			endAt: new Date('2026-04-11T16:00:00.000Z'),
			dateLabel: 'Saturday, April 11',
			timeLabel: '3:00 PM',
			meetingLink: 'https://meet.zoho.com/join/123'
		});

		expect(message).toBe(
			'Custom prep for Discovery Session: join at https://meet.zoho.com/join/123 and bring your notes.'
		);
	});

	it('falls back to the workspace default when the service override is empty', () => {
		const message = resolveConfirmationEmailMessage({
			customerName: 'Jane Example',
			customerEmail: 'jane@example.com',
			service: createService(),
			workspace: createWorkspace(),
			startAt: new Date('2026-04-11T15:00:00.000Z'),
			endAt: new Date('2026-04-11T16:00:00.000Z'),
			dateLabel: 'Saturday, April 11',
			timeLabel: '3:00 PM',
			meetingLink: null
		});

		expect(message).toBe(
			'Thank you Jane Example. Your Discovery Session is booked for Saturday, April 11 at 3:00 PM.'
		);
	});
});
