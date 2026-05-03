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
		'Public booking page with service and time selection',
		'Provider dashboard for services, availability, and bookings',
		'Zoho Meeting create, update, and cancel sync',
		'Customer and provider email confirmations'
	];
</script>

<svelte:head>
	<title>Pride N Purpose Conversations</title>
	<meta
		name="description"
		content="Bright, modern scheduling for Pride N Purpose with public booking, provider management, and Zoho Meeting sync."
	/>
</svelte:head>

<div class="min-h-screen bg-[#f7fafb] text-slate-900">
	<div class="mx-auto flex max-w-7xl flex-col px-5 py-7 sm:px-6 lg:px-10">
		<header class="flex flex-col gap-5 border-b border-[#d5e2e9] pb-6 md:flex-row md:items-center md:justify-between">
			<a class="brand-script text-2xl text-slate-700 md:text-3xl" href="/">
				Pride N Purpose Conversations
			</a>

			<nav
				class="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700"
				aria-label="Main navigation"
			>
				<a class="transition hover:text-[#384959]" href="/contact">Contact</a>
				<a class="transition hover:text-[#384959]" href="/auth/sign-in">Provider sign in</a>
				<a class="transition hover:text-[#384959]" href="/app/dashboard">Dashboard</a>
			</nav>
		</header>

		<main class="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start lg:py-14">
			<section>
				<p class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
					Simple scheduling
				</p>
				<h1 class="mt-5 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight text-[#384959] sm:text-5xl md:text-7xl">
					Book meaningful conversations with clarity and purpose.
				</h1>
				<p class="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
					Pride N Purpose Conversations keeps the public booking flow easy for clients while
					giving the owner one place to manage services, availability, bookings, and meeting
					details.
				</p>

				<div class="mt-9 border-l-4 border-[#96C2DB] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(93,122,139,0.08)]">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
						For clients
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#384959]">
						Start with the booking page.
					</h2>
					<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
						This is the page customers should use when they want to choose a service, pick a
						time, and receive confirmation details.
					</p>

					{#if data.workspace}
						<a
							class="mt-6 inline-flex w-full items-center justify-center bg-[#96C2DB] px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1] sm:w-auto"
							href={`/book/${data.workspace.slug}`}
						>
							Book with Pride N Purpose
						</a>
					{:else}
						<p class="mt-6 bg-[#eef4f7] px-5 py-3 text-sm font-semibold text-slate-700">
							Public booking page appears after provider onboarding.
						</p>
					{/if}
				</div>

				<div class="mt-8 grid gap-4 md:grid-cols-3">
					{#each brandValues as value}
						<section class="border-t border-[#cfdce4] pt-5">
							<h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
								{value.title}
							</h3>
							<p class="mt-3 text-sm leading-6 text-slate-600">{value.copy}</p>
						</section>
					{/each}
				</div>
			</section>

			<aside class="space-y-6">
				<section class="border border-[#d5e2e9] bg-white p-6 shadow-[0_18px_54px_rgba(93,122,139,0.08)] md:p-7">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
						Manage the booking system
					</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#384959]">
						Provider access is for the owner.
					</h2>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						A provider account is the admin account for Pride N Purpose. It creates or opens
						the workspace behind the booking link, where services, availability, bookings,
						email settings, and Zoho Meeting details are managed.
					</p>

					<div class="mt-6 divide-y divide-[#d5e2e9] border-y border-[#d5e2e9]">
						<a
							class="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-slate-800 transition hover:text-[#384959]"
							href="/auth/sign-up"
						>
							<span>Create owner account</span>
							<span aria-hidden="true">-&gt;</span>
						</a>
						<a
							class="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-slate-800 transition hover:text-[#384959]"
							href="/app/dashboard"
						>
							<span>Open dashboard</span>
							<span aria-hidden="true">-&gt;</span>
						</a>
					</div>
				</section>

				<section class="bg-[#384959] p-6 text-white md:p-7">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-[#cfe2ec]">
						Booking link
					</p>
					{#if data.workspace}
						<p class="mt-4 break-all text-xl font-semibold tracking-tight">
							/book/{data.workspace.slug}
						</p>
						<p class="mt-3 text-sm leading-6 text-[#e6eef2]">
							This is your customer-facing link. Share this one on your website, email
							signature, social profiles, or direct messages.
						</p>
					{:else}
						<p class="mt-4 text-sm leading-6 text-[#e6eef2]">
							Finish provider onboarding to create the public customer booking link.
						</p>
					{/if}
				</section>

				<section class="border border-[#d5e2e9] bg-white p-6 shadow-[0_18px_54px_rgba(93,122,139,0.08)] md:p-7">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
						What's live
					</p>
					<ul class="mt-5 space-y-3 text-sm leading-6 text-slate-700">
						{#each highlights as highlight}
							<li class="border-l-2 border-[#96C2DB] pl-4">
								{highlight}
							</li>
						{/each}
					</ul>
				</section>

				<section class="border border-[#d5e2e9] bg-white p-6 shadow-[0_18px_54px_rgba(93,122,139,0.08)] md:p-7">
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
						Pricing
					</p>
					<p class="mt-4 text-2xl font-bold tracking-tight text-[#384959]">Free</p>
					<p class="mt-1 text-sm text-slate-500">during early access</p>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						Pricing plans are coming soon. For now, Pride N Purpose Conversations is free
						while the experience is being refined.
					</p>
				</section>
			</aside>
		</main>
	</div>
</div>
