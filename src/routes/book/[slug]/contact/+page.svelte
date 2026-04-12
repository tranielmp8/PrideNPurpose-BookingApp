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

		return {
			firstName: '',
			lastName: '',
			email: '',
			message: ''
		};
	}
</script>

<svelte:head>
	<title>Contact | {data.workspace.name}</title>
	<meta
		name="description"
		content={`Send a message to ${data.workspace.name} about booking questions or scheduling help.`}
	/>
</svelte:head>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-4 py-8 text-slate-900 sm:px-5 md:px-8 md:py-14">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white/92 p-6 shadow-[0_30px_90px_rgba(93,122,139,0.12)] backdrop-blur md:p-9">
			<p class="brand-script text-2xl text-slate-600 md:text-3xl">Pride N Purpose Bookings</p>
			<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-6xl">
				Get help before you book.
			</h1>
			<p class="mt-5 text-base leading-7 text-slate-600">
				Ask a question about services, availability, or anything else related to booking with {data.workspace.name}.
			</p>

			<div class="mt-8 grid gap-4">
				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Booking page</p>
					<a
						class="mt-3 inline-flex rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
						href={`/book/${data.workspace.slug}`}
					>
						Back to booking page
					</a>
				</div>

				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#96C2DB] p-5 text-slate-900">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">Also available</p>
					<div class="mt-3 flex flex-wrap gap-3">
						<a
							class="rounded-full border border-white/60 bg-white/65 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
							href={`/book/${data.workspace.slug}/privacy`}
						>
							Privacy Policy
						</a>
						<a
							class="rounded-full border border-white/60 bg-white/65 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
							href={`/book/${data.workspace.slug}/terms`}
						>
							Terms and Conditions
						</a>
					</div>
				</div>
			</div>
		</section>

		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-6 shadow-[0_35px_100px_rgba(93,122,139,0.1)] md:p-9">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Customer contact</p>
					<h2 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">Send a message</h2>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						Fill out the form below and your message will be sent to {data.workspace.name}.
					</p>
				</div>

				{#if form?.contactSuccess}
					<p class="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
						Message sent
					</p>
				{/if}
			</div>

			{#if form?.contactMessage}
				<p class="mt-6 rounded-[1.5rem] border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
					{form.contactMessage}
				</p>
			{/if}

			<form
				method="POST"
				use:enhance
				class="mt-8 space-y-6 rounded-[2rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5 md:p-6"
			>
				<div class="grid gap-5 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium text-slate-700" for="firstName">First name</label>
						<input
							class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
							id="firstName"
							name="firstName"
							required
							value={getContactValues().firstName}
						/>
					</div>

					<div>
						<label class="text-sm font-medium text-slate-700" for="lastName">Last name</label>
						<input
							class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
							id="lastName"
							name="lastName"
							required
							value={getContactValues().lastName}
						/>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="email">Email address</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="email"
						name="email"
						type="email"
						required
						value={getContactValues().email}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="message">Message</label>
					<textarea
						class="mt-2 block min-h-40 w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="message"
						name="message"
						required
					>{getContactValues().message}</textarea>
				</div>

				<button
					class="w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
					type="submit"
				>
					Send message
				</button>
			</form>
		</section>
	</div>
</div>
