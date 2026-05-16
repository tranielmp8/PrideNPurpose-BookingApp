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
	<div class="border-b border-[#d5e2e9] pb-6">
		<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Dashboard</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
			Welcome back, {data.user.name}.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
			Your workspace <span class="font-medium text-slate-950">{data.workspace.name}</span> is ready
			at <span class="font-medium text-slate-950">/book/{data.workspace.slug}</span>.
		</p>
	</div>

	<div class="space-y-3">
		<section class="grid gap-2 border border-[#d5e2e9] bg-[#f7fafb] p-5 md:grid-cols-[12rem_1fr] md:items-center">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Timezone</p>
			<p class="text-xl font-semibold tracking-tight text-slate-950">{data.workspace.timezone}</p>
		</section>
		<section class="grid gap-2 border border-[#d5e2e9] bg-[#f7fafb] p-5 md:grid-cols-[12rem_1fr] md:items-center">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Booking page</p>
			<p class="break-all text-xl font-semibold tracking-tight text-slate-950">
				/book/{data.workspace.slug}
			</p>
		</section>
		<section class="grid gap-2 border border-[#d5e2e9] bg-[#f7fafb] p-5 md:grid-cols-[12rem_1fr] md:items-center">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Contact email</p>
			<p class="break-all text-xl font-semibold tracking-tight text-slate-950">
				{data.workspace.contactEmail}
			</p>
		</section>
	</div>

	<section class="border border-[#d5e2e9] p-6">
		<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Next steps</h2>
		<ul class="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
			{#each nextSteps as step}
				<li class="border-l-2 border-[#96C2DB] pl-4">{step}</li>
			{/each}
		</ul>
	</section>

	<section class="border border-[#d5e2e9]">
		<div class="flex items-center justify-between gap-3 border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-4">
			<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Upcoming bookings</h2>
			<a class="text-sm font-semibold text-[#384959] underline" href="/app/bookings">View all</a>
		</div>

		{#if data.upcomingBookings.length === 0}
			<p class="px-5 py-5 text-sm text-slate-600">No scheduled bookings yet.</p>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.upcomingBookings as booking}
					<div class="px-5 py-4">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-semibold text-slate-950">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm text-slate-500">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm text-slate-500">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="border border-[#d5e2e9]">
		<div class="border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-4">
			<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Recent cancellations</h2>
		</div>

		{#if data.cancelledBookings.length === 0}
			<p class="px-5 py-5 text-sm text-slate-600">No cancelled bookings yet.</p>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.cancelledBookings as booking}
					<div class="px-5 py-4">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-semibold text-slate-950">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm text-slate-500">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm text-slate-500">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</section>
