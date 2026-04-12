<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Onboarding | Pride N Purpose Conversations</title>
</svelte:head>

<div class="min-h-screen bg-stone-950 px-6 py-16 text-stone-100">
	<div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
		<section class="rounded-[2rem] border border-white/10 bg-white/5 p-8">
			<p class="text-sm uppercase tracking-[0.3em] text-amber-300">Onboarding</p>
			<h1 class="mt-4 text-4xl font-semibold tracking-tight">Create the workspace your customers will book.</h1>
			<p class="mt-4 text-sm leading-6 text-stone-300">
				This step creates your first booking page and business profile. You can refine services
				and availability after this.
			</p>
		</section>

		<section class="rounded-[2rem] bg-white p-8 text-stone-900 shadow-2xl shadow-black/20">
			<form method="POST" use:enhance class="space-y-5">
				<div>
					<label class="text-sm font-medium text-stone-700" for="businessName">Business name</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="businessName"
						name="businessName"
						required
						value={form?.values?.businessName ?? data.businessName}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="timezone">Timezone</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="timezone"
						name="timezone"
						required
						value={form?.values?.timezone ?? data.timezone ?? DEFAULT_WORKSPACE_TIMEZONE}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="contactEmail">Contact email</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="contactEmail"
						name="contactEmail"
						type="email"
						required
						value={form?.values?.contactEmail ?? data.contactEmail ?? data.email}
					/>
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.message}
					</p>
				{/if}

				<button
					class="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
					type="submit"
				>
					Create workspace
				</button>
			</form>
		</section>
	</div>
</div>
