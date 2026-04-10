<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const appLinks = [
		{ href: '/auth/sign-up', label: 'Create provider account' },
		{ href: '/app/dashboard', label: 'Open provider dashboard' }
	];

	const milestones = [
		'Provider onboarding with business name, slug, and timezone',
		'Service management for appointment types',
		'Weekly availability and date overrides',
		'Public booking flow with slot selection',
		'Provider dashboard for upcoming bookings'
	];
</script>

<svelte:head>
	<title>Booking App</title>
	<meta
		name="description"
		content="A focused scheduling app MVP for solo operators and small teams."
	/>
</svelte:head>

<div class="min-h-screen bg-stone-950 text-stone-100">
	<div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-10 lg:px-10">
		<section class="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 lg:grid-cols-[1.4fr_0.8fr] lg:p-12">
			<div class="space-y-6">
				<p class="text-sm uppercase tracking-[0.3em] text-amber-300">Booking App MVP</p>
				<h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-white lg:text-6xl">
					Ship a practical scheduling product before you build the platform.
				</h1>
				<p class="max-w-2xl text-base leading-7 text-stone-300 lg:text-lg">
					This starter is organized around one job: let a provider define services and
					availability, then let customers book a slot without the usual email back-and-forth.
				</p>
				<div class="flex flex-wrap gap-3">
					{#each appLinks as link}
						<a
							class="rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/20"
							href={link.href}
						>
							{link.label}
						</a>
					{/each}
					{#if data.workspace}
						<a
							class="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/20"
							href={`/book/${data.workspace.slug}`}
						>
							View public booking page
						</a>
					{:else}
						<span
							class="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-stone-300"
						>
							Public booking page appears after onboarding
						</span>
					{/if}
				</div>
			</div>

			<div class="rounded-[1.5rem] border border-white/10 bg-stone-900/80 p-6">
				<p class="text-sm font-medium text-stone-400">First release scope</p>
				<ul class="mt-4 space-y-3 text-sm leading-6 text-stone-200">
					{#each milestones as milestone}
						<li class="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">{milestone}</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>
</div>
