<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const providerLinks = [
		{ href: '/contact', label: 'Contact' },
		{ href: '/auth/sign-up', label: 'Create provider account' },
		{ href: '/app/dashboard', label: 'Open provider dashboard' }
	];

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
	<title>Pride N Purpose Bookings</title>
	<meta
		name="description"
		content="Bright, modern scheduling for Pride N Purpose with public booking, provider management, and Zoho Meeting sync."
	/>
</svelte:head>

<div class="min-h-screen overflow-hidden bg-[linear-gradient(160deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] text-slate-900">
	<div class="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
		<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_42%),radial-gradient(circle_at_top_right,rgba(150,194,219,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(229,237,241,0.75),transparent_38%)]"></div>

		<section class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
			<div class="rounded-[2.5rem] border border-[#d5e2e9] bg-white/90 p-6 shadow-[0_30px_90px_rgba(93,122,139,0.12)] backdrop-blur md:p-10">
				<p class="brand-script text-2xl text-slate-600 md:text-3xl">
					Pride N Purpose Bookings
				</p>
				<h1 class="mt-5 max-w-4xl font-serif text-4xl leading-[0.98] tracking-tight text-[#384959] sm:text-5xl md:text-7xl">
					Book meaningful conversations with color, clarity, and purpose.
				</h1>
				<p class="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
					Need help keeping up with your meetings, but want a platform that is not confusing?
					Pride N Purpose Bookings fits those needs. Set exactly what you need with nothing extra.
				</p>

				<div class="mt-8 flex flex-wrap gap-3">
					{#if data.workspace}
						<a
							class="w-full rounded-full bg-[#96C2DB] px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1] sm:w-auto"
							href={`/book/${data.workspace.slug}`}
						>
							Book with Pride N Purpose
						</a>
					{:else}
						<span class="w-full rounded-full bg-[#96C2DB] px-6 py-3 text-center text-sm font-semibold text-slate-900 sm:w-auto">
							Public booking page appears after onboarding
						</span>
					{/if}

					{#each providerLinks as link}
						<a
							class="w-full rounded-full border border-[#d0dde5] bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc] sm:w-auto"
							href={link.href}
						>
							{link.label}
						</a>
					{/each}
				</div>

				<div class="mt-10 grid gap-4 md:grid-cols-3">
					{#each brandValues as value}
						<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
							<p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
								{value.title}
							</p>
							<p class="mt-3 text-sm leading-6 text-slate-600">{value.copy}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="space-y-6">
				<div class="rounded-[2.25rem] border border-[#d5e2e9] bg-[#96C2DB] p-7 text-slate-900 shadow-[0_24px_70px_rgba(93,122,139,0.16)]">
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-700">
						What’s live
					</p>
					<ul class="mt-5 space-y-3 text-sm leading-6 text-slate-800">
						{#each highlights as highlight}
							<li class="rounded-[1.35rem] border border-white/50 bg-white/55 px-4 py-3">
								{highlight}
							</li>
						{/each}
					</ul>
				</div>

				<div class="rounded-[2.25rem] border border-[#d5e2e9] bg-white/92 p-7 shadow-[0_18px_60px_rgba(93,122,139,0.08)] backdrop-blur">
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
						Your booking link
					</p>
					{#if data.workspace}
						<p class="mt-4 break-all text-lg font-semibold tracking-tight text-[#384959]">
							/book/{data.workspace.slug}
						</p>
						<p class="mt-3 text-sm leading-6 text-slate-600">
							This is the customer-facing page you can add to your website, email signature,
							and social channels.
						</p>
					{:else}
						<p class="mt-4 text-sm leading-6 text-slate-600">
							Finish provider onboarding to unlock your customer booking link.
						</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>
