import { fail, type Actions } from '@sveltejs/kit';
import { sendContactFormNotification } from '$lib/server/email';

function normalize(value: FormDataEntryValue | null) {
	return value?.toString().trim() ?? '';
}

export const actions: Actions = {
	default: async ({ request }) => {
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
				message
			});
		} catch (contactError) {
			console.error('Contact form email failed', contactError);
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
