<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const brandValues = [
		{
			title: 'Lead with warmth',
			copy: 'Offer a booking experience that feels human, bright, and easy to say yes to.'
		},
		{
			title: 'Protect your time',
			copy: 'Set your services, boundaries, and weekly rhythm without endless back-and-forth.'
		},
		{
			title: 'Follow through',
			copy: 'Keep confirmations, updates, and meeting links aligned from one place.'
		}
	];

	const highlights = [
		'PNP Connect page with service and time selection',
		'Provider dashboard for services, availability, and bookings',
		'Zoho Meeting create, update, and cancel sync',
		'Customer and provider email confirmations'
	];
</script>

<svelte:head>
	<title>PNP Connect</title>
	<meta
		name="description"
		content="Bright, modern scheduling with PNP Connect, provider management, and meeting sync."
	/>
</svelte:head>

<div class="pnp-page">
	<div class="mx-auto flex max-w-7xl flex-col px-5 py-7 sm:px-6 lg:px-10">
		<header class="flex flex-col gap-5 border-b pb-6 md:flex-row md:items-center md:justify-between"
			style="border-color: var(--c-border)">
			<a class="brand-script text-2xl md:text-3xl pnp-nav-link" href="/">
				PNP Connect
			</a>

			<nav
				class="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold"
				aria-label="Main navigation"
			>
				<a class="pnp-nav-link" href="/contact">Contact</a>
				<a class="pnp-nav-link" href="/auth/sign-in">Provider sign in</a>
				<a class="pnp-nav-link" href="/app/dashboard">Dashboard</a>
			</nav>
		</header>

		<main class="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start lg:py-14">
			<section>
				<p class="text-sm font-semibold uppercase tracking-[0.24em]" style="color: var(--c-text3)">
					Simple scheduling
				</p>
				<h1 class="mt-5 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-7xl"
					style="color: var(--c-text)">
					Book meaningful conversations with clarity and purpose.
				</h1>
				<p class="mt-6 max-w-2xl text-base leading-7 md:text-lg" style="color: var(--c-text2)">
					PNP Connect keeps the public booking flow easy for clients while giving the owner one place
					to manage services, availability, bookings, and meeting details.
				</p>

				<div class="mt-9 border-l-4 border-[#c2410c] px-6 py-6 pnp-surface border rounded-none shadow-[var(--shadow-sm)]">
					<p class="text-sm font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">
						For clients
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">
						Start with the booking page.
					</h2>
					<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
						This is the page customers should use when they want to choose a service, pick a time,
						and receive confirmation details.
					</p>

					{#if data.workspace}
						<a
							class="mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition sm:w-auto pnp-btn-primary"
							href={`/book/${data.workspace.slug}`}
						>
							Connect with PNP
						</a>
					{:else}
						<p class="mt-6 px-5 py-3 text-sm font-semibold rounded-full pnp-muted" style="color: var(--c-text2)">
							PNP Connect page appears after provider onboarding.
						</p>
					{/if}
				</div>

				<div class="mt-8 grid gap-4 md:grid-cols-3">
					{#each brandValues as value}
						<section class="border-t pt-5" style="border-color: var(--c-border)">
							<h3 class="text-sm font-semibold uppercase tracking-[0.16em]" style="color: var(--c-text3)">
								{value.title}
							</h3>
							<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">{value.copy}</p>
						</section>
					{/each}
				</div>
			</section>

			<aside class="space-y-6">
				<section class="border pnp-surface p-6 md:p-7 shadow-[var(--shadow-sm)]">
					<p class="text-sm font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">
						Manage the booking system
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">
						Provider access is for the owner.
					</h2>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Provider access opens the admin workspace behind the booking link, where services,
						availability, bookings, email settings, and meeting details are managed.
					</p>

					<div class="mt-6 divide-y border-y" style="border-color: var(--c-border)">
						<a
							class="flex items-center justify-between gap-4 py-4 text-sm font-semibold pnp-nav-link-heading"
							href="/app/dashboard"
						>
							<span>Open dashboard</span>
							<span aria-hidden="true" class="text-[#c2410c]">-&gt;</span>
						</a>
					</div>
				</section>

				<section class="p-6 md:p-7 shadow-[var(--shadow-md)]"
					style="background-color: var(--c-text); color: var(--c-bg)">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] opacity-60">
						Booking link
					</p>
					{#if data.workspace}
						<p class="mt-4 break-all text-xl font-semibold tracking-tight">
							/book/{data.workspace.slug}
						</p>
						<p class="mt-3 text-sm leading-6 opacity-70">
							This is your customer-facing link. Share this one on your website, email signature,
							social profiles, or direct messages.
						</p>
					{:else}
						<p class="mt-4 text-sm leading-6 opacity-70">
							Finish provider onboarding to create the public customer booking link.
						</p>
					{/if}
				</section>

				<section class="border pnp-surface p-6 md:p-7 shadow-[var(--shadow-sm)]">
					<p class="text-sm font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">
						What's live
					</p>
					<ul class="mt-5 space-y-3 text-sm leading-6" style="color: var(--c-text2)">
						{#each highlights as highlight}
							<li class="border-l-2 border-[#c2410c] pl-4">
								{highlight}
							</li>
						{/each}
					</ul>
				</section>

				<section class="border pnp-surface p-6 md:p-7 shadow-[var(--shadow-sm)]">
					<p class="text-sm font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">
						Pricing
					</p>
					<p class="mt-4 text-2xl font-bold tracking-tight text-[#c2410c]">Free</p>
					<p class="mt-1 text-sm" style="color: var(--c-text3)">during early access</p>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Pricing plans are coming soon. For now, PNP Connect is free while the experience is
						being refined.
					</p>
				</section>
			</aside>
		</main>
	</div>
</div>
