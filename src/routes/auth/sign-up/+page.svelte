<script lang="ts">
	import { enhance } from '$app/forms';
	import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign Up | Booking App</title>
</svelte:head>

<div class="min-h-screen bg-stone-100 px-6 py-16 text-stone-900">
	<div class="mx-auto max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Auth</p>
		<h1 class="mt-4 text-3xl font-semibold tracking-tight">Create your provider account</h1>
		<p class="mt-3 max-w-xl text-sm leading-6 text-stone-600">
			Start with your account details and your business basics. After sign-up, onboarding will
			create the first public booking workspace.
		</p>

		<form method="POST" use:enhance class="mt-8 grid gap-5 md:grid-cols-2">
			<div>
				<label class="text-sm font-medium text-stone-700" for="name">Your name</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="name"
					name="name"
					required
					value={form?.values?.name ?? ''}
				/>
			</div>

			<div>
				<label class="text-sm font-medium text-stone-700" for="businessName">Business name</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="businessName"
					name="businessName"
					required
					value={form?.values?.businessName ?? ''}
				/>
			</div>

			<div>
				<label class="text-sm font-medium text-stone-700" for="email">Email</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="email"
					name="email"
					type="email"
					required
					value={form?.values?.email ?? ''}
				/>
			</div>

			<div>
				<label class="text-sm font-medium text-stone-700" for="timezone">Timezone</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="timezone"
					name="timezone"
					required
					value={form?.values?.timezone ?? DEFAULT_WORKSPACE_TIMEZONE}
				/>
			</div>

			<div class="md:col-span-2">
				<label class="text-sm font-medium text-stone-700" for="password">Password</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
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
					class="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
					type="submit"
				>
					Create account
				</button>
			</div>
		</form>

		<p class="mt-6 text-sm text-stone-600">
			Already have an account? <a class="font-medium text-stone-950 underline" href="/auth/sign-in">Sign in</a>
		</p>
	</div>
</div>
