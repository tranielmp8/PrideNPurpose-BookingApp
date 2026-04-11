import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import type { PublicService, PublicWorkspace } from '$lib/server/bookings';

type BookingEmailContext = {
	customerName: string;
	customerEmail: string;
	service: PublicService;
	workspace: PublicWorkspace;
	startAt: Date;
	endAt: Date;
	timeLabel: string;
	dateLabel: string;
	meetingLink: string | null;
};

const EMAIL_FROM_PATTERN = /^[^<>\r\n]+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;

export function getEmailConfigurationStatus() {
	const emailFrom = env.EMAIL_FROM?.trim() ?? '';

	return {
		hasResendApiKey: Boolean(env.RESEND_API_KEY),
		hasEmailFrom: Boolean(emailFrom),
		emailFrom,
		hasValidEmailFrom: EMAIL_FROM_PATTERN.test(emailFrom)
	};
}

function getResendClient() {
	const status = getEmailConfigurationStatus();
	if (!status.hasResendApiKey || !status.hasValidEmailFrom) {
		return null;
	}

	return new Resend(env.RESEND_API_KEY);
}

function replaceTemplateTokens(template: string, context: BookingEmailContext) {
	return template
		.replaceAll('{customer_name}', context.customerName)
		.replaceAll('{customer_email}', context.customerEmail)
		.replaceAll('{service_name}', context.service.name)
		.replaceAll('{workspace_name}', context.workspace.name)
		.replaceAll('{start_time}', context.timeLabel)
		.replaceAll('{start_date}', context.dateLabel)
		.replaceAll('{meeting_link}', context.meetingLink ?? 'Meeting link will be shared separately.');
}

export function resolveConfirmationEmailMessage(context: BookingEmailContext) {
	const template =
		context.service.confirmationMessage ||
		context.workspace.defaultConfirmationMessage ||
		'Thank you for booking {service_name} with {workspace_name}. Your session is scheduled for {start_date} at {start_time}.';

	return replaceTemplateTokens(template, context);
}

function buildPlainTextEmail(context: BookingEmailContext) {
	const customMessage = resolveConfirmationEmailMessage(context);
	const lines = [
		`Pride N Purpose booking confirmed for ${context.service.name}.`,
		'',
		`Name: ${context.customerName}`,
		`Email: ${context.customerEmail}`,
		`Date: ${context.dateLabel}`,
		`Time: ${context.timeLabel}`,
		context.meetingLink ? `Meeting link: ${context.meetingLink}` : null,
		'',
		customMessage,
		'',
		'Sent via Pride N Purpose'
	].filter(Boolean);

	return lines.join('\n');
}

export async function sendBookingConfirmationEmails(context: BookingEmailContext) {
	const status = getEmailConfigurationStatus();
	const resend = getResendClient();
	if (!resend) {
		if (!status.hasResendApiKey) {
			throw new Error('RESEND_API_KEY is missing.');
		}

		if (!status.hasEmailFrom) {
			throw new Error('EMAIL_FROM is missing.');
		}

		throw new Error(
			`EMAIL_FROM must look like "Business Name <name@yourdomain.com>". Received: ${status.emailFrom}`
		);
	}

	const subject = `Pride N Purpose: ${context.service.name} confirmed`;
	const text = buildPlainTextEmail(context);
	const recipients = [context.customerEmail];

	if (context.workspace.contactEmail && context.workspace.contactEmail !== context.customerEmail) {
		recipients.push(context.workspace.contactEmail);
	}

	await Promise.all(
		recipients.map((to) =>
			resend.emails.send({
				from: status.emailFrom,
				to,
				subject,
				text
			})
		)
	);
}
