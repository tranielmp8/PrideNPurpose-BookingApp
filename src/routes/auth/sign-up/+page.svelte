<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create Account | PNP Connect</title>
</svelte:head>

<div class="pnp-page px-6 py-16">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">

		<!-- Left brand panel -->
		<section class="rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-[var(--shadow-lg)]"
			style="background: var(--gradient-brand); color: white;">
			<div class="flex items-start justify-between gap-4">
				<p class="brand-wordmark text-white/80">PNP Connect</p>
				<a
					class="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white/90 transition hover:bg-white/25 hover:text-white"
					href="/"
				>
					Home
				</a>
			</div>
			<div class="mt-auto pt-12">
				<h1 class="font-serif text-4xl leading-tight tracking-tight text-white md:text-5xl">
					Create your provider account and start accepting bookings.
				</h1>
				<p class="mt-5 max-w-xl text-base leading-7 text-white/80">
					Start with your business basics. After sign-up, onboarding will create your first
					workspace and public booking link.
				</p>
			</div>
		</section>

		<!-- Right form panel -->
		<section class="rounded-[2.5rem] border p-8 md:p-10 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<p class="text-sm font-semibold uppercase tracking-[0.3em]" style="color: var(--c-text3)">Provider access</p>
			<h2 class="mt-4 text-3xl font-semibold tracking-tight" style="color: var(--c-text)">
				Create your provider account
			</h2>
			<p class="mt-3 max-w-xl text-sm leading-6" style="color: var(--c-text2)">
				Add your details, your business name, and your timezone to get started.
			</p>

			<form method="POST" use:enhance class="mt-8 grid gap-5 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium" for="name" style="color: var(--c-text2)">Your name</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="name"
						name="name"
						required
						value={form?.values?.name ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="businessName" style="color: var(--c-text2)">Business name</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="businessName"
						name="businessName"
						required
						value={form?.values?.businessName ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="email" style="color: var(--c-text2)">Email</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="email"
						name="email"
						type="email"
						required
						value={form?.values?.email ?? ''}
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
						value={form?.values?.timezone ?? DEFAULT_WORKSPACE_TIMEZONE}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="password" style="color: var(--c-text2)">Password</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="password"
						name="password"
						type="password"
						minlength="8"
						required
					/>
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
						{form.message}
					</p>
				{/if}

				<div class="md:col-span-2">
					<button
						class="w-full rounded-full px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_20px_rgba(194,65,12,0.35)]"
						type="submit"
					>
						Create account
					</button>
				</div>
			</form>

			<p class="mt-6 text-sm" style="color: var(--c-text2)">
				Already have an account?
				<a class="font-medium underline hover:text-[#c2410c] transition" style="color: var(--c-text)" href="/auth/sign-in">Sign in</a>
			</p>
			<p class="mt-3 text-sm" style="color: var(--c-text2)">
				Looking for customer access?
				<a class="font-medium underline hover:text-[#c2410c] transition" style="color: var(--c-text)" href="/auth">Choose customer sign in instead</a>
			</p>
		</section>
	</div>
</div>
