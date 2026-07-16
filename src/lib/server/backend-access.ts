import { env } from '$env/dynamic/private';

function normalizeEmail(email: string | null | undefined) {
	return email?.trim().toLowerCase() ?? '';
}

export function isBackendOwner(email: string | null | undefined) {
	const ownerEmail = normalizeEmail(env.BACKEND_OWNER_EMAIL);
	return ownerEmail.length > 0 && normalizeEmail(email) === ownerEmail;
}

export function isBackendOwnerConfigured() {
	return normalizeEmail(env.BACKEND_OWNER_EMAIL).length > 0;
}
