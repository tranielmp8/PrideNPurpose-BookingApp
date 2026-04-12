<script lang="ts">
	let { data } = $props();

	function formatDateTime(value: string | Date, timeZone: string) {
		return new Intl.DateTimeFormat('en-US', {
			timeZone,
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(value));
	}
</script>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Customer dashboard</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Your bookings</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Review your upcoming sessions and past booking activity in one place.
		</p>
	</div>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold tracking-tight">Upcoming</h2>
		{#if data.upcomingBookings.length === 0}
			<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
				No upcoming bookings yet.
			</div>
		{:else}
			{#each data.upcomingBookings as item}
				<div class="rounded-[1.5rem] border border-stone-200 p-6">
					<h3 class="text-lg font-semibold tracking-tight">{item.service?.name ?? 'Booking'}</h3>
					<p class="mt-2 text-sm text-stone-600">
						{formatDateTime(item.startAt, data.workspace.timezone)}
					</p>
					<div class="mt-4 flex flex-wrap gap-3">
						<a
							class="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
							href={`/manage/${item.manageToken}`}
						>
							Manage booking
						</a>
						{#if item.zohoJoinLink}
							<a
								class="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
								href={item.zohoJoinLink}
							>
								Join meeting
							</a>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</section>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold tracking-tight">Past and completed</h2>
		{#if data.pastBookings.length === 0}
			<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
				No past bookings yet.
			</div>
		{:else}
			{#each data.pastBookings as item}
				<div class="rounded-[1.5rem] border border-stone-200 p-6">
					<h3 class="text-lg font-semibold tracking-tight">{item.service?.name ?? 'Booking'}</h3>
					<p class="mt-2 text-sm text-stone-600">
						{item.status} on {formatDateTime(item.startAt, data.workspace.timezone)}
					</p>
				</div>
			{/each}
		{/if}
	</section>
</section>
