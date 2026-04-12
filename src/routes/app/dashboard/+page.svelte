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
	<title>Dashboard | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Dashboard</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Welcome back, {data.user.name}.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Your workspace <span class="font-medium text-stone-900">{data.workspace.name}</span> is set
			up with the public slug <span class="font-medium text-stone-900">/{data.workspace.slug}</span>.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
			<p class="text-sm text-stone-500">Timezone</p>
			<p class="mt-4 text-2xl font-semibold tracking-tight">{data.workspace.timezone}</p>
		</div>
		<div class="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
			<p class="text-sm text-stone-500">Public booking page</p>
			<p class="mt-4 text-2xl font-semibold tracking-tight">/book/{data.workspace.slug}</p>
		</div>
	</div>

	<div class="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
		<p class="text-sm text-stone-500">Contact email</p>
		<p class="mt-4 break-all text-lg font-semibold tracking-tight md:text-xl">
			{data.workspace.contactEmail}
		</p>
	</div>

	<div class="rounded-[1.5rem] border border-stone-200 p-6">
		<h2 class="text-xl font-semibold tracking-tight">Next steps</h2>
		<ul class="mt-4 space-y-3 text-sm leading-6 text-stone-600">
			{#each nextSteps as step}
				<li>{step}</li>
			{/each}
		</ul>
	</div>

	<div class="rounded-[1.5rem] border border-stone-200 p-6">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-xl font-semibold tracking-tight">Upcoming bookings</h2>
			<a class="text-sm font-medium text-stone-900 underline" href="/app/bookings">View all</a>
		</div>

		{#if data.upcomingBookings.length === 0}
			<p class="mt-4 text-sm text-stone-600">No scheduled bookings yet.</p>
		{:else}
			<div class="mt-4 space-y-3">
				{#each data.upcomingBookings as booking}
					<div class="rounded-2xl bg-stone-50 px-4 py-3">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-medium text-stone-900">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm text-stone-500">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm text-stone-500">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="rounded-[1.5rem] border border-stone-200 p-6">
		<h2 class="text-xl font-semibold tracking-tight">Recent cancellations</h2>

		{#if data.cancelledBookings.length === 0}
			<p class="mt-4 text-sm text-stone-600">No cancelled bookings yet.</p>
		{:else}
			<div class="mt-4 space-y-3">
				{#each data.cancelledBookings as booking}
					<div class="rounded-2xl bg-stone-50 px-4 py-3">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<p class="text-sm font-medium text-stone-900">
								{booking.customerNameSnapshot}
							</p>
							<p class="text-sm text-stone-500">{formatDateTime(booking.startAt)}</p>
						</div>
						<p class="mt-1 text-sm text-stone-500">{booking.service?.name ?? 'Service removed'}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
