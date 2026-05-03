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
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(value);
	}

	function getStatusClass(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') return 'bg-red-50 text-red-700';
		return 'bg-emerald-50 text-emerald-700';
	}
</script>

<svelte:head>
	<title>Archive | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-7">
	<div class="flex flex-col gap-5 border-b border-[#d5e2e9] pb-6 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Archive</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
				Older booking records.
			</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
				Cancelled and completed meetings move here after {data.archiveAfterDays} days so the main bookings page stays focused.
			</p>
		</div>

		<div class="border border-[#d5e2e9] bg-[#f7fafb] p-4">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Audit exports</p>
			<div class="mt-3 flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a class="bg-[#384959] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#24313d]" href={`/app/archive/export.xlsx?status=${option.query}`}>
						{option.label} .xlsx
					</a>
				{/each}
			</div>
			<div class="mt-2 flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a class="border border-[#cfdce4] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]" href={`/app/archive/export.csv?status=${option.query}`}>
						{option.label} .csv
					</a>
				{/each}
			</div>
		</div>
	</div>

	<section class="border border-[#d5e2e9]">
		<div class="hidden grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_9rem_7rem] gap-4 border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
			<p>Customer</p>
			<p>Booking</p>
			<p>Status</p>
			<p class="text-right">Details</p>
		</div>

		{#if data.bookings.length === 0}
			<div class="p-6 text-sm text-slate-600">No archived meetings yet.</div>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.bookings as item}
					<details class="group">
						<summary class="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-[#f7fafb] md:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_9rem_7rem] md:items-center md:px-5">
							<div>
								<p class="font-semibold text-slate-950">{item.customerNameSnapshot}</p>
								<p class="mt-1 break-all text-sm text-slate-500">{item.customerEmailSnapshot}</p>
							</div>
							<div class="text-sm text-slate-600">
								<p>{item.service?.name ?? 'Service removed'}</p>
								<p class="mt-1 text-slate-500">{formatDateTime(item.startAt)}</p>
							</div>
							<div>
								<span class={`inline-flex px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(item.status)}`}>
									{item.status}
								</span>
							</div>
							<p class="text-sm font-semibold text-[#384959] md:text-right">
								<span class="group-open:hidden">Open</span>
								<span class="hidden group-open:inline">Close</span>
							</p>
						</summary>

						<div class="border-t border-[#d5e2e9] bg-[#fbfcfd] px-5 py-5 text-sm leading-6 text-slate-600">
							{#if item.customerNotes}
								<p><span class="font-semibold text-slate-950">Notes:</span> {item.customerNotes}</p>
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
