<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create Account | Pride N Purpose</title>
</svelte:head>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-6 py-16 text-slate-900">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-[#96C2DB] p-8 text-slate-900 shadow-[0_28px_80px_rgba(93,122,139,0.14)] md:p-10">
			<div class="flex items-start justify-between gap-4">
				<p class="brand-script text-2xl text-slate-700 md:text-3xl">Pride N Purpose Conversations</p>
				<a
					class="rounded-full border border-white/60 bg-white/30 px-4 py-2 text-sm text-slate-900 transition hover:bg-white/55"
					href="/"
				>
					Home
				</a>
			</div>
			<h1 class="mt-6 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-5xl">
				Create your provider account and start accepting bookings.
			</h1>
			<p class="mt-5 max-w-xl text-base leading-7 text-slate-700">
				Start with your business basics. After sign-up, onboarding will create your first
				workspace and public booking link.
			</p>
		</section>

		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-8 shadow-[0_28px_80px_rgba(93,122,139,0.1)] md:p-10">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Provider access</p>
			<h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#384959]">
				Create your provider account
			</h2>
			<p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">
				Add your details, your business name, and your timezone to get started.
			</p>

			<form method="POST" use:enhance class="mt-8 grid gap-5 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-slate-700" for="name">Your name</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="name"
						name="name"
						required
						value={form?.values?.name ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="businessName">Business name</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="businessName"
						name="businessName"
						required
						value={form?.values?.businessName ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="email">Email</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="email"
						name="email"
						type="email"
						required
						value={form?.values?.email ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="timezone">Timezone</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="timezone"
						name="timezone"
						required
						value={form?.values?.timezone ?? DEFAULT_WORKSPACE_TIMEZONE}
					/>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="password">Password</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="password"
						name="password"
						type="password"
						minlength="8"
						required
					/>
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
						{form.message}
					</p>
				{/if}

				<div class="md:col-span-2">
					<button
						class="w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
						type="submit"
					>
						Create account
					</button>
				</div>
			</form>

			<p class="mt-6 text-sm text-slate-600">
				Already have an account? <a class="font-medium text-slate-900 underline" href="/auth/sign-in">Sign in</a>
			</p>
			<p class="mt-3 text-sm text-slate-600">
				Looking for customer access? <a class="font-medium text-slate-900 underline" href="/auth">Choose customer sign in instead</a>
			</p>
		</section>
	</div>
</div>
