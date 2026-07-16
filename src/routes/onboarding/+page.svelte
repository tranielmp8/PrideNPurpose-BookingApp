<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Onboarding | PNP Connect</title>
</svelte:head>

<div class="pnp-page px-6 py-16">
	<div class="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">

		<!-- Left brand panel -->
		<section class="rounded-[2rem] p-8 flex flex-col justify-between shadow-[var(--shadow-lg)]"
			style="background: var(--gradient-brand); border: 1px solid var(--color-border);">
			<p class="text-xs uppercase tracking-[0.3em] text-[#c2410c] font-semibold">Onboarding</p>
			<div class="mt-auto pt-10">
				<h1 class="text-4xl font-semibold tracking-tight text-white">
					Create the workspace your customers will book.
				</h1>
				<p class="mt-4 text-sm leading-6 text-white/60">
					This step creates your first booking page and business profile. You can refine services
					and availability after this.
				</p>
			</div>
		</section>

		<!-- Right form panel -->
		<section class="rounded-[2rem] border p-8 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<form method="POST" use:enhance class="space-y-5">
				<div>
					<label class="text-sm font-medium" for="businessName" style="color: var(--c-text2)">Business name</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="businessName"
						name="businessName"
						required
						value={form?.values?.businessName ?? data.businessName}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="timezone" style="color: var(--c-text2)">Timezone</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="timezone"
						name="timezone"
						required
						value={form?.values?.timezone ?? data.timezone ?? DEFAULT_WORKSPACE_TIMEZONE}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="contactEmail" style="color: var(--c-text2)">Contact email</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="contactEmail"
						name="contactEmail"
						type="email"
						required
						value={form?.values?.contactEmail ?? data.contactEmail ?? data.email}
					/>
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
						{form.message}
					</p>
				{/if}

				<button
					class="w-full rounded-full px-5 py-3 text-sm font-medium text-white pnp-btn-primary shadow-[0_4px_20px_rgba(194,65,12,0.35)]"
					type="submit"
				>
					Create workspace
				</button>
			</form>
		</section>
	</div>
</div>
