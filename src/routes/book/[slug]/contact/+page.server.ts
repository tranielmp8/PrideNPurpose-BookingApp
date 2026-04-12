import { fail, error, type Actions, type ServerLoad } from '@sveltejs/kit';
import { sendContactFormNotification } from '$lib/server/email';
import { getWorkspaceBySlug } from '$lib/server/workspace';

function normalize(value: FormDataEntryValue | null) {
	return value?.toString().trim() ?? '';
}

export const load = (async ({ params }) => {
	const slug = params.slug;
	if (!slug) {
		throw error(404, 'Booking page not found');
	}

	const workspace = await getWorkspaceBySlug(slug);
	if (!workspace) {
		throw error(404, 'Booking page not found');
	}

	return {
		workspace
	};
}) satisfies ServerLoad;

export const actions: Actions = {
	default: async ({ params, request }) => {
		const slug = params.slug;
		if (!slug) {
			return fail(404, { contactMessage: 'Booking page not found.' });
		}

		const workspace = await getWorkspaceBySlug(slug);
		if (!workspace) {
			return fail(404, { contactMessage: 'Booking page not found.' });
		}

		const formData = await request.formData();
		const firstName = normalize(formData.get('firstName'));
		const lastName = normalize(formData.get('lastName'));
		const email = normalize(formData.get('email')).toLowerCase();
		const message = normalize(formData.get('message'));

		if (!firstName || !lastName || !email || !message) {
			return fail(400, {
				contactMessage: 'First name, last name, email, and message are required.',
				contactValues: { firstName, lastName, email, message }
			});
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email)) {
			return fail(400, {
				contactMessage: 'Enter a valid email address.',
				contactValues: { firstName, lastName, email, message }
			});
		}

		try {
			await sendContactFormNotification({
				firstName,
				lastName,
				email,
				message,
				recipientEmail: workspace.contactEmail,
				subjectPrefix: `New booking inquiry for ${workspace.name}`
			});
		} catch (contactError) {
			console.error('Customer contact form email failed', contactError);
			return fail(500, {
				contactMessage: 'Your message could not be sent right now. Please try again shortly.',
				contactValues: { firstName, lastName, email, message }
			});
		}

		return {
			contactSuccess: true,
			contactMessage: 'Your message has been sent. We will get back to you soon.',
			contactValues: { firstName: '', lastName: '', email: '', message: '' }
		};
	}
};
