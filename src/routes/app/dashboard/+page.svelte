<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const nextSteps = [
		'Create your first service in the Services section.',
		'Set weekly availability and blackout dates.',
		'Share your public booking link once slots are ready.'
	];

	function formatDateTime(value: Date) {
		return value.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="border-b pb-6" style="border-color: var(--c-border)">
		<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Dashboard</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
			Welcome back, {data.user.name}.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
			Your workspace
			<span class="font-semibold" style="color: var(--c-text)">{data.workspace.name}</span>
			is ready at
			<span class="font-semibold" style="color: var(--c-text)">/book/{data.workspace.slug}</span>.
		</p>
	</div>

	<div class="grid gap-3 md:grid-cols-3">
		<section class="rounded-xl border p-5 pnp-muted" style="border-color: var(--c-border)">
			<p class="text-xs font-semibold uppercase tracking-[0.16em]" style="color: var(--c-text3)">Timezone</p>
			<p class="mt-2 text-lg font-semibold" style="color: var(--c-text)">{data.workspace.timezone}</p>
		</section>
		<section class="rounded-xl border p-5 pnp-muted" style="border-color: var(--c-border)">
			<p class="text-xs font-semibold uppercase tracking-[0.16em]" style="color: var(--c-text3)">Booking page</p>
			<p class="mt-2 break-all text-lg font-semibold" style="color: var(--c-text)">
				/book/{data.workspace.slug}
			</p>
		</section>
		<section class="rounded-xl border p-5 pnp-muted" style="border-color: var(--c-border)">
			<p class="text-xs font-semibold uppercase tracking-[0.16em]" style="color: var(--c-text3)">Contact email</p>
			<p class="mt-2 break-all text-lg font-semibold" style="color: var(--c-text)">
				{data.workspace.contactEmail}
			</p>
		</section>
	</div>

	<section class="rounded-xl border p-6" style="border-color: var(--c-border); background-color: var(--c-muted)">
		<h2 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">Next steps</h2>
		<ul class="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-3">
			{#each nextSteps as step}
				<li class="border-l-2 border-[#c2410c] pl-4" style="color: var(--c-text2)">{step}</li>
			{/each}
		</ul>
	</section>

	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="flex items-center justify-between gap-3 border-b px-5 py-4 pnp-muted" style="border-color: var(--c-border)">
			<h2 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">Upcoming bookings</h2>
			<a class="text-sm font-semibold text-[#c2410c] underline hover:text-[#7c2608] transition" href="/app/bookings">View all</a>
		</div>

		{#if data.upcomingBookings.length === 0}
			<p class="px-5 py-5 text-sm" style="color: var(--c-text2)">No scheduled bookings yet.</p>
		{:else}
			<div class="divide-y" style="--tw-divide-opacity: 1">
				{#each data.upcomingBookings as booking}
					<div class="px-5 py-4 pnp-surface" style="border-color: var(--c-border)">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-semibold" style="color: var(--c-text)">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm" style="color: var(--c-text3)">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm" style="color: var(--c-text2)">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="border-b px-5 py-4 pnp-muted" style="border-color: var(--c-border)">
			<h2 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">Recent cancellations</h2>
		</div>

		{#if data.cancelledBookings.length === 0}
			<p class="px-5 py-5 text-sm" style="color: var(--c-text2)">No cancelled bookings yet.</p>
		{:else}
			<div class="divide-y" style="border-color: var(--c-border)">
				{#each data.cancelledBookings as booking}
					<div class="px-5 py-4 pnp-surface">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-semibold" style="color: var(--c-text)">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm" style="color: var(--c-text3)">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm" style="color: var(--c-text2)">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</section>
