<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let password = $state('');
	let confirmPassword = $state('');

	const passwordMismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);
</script>

<svelte:head>
	<title>Customer Sign Up | Pride N Purpose Bookings</title>
</svelte:head>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-6 py-16 text-slate-900">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-[#96C2DB] p-8 text-slate-900 shadow-[0_28px_80px_rgba(93,122,139,0.14)] md:p-10">
			<div class="flex items-start justify-between gap-4">
				<p class="brand-script text-2xl text-slate-700 md:text-3xl">Pride N Purpose Bookings</p>
				<a
					class="rounded-full border border-white/60 bg-white/30 px-4 py-2 text-sm text-slate-900 transition hover:bg-white/55"
					href={data.workspace ? `/book/${data.workspace.slug}` : '/'}
				>
					Back
				</a>
			</div>
			<h1 class="mt-6 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-5xl">
				Create your customer account.
			</h1>
			<p class="mt-5 max-w-xl text-base leading-7 text-slate-700">
				Set up a customer login so you can keep track of your sessions and manage future bookings more easily.
			</p>
		</section>

		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-8 shadow-[0_28px_80px_rgba(93,122,139,0.1)] md:p-10">
			<p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Customer access</p>
			<h2 class="mt-4 text-3xl font-semibold tracking-tight text-[#384959]">Create customer account</h2>
			<p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">
				This account will be connected to {data.workspace?.name ?? 'this booking workspace'}.
			</p>
			{#if !data.workspaceSlug}
				<p class="mt-4 rounded-2xl border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
					Start customer sign-up from a booking page so your account connects to the right booking workspace.
				</p>
			{/if}

			<form method="POST" use:enhance class="mt-8 grid gap-5">
				<input type="hidden" name="workspaceSlug" value={data.workspaceSlug} />

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
					<label class="text-sm font-medium text-slate-700" for="password">Password</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="password"
						name="password"
						type="password"
						minlength="8"
						required
						bind:value={password}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="confirmPassword">Confirm password</label>
					<input
						class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm {passwordMismatch ? 'border-red-400 ring-1 ring-red-300' : ''}"
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						minlength="8"
						required
						bind:value={confirmPassword}
					/>
					{#if passwordMismatch}
						<p class="mt-2 text-xs text-red-600">Passwords do not match.</p>
					{/if}
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.message}
					</p>
				{/if}

				<div>
					<button
						class="w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1] disabled:cursor-not-allowed disabled:bg-[#c9dbe5] disabled:text-slate-600"
						type="submit"
						disabled={!data.workspaceSlug || passwordMismatch}
					>
						Create account
					</button>
				</div>
			</form>

			<p class="mt-6 text-sm text-slate-600">
				Already have an account?
				<a
					class="font-medium text-slate-900 underline"
					href={`/customer/sign-in${data.workspaceSlug ? `?workspace=${data.workspaceSlug}` : ''}`}
				>
					Sign in
				</a>
			</p>
			<p class="mt-3 text-sm text-slate-600">
				Provider account? <a class="font-medium text-slate-900 underline" href="/auth">Use provider sign in</a>
			</p>
		</section>
	</div>
</div>
