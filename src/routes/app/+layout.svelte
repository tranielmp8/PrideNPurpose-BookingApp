<script lang="ts">
	import type { LayoutData } from './$types';

	const navItems = [
		{ href: '/app/dashboard', label: 'Dashboard' },
		{ href: '/app/services', label: 'Services' },
		{ href: '/app/availability', label: 'Availability' },
		{ href: '/app/bookings', label: 'Bookings' },
		{ href: '/app/settings', label: 'Settings' }
	];

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<div class="min-h-screen bg-[#f4f1ea] text-stone-900">
	<div class="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr]">
		<aside class="rounded-[2rem] bg-stone-950 p-6 text-stone-100">
			<a class="text-sm uppercase tracking-[0.3em] text-amber-300" href="/">Booking App</a>
			<h2 class="mt-6 text-2xl font-semibold tracking-tight">{data.workspace.name}</h2>
			<p class="mt-2 text-sm text-stone-400">/{data.workspace.slug}</p>
			<p class="mt-4 text-sm leading-6 text-stone-400">
				Signed in as {data.user.name || data.user.email}
			</p>

			<nav class="mt-8 flex flex-col gap-2">
				{#each navItems as item}
					<a
						class="rounded-2xl px-4 py-3 text-sm text-stone-300 transition hover:bg-white/10 hover:text-white"
						href={item.href}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<form class="mt-8" method="POST" action="/auth/sign-out">
				<button
					class="w-full rounded-full border border-white/10 px-4 py-3 text-sm text-stone-200 transition hover:bg-white/10"
					type="submit"
				>
					Sign out
				</button>
			</form>
		</aside>

		<main class="rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
