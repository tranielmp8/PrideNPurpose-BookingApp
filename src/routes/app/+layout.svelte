<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	const navItems = [
		{ href: '/app/dashboard', label: 'Dashboard' },
		{ href: '/app/services', label: 'Services' },
		{ href: '/app/availability', label: 'Availability' },
		{ href: '/app/bookings', label: 'Bookings' },
		{ href: '/app/archive', label: 'Archive' },
		{ href: '/app/settings', label: 'Settings' }
	];

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<div class="pnp-page">
	<div class="mx-auto grid min-h-screen max-w-7xl gap-4 px-3 py-3 lg:grid-cols-[260px_1fr] lg:px-4 lg:py-4">

		<!-- Sidebar -->
		<aside class="border rounded-2xl p-5 shadow-[var(--shadow-sm)] pnp-surface flex flex-col"
			style="border-color: var(--c-border)">
			<a class="block text-sm font-bold uppercase tracking-[0.2em] pnp-nav-link-heading" href="/">
				PNP Connect
			</a>

			<div class="mt-6 border-t pt-5" style="border-color: var(--c-border)">
				<h2 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">{data.workspace.name}</h2>
				<p class="mt-1 break-all text-xs" style="color: var(--c-text3)">/book/{data.workspace.slug}</p>
			</div>

			<p class="mt-4 text-xs leading-5" style="color: var(--c-text2)">
				Signed in as <span style="color: var(--c-text)">{data.user.name || data.user.email}</span>
			</p>

			<nav class="mt-6 flex flex-col gap-0.5" aria-label="Provider navigation">
				<a class="rounded-xl px-4 py-2.5 text-sm font-medium pnp-nav-link" href="/">
					Home
				</a>
				{#each navItems as item}
					<a
						class={[
							'rounded-xl border-l-4 px-4 py-2.5 text-sm font-semibold transition',
							isActive(item.href)
								? 'border-[#e85521] bg-[#e85521]/10 text-[#e85521]'
								: 'border-transparent pnp-nav-link hover:bg-[#e85521]/8'
						]}
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="mt-auto pt-6">
				<form method="POST" action="/auth/sign-out">
					<button
						class="w-full rounded-xl border px-4 py-2.5 text-sm font-semibold pnp-nav-link transition hover:border-[#e85521] hover:bg-[#e85521]/8"
						style="border-color: var(--c-border); background-color: var(--c-muted)"
						type="submit"
					>
						Sign out
					</button>
				</form>
			</div>
		</aside>

		<!-- Main content -->
		<main class="border rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-sm)] pnp-surface"
			style="border-color: var(--c-border)">
			{@render children()}
		</main>
	</div>
</div>
