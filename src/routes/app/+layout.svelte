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

<div class="min-h-screen bg-[#f4f7f8] text-slate-900">
	<div class="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[272px_1fr]">
		<aside class="border border-[#d5e2e9] bg-white p-5 shadow-[0_18px_50px_rgba(93,122,139,0.08)]">
			<a class="block text-base font-bold uppercase tracking-[0.18em] text-[#384959]" href="/">
				PNP Connect
			</a>

			<div class="mt-7 border-t border-[#d5e2e9] pt-5">
				<h2 class="text-xl font-semibold tracking-tight text-slate-950">{data.workspace.name}</h2>
				<p class="mt-2 break-all text-sm text-slate-600">/book/{data.workspace.slug}</p>
			</div>

			<p class="mt-5 text-sm leading-6 text-slate-600">
				Signed in as {data.user.name || data.user.email}
			</p>

			<nav class="mt-8 flex flex-col gap-1" aria-label="Provider navigation">
				<a
					class="px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-[#eef4f7] hover:text-[#384959]"
					href="/"
				>
					Home
				</a>
				{#each navItems as item}
					<a
						class={[
							'border-l-4 px-4 py-3 text-sm font-semibold transition',
							isActive(item.href)
								? 'border-[#384959] bg-[#e7f0f4] text-[#24313d]'
								: 'border-transparent text-slate-600 hover:bg-[#eef4f7] hover:text-[#384959]'
						]}
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<form class="mt-8" method="POST" action="/auth/sign-out">
				<button
					class="w-full border border-[#cfdce4] bg-[#f7fafb] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7] hover:text-slate-950"
					type="submit"
				>
					Sign out
				</button>
			</form>
		</aside>

		<main class="border border-[#d5e2e9] bg-white p-6 shadow-[0_18px_50px_rgba(93,122,139,0.08)] lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
