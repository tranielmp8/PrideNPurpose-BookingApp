<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign In | Booking App</title>
</svelte:head>

<div class="min-h-screen bg-stone-100 px-6 py-16 text-stone-900">
	<div class="mx-auto max-w-lg rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Auth</p>
		<h1 class="mt-4 text-3xl font-semibold tracking-tight">Sign in to your workspace</h1>
		<p class="mt-3 text-sm leading-6 text-stone-600">
			Use your provider account to manage services, availability, and bookings.
		</p>

		<form method="POST" use:enhance class="mt-8 space-y-5">
			<div>
				<label class="text-sm font-medium text-stone-700" for="email">Email</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="email"
					name="email"
					type="email"
					required
					value={form?.email ?? ''}
				/>
			</div>

			<div>
				<label class="text-sm font-medium text-stone-700" for="password">Password</label>
				<input
					class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
					id="password"
					name="password"
					type="password"
					required
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
				Sign in
			</button>
		</form>

		<p class="mt-6 text-sm text-stone-600">
			Need an account? <a class="font-medium text-stone-950 underline" href="/auth/sign-up">Create one</a>
		</p>
	</div>
</div>
