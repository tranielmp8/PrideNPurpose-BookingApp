<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	type ContactValues = {
		firstName: string;
		lastName: string;
		email: string;
		message: string;
	};

	function getContactValues(): ContactValues {
		if (form && typeof form === 'object' && 'contactValues' in form) {
			return form.contactValues as ContactValues;
		}
		return { firstName: '', lastName: '', email: '', message: '' };
	}
</script>

<svelte:head>
	<title>Contact | {data.workspace.name}</title>
	<meta
		name="description"
		content={`Send a message to ${data.workspace.name} about booking questions or scheduling help.`}
	/>
</svelte:head>

<div class="pnp-page px-4 py-8 sm:px-5 md:px-8 md:py-14">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">

		<!-- Left info panel -->
		<section class="rounded-[2.5rem] border p-6 md:p-9 shadow-[var(--shadow-lg)] pnp-surface"
			style="border-color: var(--c-border)">
			<p class="brand-script text-2xl md:text-3xl" style="color: var(--c-text2)">PNP Connect</p>
			<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight md:text-6xl" style="color: var(--c-text)">
				Get help before you book.
			</h1>
			<p class="mt-5 text-base leading-7" style="color: var(--c-text2)">
				Ask a question about services, availability, or anything else related to booking with {data.workspace.name}.
			</p>

			<div class="mt-8 grid gap-4">
				<div class="rounded-[1.75rem] border p-5 pnp-muted" style="border-color: var(--c-border)">
					<p class="text-xs font-semibold uppercase tracking-[0.25em]" style="color: var(--c-text3)">Booking page</p>
					<a
						class="mt-3 inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
						style="border-color: var(--c-border); color: var(--c-text2)"
						href={`/book/${data.workspace.slug}`}
					>
						Back to booking page
					</a>
				</div>

				<div class="rounded-[1.75rem] p-5 shadow-[var(--shadow-sm)]"
					style="background: linear-gradient(135deg, #e85521 0%, #c94818 100%); color: white;">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Also available</p>
					<div class="mt-3 flex flex-wrap gap-3">
						<a
							class="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
							href={`/book/${data.workspace.slug}/privacy`}
						>
							Privacy Policy
						</a>
						<a
							class="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
							href={`/book/${data.workspace.slug}/terms`}
						>
							Terms and Conditions
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- Right form panel -->
		<section class="rounded-[2.5rem] border p-6 md:p-9 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.28em]" style="color: var(--c-text3)">Customer contact</p>
					<h2 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">Send a message</h2>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Fill out the form below and your message will be sent to {data.workspace.name}.
					</p>
				</div>

				{#if form?.contactSuccess}
					<p class="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-500">
						Message sent
					</p>
				{/if}
			</div>

			{#if form?.contactMessage}
				<p class="mt-6 rounded-[1.5rem] border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
					{form.contactMessage}
				</p>
			{/if}

			<form
				method="POST"
				use:enhance
				class="mt-8 space-y-6 rounded-[2rem] border p-5 md:p-6 pnp-muted"
				style="border-color: var(--c-border)"
			>
				<div class="grid gap-5 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium" for="firstName" style="color: var(--c-text2)">First name</label>
						<input
							class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521]"
							style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
							id="firstName" name="firstName" required value={getContactValues().firstName}
						/>
					</div>
					<div>
						<label class="text-sm font-medium" for="lastName" style="color: var(--c-text2)">Last name</label>
						<input
							class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521]"
							style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
							id="lastName" name="lastName" required value={getContactValues().lastName}
						/>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium" for="email" style="color: var(--c-text2)">Email address</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="email" name="email" type="email" required value={getContactValues().email}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="message" style="color: var(--c-text2)">Message</label>
					<textarea
						class="mt-2 block min-h-40 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="message" name="message" required
					>{getContactValues().message}</textarea>
				</div>

				<button
					class="w-full rounded-full px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_20px_rgba(232,85,33,0.35)]"
					type="submit"
				>
					Send message
				</button>
			</form>
		</section>
	</div>
</div>
