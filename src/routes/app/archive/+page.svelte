<script lang="ts">
	let { data } = $props();

	const exportOptions = [
		{ label: 'All', query: 'all' },
		{ label: 'Cancelled', query: 'cancelled' },
		{ label: 'Completed', query: 'completed' }
	];

	function formatDateTime(value: Date) {
		return new Intl.DateTimeFormat('en-US', {
			timeZone: data.workspace.timezone,
			month: 'short', day: 'numeric', year: 'numeric',
			hour: 'numeric', minute: '2-digit'
		}).format(value);
	}

	function getStatusBadgeStyle(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') return 'background-color: rgba(239,68,68,0.12); color: #ef4444';
		return 'background-color: rgba(16,185,129,0.12); color: #10b981';
	}
</script>

<svelte:head>
	<title>Archive | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between"
		style="border-color: var(--c-border)">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Archive</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
				Older booking records.
			</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
				Cancelled and completed meetings move here after {data.archiveAfterDays} days so the main bookings page stays focused.
			</p>
		</div>

		<div class="rounded-xl border p-4 pnp-muted" style="border-color: var(--c-border)">
			<p class="text-xs font-semibold uppercase tracking-[0.16em]" style="color: var(--c-text3)">Audit exports</p>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a class="rounded-lg px-3 py-2 text-sm font-semibold text-white pnp-btn-primary" href={`/app/archive/export.xlsx?status=${option.query}`}>
						{option.label} .xlsx
					</a>
				{/each}
			</div>
			<div class="mt-2 flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a class="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text2)"
						href={`/app/archive/export.csv?status=${option.query}`}>
						{option.label} .csv
					</a>
				{/each}
			</div>
		</div>
	</div>

	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="hidden grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_9rem_7rem] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] md:grid pnp-muted"
			style="border-color: var(--c-border); color: var(--c-text3)">
			<p>Customer</p>
			<p>Booking</p>
			<p>Status</p>
			<p class="text-right">Details</p>
		</div>

		{#if data.bookings.length === 0}
			<div class="p-6 text-sm" style="color: var(--c-text2)">No archived meetings yet.</div>
		{:else}
			<div class="divide-y" style="border-color: var(--c-border)">
				{#each data.bookings as item}
					<details class="group">
						<summary class="grid cursor-pointer list-none gap-3 px-4 py-4 transition md:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_9rem_7rem] md:items-center md:px-5"
							style="border-color: var(--c-border)">
							<div>
								<p class="font-semibold" style="color: var(--c-text)">{item.customerNameSnapshot}</p>
								<p class="mt-1 break-all text-sm" style="color: var(--c-text3)">{item.customerEmailSnapshot}</p>
							</div>
							<div class="text-sm" style="color: var(--c-text2)">
								<p>{item.service?.name ?? 'Service removed'}</p>
								<p class="mt-1" style="color: var(--c-text3)">{formatDateTime(item.startAt)}</p>
							</div>
							<div>
								<span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase"
									style={getStatusBadgeStyle(item.status)}>
									{item.status}
								</span>
							</div>
							<p class="text-sm font-semibold text-[#e85521] md:text-right">
								<span class="group-open:hidden">Open</span>
								<span class="hidden group-open:inline">Close</span>
							</p>
						</summary>

						<div class="border-t px-5 py-5 text-sm leading-6 pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
							{#if item.customerNotes}
								<p><span class="font-semibold" style="color: var(--c-text)">Notes:</span> {item.customerNotes}</p>
							{:else}
								<p>No customer notes were added.</p>
							{/if}

							{#if item.cancelledAt}
								<p class="mt-3">Cancelled on {formatDateTime(item.cancelledAt)}</p>
							{/if}

							{#if item.completedAt}
								<p class="mt-3">Completed on {formatDateTime(item.completedAt)}</p>
							{/if}
						</div>
					</details>
				{/each}
			</div>
		{/if}
	</section>
</section>
