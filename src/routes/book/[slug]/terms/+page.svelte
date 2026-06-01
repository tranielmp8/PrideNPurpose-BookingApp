<svelte:head>
	<title>Terms and Conditions | PNP Connect</title>
</svelte:head>

<script lang="ts">
	let { data } = $props();
</script>

<div class="pnp-page px-5 py-10 md:px-8 md:py-14">
	<div class="mx-auto max-w-4xl rounded-[2.5rem] border p-7 md:p-10 shadow-[var(--shadow-lg)] pnp-surface"
		style="border-color: var(--c-border)">
		<div class="flex flex-wrap gap-3">
			<a
				class="inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-semibold text-white pnp-btn-primary sm:w-auto shadow-[0_4px_16px_rgba(232,85,33,0.3)]"
				href={`/book/${data.workspace.slug}`}
			>
				Back to booking page
			</a>
			<a
				class="inline-flex w-full justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521] sm:w-auto"
				style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
				href={`/book/${data.workspace.slug}/contact`}
			>
				Contact
			</a>
			<a
				class="inline-flex w-full justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521] sm:w-auto"
				style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
				href={`/book/${data.workspace.slug}/privacy`}
			>
				Privacy Policy
			</a>
		</div>

		<p class="brand-script mt-8 text-2xl md:text-3xl" style="color: var(--c-text2)">PNP Connect</p>
		<h1 class="mt-4 font-serif text-4xl tracking-tight md:text-5xl" style="color: var(--c-text)">Terms and Conditions</h1>
		<p class="mt-4 text-sm leading-7" style="color: var(--c-text2)">
			Last updated: April 12, 2026
		</p>

		<div class="prose prose-slate dark:prose-invert mt-8 max-w-none">
			<p>
				These Terms and Conditions govern your use of PNP Connect and your scheduling of
				meetings, consultations, or related services through this site.
			</p>

			<h2>Use of the Booking Service</h2>
			<p>
				By using PNP Connect, you agree to provide accurate information and to use the service only
				for lawful and legitimate scheduling purposes.
			</p>

			<h2>Service Fees and Charges</h2>
			<p>
				PNP Connect is a platform that enables service providers to offer their own services,
				consultations, and sessions. Any fees, charges, or rates associated with a booking are set
				entirely at the discretion of the individual service provider. Pride N Purpose Bookings does
				not set, control, or guarantee the pricing of any service offered through this platform.
			</p>
			<p>
				Customers are responsible for reviewing the fees associated with any service before
				completing a booking. By submitting a booking request, you acknowledge and agree to the
				terms and pricing set by the service provider.
			</p>

			<h2>Bookings</h2>
			<p>
				A booking request is not guaranteed until it has been accepted and confirmed through the
				platform or by direct communication. We may decline, reschedule, or cancel bookings when
				necessary.
			</p>

			<h2>Availability and Changes</h2>
			<p>
				Meeting availability may change at any time. We reserve the right to update schedules,
				service offerings, durations, pricing, locations, or meeting links without prior notice.
			</p>

			<h2>Client Responsibilities</h2>
			<p>You agree to:</p>
			<ul>
				<li>Provide correct contact details when booking</li>
				<li>Attend meetings on time</li>
				<li>Review any confirmation emails or meeting instructions sent to you</li>
				<li>Use meeting links only for your own scheduled appointment</li>
			</ul>

			<h2>Cancellations and Rescheduling</h2>
			<p>
				Cancellation and rescheduling availability may depend on the service, timing, and business
				policies in effect at the time of booking.
			</p>

			<h2>No Guarantees</h2>
			<p>
				We make reasonable efforts to provide accurate scheduling and meeting information, but we do
				not guarantee uninterrupted availability of the booking platform, email delivery, or
				third-party meeting services.
			</p>

			<h2>Limitation of Liability</h2>
			<p>
				To the maximum extent permitted by law, we are not liable for indirect, incidental, special,
				or consequential damages arising from your use of PNP Connect or any meeting scheduled
				through it.
			</p>

			<h2>Third-Party Services</h2>
			<p>
				This booking experience may rely on third-party providers for hosting, communications, or
				virtual meetings. Their systems and policies may also affect your experience.
			</p>

			<h2>Intellectual Property</h2>
			<p>
				All content, branding, design, and materials on PNP Connect remain the property of their
				respective owner unless otherwise stated.
			</p>

			<h2>Changes to These Terms</h2>
			<p>
				We may update these Terms and Conditions at any time. Continued use of PNP Connect after
				changes are posted means you accept the updated terms.
			</p>

			<h2>Contact</h2>
			<p>
				If you have questions about these Terms and Conditions, please contact us using the contact
				information provided on the booking page or in your confirmation email.
			</p>
		</div>
	</div>
</div>
