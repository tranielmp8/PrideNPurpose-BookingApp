<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<div class="pnp-page">
	{#if data.customerAccount && data.workspace}
		<div class="mx-auto grid min-h-screen max-w-7xl gap-4 px-3 py-3 lg:grid-cols-[260px_1fr] lg:px-4 lg:py-4">

			<!-- Sidebar -->
			<aside class="rounded-2xl p-6 shadow-[var(--shadow-md)] flex flex-col"
				style="background: var(--gradient-brand); color: white;">
				<p class="brand-script text-2xl md:text-3xl text-white/90">PNP Connect</p>
				<div class="mt-6 border-t border-white/20 pt-5">
					<h2 class="text-xl font-semibold tracking-tight text-white">{data.customerAccount.name}</h2>
					<p class="mt-1 text-sm text-white/70">{data.customerAccount.email}</p>
					<p class="mt-3 text-sm leading-6 text-white/70">Manage connections with {data.workspace.name}.</p>
				</div>

				<nav class="mt-8 flex flex-col gap-1.5">
					<a
						class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
						href="/customer/dashboard"
					>
						Dashboard
					</a>
					<a
						class="rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
						href={`/book/${data.workspace.slug}`}
					>
						Booking page
					</a>
				</nav>

				<div class="mt-auto pt-6">
					<form method="POST" action="/customer/sign-out">
						<button
							class="w-full rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
							type="submit"
						>
							Sign out
						</button>
					</form>
				</div>
			</aside>

			<!-- Main content -->
			<main class="rounded-2xl border p-6 shadow-[var(--shadow-sm)] lg:p-8 pnp-surface"
				style="border-color: var(--c-border)">
				{@render children()}
			</main>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
