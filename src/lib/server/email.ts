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

function getResendClient() {
	if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
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
		`Booking confirmed for ${context.service.name}.`,
		'',
		`Name: ${context.customerName}`,
		`Email: ${context.customerEmail}`,
		`Date: ${context.dateLabel}`,
		`Time: ${context.timeLabel}`,
		context.meetingLink ? `Meeting link: ${context.meetingLink}` : null,
		'',
		customMessage
	].filter(Boolean);

	return lines.join('\n');
}

export async function sendBookingConfirmationEmails(context: BookingEmailContext) {
	const resend = getResendClient();
	if (!resend || !env.EMAIL_FROM) {
		return;
	}

	const subject = `${context.workspace.name}: ${context.service.name} confirmed`;
	const text = buildPlainTextEmail(context);
	const recipients = [context.customerEmail];

	if (context.workspace.contactEmail && context.workspace.contactEmail !== context.customerEmail) {
		recipients.push(context.workspace.contactEmail);
	}

	await Promise.all(
		recipients.map((to) =>
			resend.emails.send({
				from: env.EMAIL_FROM!,
				to,
				subject,
				text
			})
		)
	);
}
