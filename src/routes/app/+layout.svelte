<script lang="ts">
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
</script>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] text-slate-900">
	<div class="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr]">
		<aside class="rounded-[2rem] border border-[#d5e2e9] bg-[#96C2DB] p-6 text-slate-900 shadow-[0_20px_60px_rgba(93,122,139,0.12)]">
			<a class="brand-script text-2xl text-slate-700 md:text-3xl" href="/">Pride N Purpose Conversations</a>
			<h2 class="mt-6 text-2xl font-semibold tracking-tight">{data.workspace.name}</h2>
			<p class="mt-2 text-sm text-slate-700">/{data.workspace.slug}</p>
			<p class="mt-4 text-sm leading-6 text-slate-700">
				Signed in as {data.user.name || data.user.email}
			</p>

			<nav class="mt-8 flex flex-col gap-2">
				<a
					class="rounded-2xl px-4 py-3 text-sm text-slate-800 transition hover:bg-white/55 hover:text-slate-950"
					href="/"
				>
					Home
				</a>
				{#each navItems as item}
					<a
						class="rounded-2xl px-4 py-3 text-sm text-slate-800 transition hover:bg-white/55 hover:text-slate-950"
						href={item.href}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<form class="mt-8" method="POST" action="/auth/sign-out">
				<button
					class="w-full rounded-full border border-white/60 bg-white/30 px-4 py-3 text-sm text-slate-900 transition hover:bg-white/55"
					type="submit"
				>
					Sign out
				</button>
			</form>
		</aside>

		<main class="rounded-[2rem] border border-[#d5e2e9] bg-white p-6 shadow-[0_20px_60px_rgba(93,122,139,0.08)] lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
