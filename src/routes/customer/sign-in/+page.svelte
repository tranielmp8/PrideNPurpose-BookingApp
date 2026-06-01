<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Customer Sign In | PNP Connect</title>
</svelte:head>

<div class="pnp-page px-6 py-16">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">

		<!-- Left brand panel -->
		<section class="rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-[var(--shadow-lg)]"
			style="background: linear-gradient(145deg, #e85521 0%, #c94818 100%); color: white;">
			<div class="flex items-start justify-between gap-4">
				<p class="brand-wordmark text-white/80">PNP Connect</p>
				<a
					class="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm text-white/90 transition hover:bg-white/25 hover:text-white"
					href={data.workspace ? `/book/${data.workspace.slug}` : '/'}
				>
					Back
				</a>
			</div>
			<div class="mt-auto pt-12">
				<h1 class="font-serif text-4xl leading-tight tracking-tight text-white md:text-5xl">
					Sign in to manage your bookings.
				</h1>
				<p class="mt-5 max-w-xl text-base leading-7 text-white/80">
					View upcoming sessions, manage booking changes, and keep your appointment history in one
					place.
				</p>
			</div>
		</section>

		<!-- Right form panel -->
		<section class="rounded-[2.5rem] border p-8 md:p-10 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<p class="text-sm font-semibold uppercase tracking-[0.3em]" style="color: var(--c-text3)">Customer access</p>
			<h2 class="mt-4 text-3xl font-semibold tracking-tight" style="color: var(--c-text)">Customer sign in</h2>
			<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
				Use your customer account to manage bookings for {data.workspace?.name ?? 'this workspace'}.
			</p>
			{#if !data.workspace}
				<p class="mt-3 rounded-2xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
					If you are creating a new customer account, start from a booking page so your account
					connects to the correct workspace.
				</p>
			{/if}

			<form method="POST" use:enhance class="mt-8 space-y-5">
				<input type="hidden" name="workspaceSlug" value={data.workspaceSlug} />

				<div>
					<label class="text-sm font-medium" for="email" style="color: var(--c-text2)">Email</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="email"
						name="email"
						type="email"
						required
						value={form?.email ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium" for="password" style="color: var(--c-text2)">Password</label>
					<input
						class="mt-2 block w-full rounded-2xl border px-4 py-3 text-sm transition focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521] outline-none"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="password"
						name="password"
						type="password"
						required
					/>
				</div>

				{#if form?.message}
					<p class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
						{form.message}
					</p>
				{/if}

				<button
					class="w-full rounded-full px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_20px_rgba(232,85,33,0.35)]"
					type="submit"
				>
					Sign in
				</button>
			</form>

			<p class="mt-6 text-sm" style="color: var(--c-text2)">
				Need an account?
				<a
					class="font-medium underline hover:text-[#e85521] transition"
					style="color: var(--c-text)"
					href={`/customer/sign-up${data.workspaceSlug ? `?workspace=${data.workspaceSlug}` : ''}`}
				>
					Create one
				</a>
			</p>
			<p class="mt-3 text-sm" style="color: var(--c-text2)">
				Provider account?
				<a class="font-medium underline hover:text-[#e85521] transition" style="color: var(--c-text)" href="/auth">Use provider sign in</a>
			</p>
		</section>
	</div>
</div>
