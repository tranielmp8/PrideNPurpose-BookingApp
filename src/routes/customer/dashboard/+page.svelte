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
		<p class="text-xs font-semibold uppercase tracking-[0.3em]" style="color: var(--c-text3)">Customer dashboard</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight" style="color: var(--c-text)">Your bookings</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
			Review your upcoming sessions and past booking activity in one place.
		</p>
	</div>

	<section class="space-y-4">
		<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Upcoming</h2>
		{#if data.upcomingBookings.length === 0}
			<div class="rounded-[1.5rem] border border-dashed p-6 text-sm pnp-muted"
				style="border-color: var(--c-border); color: var(--c-text2)">
				No upcoming bookings yet.
			</div>
		{:else}
			{#each data.upcomingBookings as item}
				<div class="rounded-[1.5rem] border p-6 pnp-surface shadow-[var(--shadow-sm)]"
					style="border-color: var(--c-border)">
					<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">{item.service?.name ?? 'Booking'}</h3>
					<p class="mt-2 text-sm" style="color: var(--c-text2)">
						{formatDateTime(item.startAt, data.workspace?.timezone ?? 'America/Chicago')}
					</p>
					<div class="mt-4 flex flex-wrap gap-3">
						<a
							class="rounded-full border px-4 py-2 text-sm font-medium transition hover:border-[#c2410c] hover:text-[#c2410c]"
							style="border-color: var(--c-border); color: var(--c-text2)"
							href={`/manage/${item.manageToken}`}
						>
							Manage connection
						</a>
						{#if item.zohoJoinLink}
							<a
								class="rounded-full px-4 py-2 text-sm font-medium text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
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
		<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Past and completed</h2>
		{#if data.pastBookings.length === 0}
			<div class="rounded-[1.5rem] border border-dashed p-6 text-sm pnp-muted"
				style="border-color: var(--c-border); color: var(--c-text2)">
				No past bookings yet.
			</div>
		{:else}
			{#each data.pastBookings as item}
				<div class="rounded-[1.5rem] border p-6 pnp-surface"
					style="border-color: var(--c-border)">
					<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">{item.service?.name ?? 'Booking'}</h3>
					<p class="mt-2 text-sm" style="color: var(--c-text2)">
						{item.status} on {formatDateTime(item.startAt, data.workspace?.timezone ?? 'America/Chicago')}
					</p>
				</div>
			{/each}
		{/if}
	</section>
</section>
