<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign In | Pride N Purpose</title>
</svelte:head>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-6 py-16 text-slate-900">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-[#96C2DB] p-8 text-slate-900 shadow-[0_28px_80px_rgba(93,122,139,0.14)] md:p-10">
			<p class="brand-script text-2xl text-slate-700 md:text-3xl">Pride N Purpose</p>
			<h1 class="mt-6 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-5xl">
				Sign in to manage your schedule with calm and clarity.
			</h1>
			<p class="mt-5 max-w-xl text-base leading-7 text-slate-700">
				Access your provider dashboard, update availability, manage bookings, and keep every
				customer touchpoint organized.
			</p>
		</section>

		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-8 shadow-[0_28px_80px_rgba(93,122,139,0.1)] md:p-10">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Auth</p>
			<h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#384959]">
				Sign in to your workspace
			</h2>
			<p class="mt-3 text-sm leading-6 text-slate-600">
				Use your provider account to manage services, availability, and bookings.
			</p>

			<form method="POST" use:enhance class="mt-8 space-y-5">
				<div>
					<label class="text-sm font-medium text-slate-700" for="email">Email</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="email"
						name="email"
						type="email"
						required
						value={form?.email ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="password">Password</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
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
					class="w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
					type="submit"
				>
					Sign in
				</button>
			</form>

			<p class="mt-6 text-sm text-slate-600">
				Need an account? <a class="font-medium text-slate-900 underline" href="/auth/sign-up">Create one</a>
			</p>
		</section>
	</div>
</div>
