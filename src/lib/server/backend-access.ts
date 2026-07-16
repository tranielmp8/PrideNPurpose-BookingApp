import { env } from '$env/dynamic/private';

function normalizeEmail(email: string | null | undefined) {
	return email?.trim().toLowerCase() ?? '';
}

function getBackendOwnerEmails() {
	return (env.BACKEND_OWNER_EMAIL ?? '')
		.split(',')
		.map(normalizeEmail)
		.filter(Boolean);
}

export function isBackendOwner(email: string | null | undefined) {
	const normalizedEmail = normalizeEmail(email);
	return normalizedEmail.length > 0 && getBackendOwnerEmails().includes(normalizedEmail);
}

export function isBackendOwnerConfigured() {
	return getBackendOwnerEmails().length > 0;
}
