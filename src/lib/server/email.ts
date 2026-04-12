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
	manageUrl: string | null;
};

type ContactFormContext = {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
};

const EMAIL_FROM_PATTERN = /^[^<>\r\n]+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;
const DEFAULT_CONTACT_FORM_TO = 'tpride@pridendevelopment.com';

export function getEmailConfigurationStatus() {
	const emailFrom = env.EMAIL_FROM?.trim() ?? '';
	const contactFormTo = env.CONTACT_FORM_TO?.trim() || DEFAULT_CONTACT_FORM_TO;

	return {
		hasResendApiKey: Boolean(env.RESEND_API_KEY),
		hasEmailFrom: Boolean(emailFrom),
		emailFrom,
		hasValidEmailFrom: EMAIL_FROM_PATTERN.test(emailFrom),
		contactFormTo
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
	const durationLabel = `${context.service.durationMinutes} minutes`;
	const locationLabel = context.workspace.locationLabel ?? 'Online';
	const meetingLinkLabel = context.meetingLink ?? 'Meeting link will be shared separately.';

	return template
		.replaceAll('{customer_name}', context.customerName)
		.replaceAll('{customer}', context.customerName)
		.replaceAll('{customer_email}', context.customerEmail)
		.replaceAll('{service_name}', context.service.name)
		.replaceAll('{workspace_name}', context.workspace.name)
		.replaceAll('{start_time}', context.timeLabel)
		.replaceAll('{time}', context.timeLabel)
		.replaceAll('{start_date}', context.dateLabel)
		.replaceAll('{date}', context.dateLabel)
		.replaceAll('{duration}', durationLabel)
		.replaceAll('{location}', locationLabel)
		.replaceAll('{meeting_link}', meetingLinkLabel);
}

export function resolveConfirmationEmailMessage(context: BookingEmailContext) {
	const template =
		context.service.confirmationMessage ||
		context.workspace.defaultConfirmationMessage ||
		'Thank you for booking {service_name} with {workspace_name}. Your session is scheduled for {start_date} at {start_time}.';

	return replaceTemplateTokens(template, context);
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function formatMessageAsHtml(message: string) {
	return message
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
		.map((paragraph) =>
			`<p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#475569;">${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`
		)
		.join('');
}

function buildPlainTextEmail(context: BookingEmailContext) {
	const customMessage = resolveConfirmationEmailMessage(context);
	const lines = [
		`Pride N Purpose Booking confirmed for ${context.service.name}.`,
		'',
		`Name: ${context.customerName}`,
		`Email: ${context.customerEmail}`,
		`Date: ${context.dateLabel}`,
		`Time: ${context.timeLabel}`,
		context.meetingLink ? `Meeting link: ${context.meetingLink}` : null,
		context.manageUrl ? `Manage booking: ${context.manageUrl}` : null,
		'',
		customMessage,
		'',
		'Sent via Pride N Purpose Booking'
	].filter(Boolean);

	return lines.join('\n');
}

function buildHtmlEmail(context: BookingEmailContext) {
	const customMessage = resolveConfirmationEmailMessage(context);
	const locationLabel = context.workspace.locationLabel ?? 'Online';
	const meetingLinkLabel = context.meetingLink ?? 'Meeting link will be shared separately.';
	const details = [
		{ label: 'Date', value: context.dateLabel },
		{ label: 'Time', value: context.timeLabel },
		{ label: 'Duration', value: `${context.service.durationMinutes} minutes` },
		{ label: 'Location', value: locationLabel },
		{ label: 'Meeting link', value: meetingLinkLabel, isLink: Boolean(context.meetingLink) }
	];

	const detailsHtml = details
		.map((item) => {
			const value = item.isLink
				? `<a href="${escapeHtml(item.value)}" style="color:#0f766e; text-decoration:none; font-weight:600;">${escapeHtml(item.value)}</a>`
				: escapeHtml(item.value);

			return `
				<tr>
					<td style="padding:12px 0; border-bottom:1px solid #dbe7ee; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b; width:140px;">${escapeHtml(item.label)}</td>
					<td style="padding:12px 0; border-bottom:1px solid #dbe7ee; font-size:15px; line-height:1.6; color:#0f172a;">${value}</td>
				</tr>
			`;
		})
		.join('');

	return `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>${escapeHtml(context.workspace.name)} booking confirmation</title>
			</head>
			<body style="margin:0; padding:0; background-color:#edf4f7; font-family:Georgia, 'Times New Roman', serif; color:#0f172a;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#f8fbfc 0%,#edf4f7 100%); padding:32px 16px;">
					<tr>
						<td align="center">
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#ffffff; border:1px solid #d5e2e9; border-radius:28px; overflow:hidden; box-shadow:0 24px 80px rgba(93,122,139,0.12);">
								<tr>
									<td style="padding:40px 40px 24px; background:linear-gradient(135deg,#ffffff 0%,#f3f8fa 100%);">
										<div style="font-size:28px; line-height:1.2; color:#64748b; font-style:italic;">Pride N Purpose Booking</div>
										<h1 style="margin:18px 0 0; font-size:34px; line-height:1.2; font-weight:700; color:#384959;">Your meeting is confirmed.</h1>
										<p style="margin:14px 0 0; font-size:16px; line-height:1.7; color:#475569;">
											${escapeHtml(context.service.name)} has been scheduled successfully for ${escapeHtml(context.customerName)}.
										</p>
									</td>
								</tr>
								<tr>
									<td style="padding:0 40px 18px;">
										<div style="border:1px solid #d5e2e9; border-radius:24px; background:#f8fbfc; padding:24px;">
											<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
												${detailsHtml}
											</table>
										</div>
									</td>
								</tr>
								<tr>
									<td style="padding:6px 40px 8px;">
										${formatMessageAsHtml(customMessage)}
									</td>
								</tr>
								<tr>
									<td style="padding:8px 40px 40px;">
										${
											context.meetingLink
												? `<a href="${escapeHtml(context.meetingLink)}" style="display:inline-block; padding:14px 24px; border-radius:999px; background:#96c2db; color:#0f172a; font-size:15px; font-weight:700; text-decoration:none;">Join meeting</a>`
												: ''
										}
										${
											context.manageUrl
												? `<a href="${escapeHtml(context.manageUrl)}" style="display:inline-block; margin-left:12px; padding:14px 24px; border-radius:999px; border:1px solid #cbd5e1; color:#0f172a; font-size:15px; font-weight:700; text-decoration:none; background:#ffffff;">Manage booking</a>`
												: ''
										}
										<p style="margin:18px 0 0; font-size:13px; line-height:1.7; color:#64748b;">
											Use the manage booking link to cancel or reschedule online while changes are still allowed. If the change window has passed, reply to this email or use the contact information provided by ${escapeHtml(context.workspace.name)}.
										</p>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`;
}

function buildContactFormPlainTextEmail(context: ContactFormContext) {
	const lines = [
		'New contact form submission',
		'',
		`First name: ${context.firstName}`,
		`Last name: ${context.lastName}`,
		`Email: ${context.email}`,
		'',
		'Message:',
		context.message
	];

	return lines.join('\n');
}

function buildContactFormHtmlEmail(context: ContactFormContext) {
	return `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>New contact form submission</title>
			</head>
			<body style="margin:0; padding:0; background-color:#edf4f7; font-family:Georgia, 'Times New Roman', serif; color:#0f172a;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#f8fbfc 0%,#edf4f7 100%); padding:32px 16px;">
					<tr>
						<td align="center">
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; background:#ffffff; border:1px solid #d5e2e9; border-radius:28px; overflow:hidden; box-shadow:0 24px 80px rgba(93,122,139,0.12);">
								<tr>
									<td style="padding:40px 40px 24px; background:linear-gradient(135deg,#ffffff 0%,#f3f8fa 100%);">
										<div style="font-size:28px; line-height:1.2; color:#64748b; font-style:italic;">Pride N Purpose Booking</div>
										<h1 style="margin:18px 0 0; font-size:34px; line-height:1.2; font-weight:700; color:#384959;">New contact message</h1>
										<p style="margin:14px 0 0; font-size:16px; line-height:1.7; color:#475569;">
											A visitor submitted the contact form.
										</p>
									</td>
								</tr>
								<tr>
									<td style="padding:0 40px 18px;">
										<div style="border:1px solid #d5e2e9; border-radius:24px; background:#f8fbfc; padding:24px;">
											<p style="margin:0 0 10px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">First name</p>
											<p style="margin:0 0 18px; font-size:16px; line-height:1.6; color:#0f172a;">${escapeHtml(context.firstName)}</p>
											<p style="margin:0 0 10px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Last name</p>
											<p style="margin:0 0 18px; font-size:16px; line-height:1.6; color:#0f172a;">${escapeHtml(context.lastName)}</p>
											<p style="margin:0 0 10px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Email</p>
											<p style="margin:0 0 18px; font-size:16px; line-height:1.6; color:#0f172a;">
												<a href="mailto:${escapeHtml(context.email)}" style="color:#0f766e; text-decoration:none; font-weight:600;">${escapeHtml(context.email)}</a>
											</p>
											<p style="margin:0 0 10px; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b;">Message</p>
											<p style="margin:0; font-size:16px; line-height:1.7; color:#475569;">${escapeHtml(context.message).replaceAll('\n', '<br />')}</p>
										</div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`;
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

	const subject = `Pride N Purpose Booking: ${context.service.name} confirmed`;
	const text = buildPlainTextEmail(context);
	const html = buildHtmlEmail(context);
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
				text,
				html
			})
		)
	);
}

export async function sendContactFormNotification(context: ContactFormContext) {
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

	await resend.emails.send({
		from: status.emailFrom,
		to: status.contactFormTo,
		replyTo: context.email,
		subject: `New contact form message from ${context.firstName} ${context.lastName}`,
		text: buildContactFormPlainTextEmail(context),
		html: buildContactFormHtmlEmail(context)
	});
}
