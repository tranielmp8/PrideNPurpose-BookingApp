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

	function getCardClass(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') {
			return 'border-red-200 bg-red-50/40';
		}

		return 'border-emerald-200 bg-emerald-50/40';
	}

	function getStatusClass(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') {
			return 'text-red-700';
		}

		return 'text-emerald-700';
	}
</script>

<svelte:head>
	<title>Archive | Booking App</title>
</svelte:head>

<section class="space-y-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Archive</p>
			<h1 class="mt-3 text-4xl font-semibold tracking-tight">Older booking records.</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
				Cancelled and completed meetings move here after {data.archiveAfterDays} days so the main
				bookings page stays focused on current work.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			<p class="text-sm font-medium text-stone-600">Audit exports</p>
			<div class="flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a
						class="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
						href={`/app/archive/export.xlsx?status=${option.query}`}
					>
						{option.label} .xlsx
					</a>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				{#each exportOptions as option}
					<a
						class="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
						href={`/app/archive/export.csv?status=${option.query}`}
					>
						{option.label} .csv
					</a>
				{/each}
			</div>
		</div>
	</div>

	{#if data.bookings.length === 0}
		<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
			No archived meetings yet.
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.bookings as item}
				<div class={`rounded-[1.5rem] border p-6 ${getCardClass(item.status)}`}>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p class={`text-sm uppercase tracking-[0.25em] ${getStatusClass(item.status)}`}>{item.status}</p>
							<h2 class="mt-2 text-xl font-semibold tracking-tight text-stone-900">
								{item.customerNameSnapshot}
							</h2>
							<p class="mt-1 text-sm text-stone-500">{item.customerEmailSnapshot}</p>
						</div>

						<div class="text-right text-sm text-stone-500">
							<p>{formatDateTime(item.startAt)}</p>
							<p class="mt-1">{item.service?.name ?? 'Service removed'}</p>
						</div>
					</div>

					{#if item.customerNotes}
						<div class="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
							{item.customerNotes}
						</div>
					{/if}

					{#if item.cancelledAt}
						<p class="mt-4 text-sm text-stone-500">Cancelled on {formatDateTime(item.cancelledAt)}</p>
					{/if}

					{#if item.completedAt}
						<p class="mt-4 text-sm text-stone-500">Completed on {formatDateTime(item.completedAt)}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>
