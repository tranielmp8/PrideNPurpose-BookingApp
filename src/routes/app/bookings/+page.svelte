<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function getZonedParts(value: Date) {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone: data.workspace.timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hourCycle: 'h23'
		}).formatToParts(value);

		return Object.fromEntries(
			parts
				.filter((part) => part.type !== 'literal')
				.map((part) => [part.type, part.value])
		);
	}

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

	type RescheduleValues = {
		bookingId: string;
		rescheduleDate: string;
		rescheduleTime: string;
	};

	function getRescheduleValues(item: (typeof data.bookings)[number]): RescheduleValues {
		if (
			form &&
			typeof form === 'object' &&
			'rescheduleValues' in form &&
			(form.rescheduleValues as RescheduleValues | undefined)?.bookingId === item.id
		) {
			return form.rescheduleValues as RescheduleValues;
		}

		const parts = getZonedParts(item.startAt);
		return {
			bookingId: item.id,
			rescheduleDate: `${parts.year}-${parts.month}-${parts.day}`,
			rescheduleTime: `${parts.hour}:${parts.minute}`
		};
	}
</script>

<svelte:head>
	<title>Bookings | Booking App</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Bookings</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Review and manage appointment records.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			All bookings for this workspace appear here, newest first.
		</p>
	</div>

	{#if form?.bookingMessage}
		<p class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
			{form.bookingMessage}
		</p>
	{/if}

	{#if data.bookings.length === 0}
		<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
			No bookings yet. Share the public link once your services and availability are ready.
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.bookings as item}
				<div class="rounded-[1.5rem] border border-stone-200 p-6">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p class="text-sm uppercase tracking-[0.25em] text-stone-500">{item.status}</p>
							<h2 class="mt-2 text-xl font-semibold tracking-tight">
								{item.customerNameSnapshot}
							</h2>
							<p class="mt-1 text-sm text-stone-500">{item.customerEmailSnapshot}</p>
						</div>

						<div class="flex items-start gap-3">
							<div class="text-right text-sm text-stone-500">
								<p>{formatDateTime(item.startAt)}</p>
								<p class="mt-1">{item.service?.name ?? 'Service removed'}</p>
							</div>

							{#if item.status === 'scheduled'}
								<div class="flex flex-col gap-2">
									<form method="POST" action="?/completeBooking" use:enhance>
										<input name="bookingId" type="hidden" value={item.id} />
										<button
											class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
											type="submit"
										>
											Complete
										</button>
									</form>

									<form method="POST" action="?/cancelBooking" use:enhance>
										<input name="bookingId" type="hidden" value={item.id} />
										<button
											class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
											type="submit"
										>
											Cancel
										</button>
									</form>
								</div>
							{/if}
						</div>
					</div>

					{#if item.customerNotes}
						<div class="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
							{item.customerNotes}
						</div>
					{/if}

					{#if item.status === 'scheduled' && (item.zohoStartLink || item.zohoJoinLink)}
						<div class="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
							{#if item.zohoStartLink}
								<p>Host link: {item.zohoStartLink}</p>
							{/if}
							{#if item.zohoJoinLink}
								<p class="mt-1">Join link: {item.zohoJoinLink}</p>
							{/if}
						</div>
					{/if}

					{#if item.status === 'scheduled'}
						<form
							method="POST"
							action="?/rescheduleBooking"
							use:enhance
							class="mt-4 grid gap-4 rounded-2xl bg-stone-50 px-4 py-4 md:grid-cols-[1fr_1fr_auto]"
						>
							<input name="bookingId" type="hidden" value={item.id} />

							<div>
								<label class="text-sm font-medium text-stone-700" for={`reschedule-date-${item.id}`}>New date</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`reschedule-date-${item.id}`}
									name="rescheduleDate"
									type="date"
									value={getRescheduleValues(item).rescheduleDate}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`reschedule-time-${item.id}`}>New time</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`reschedule-time-${item.id}`}
									name="rescheduleTime"
									type="time"
									value={getRescheduleValues(item).rescheduleTime}
								/>
							</div>

							<div class="flex items-end">
								<button
									class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
									type="submit"
								>
									Reschedule
								</button>
							</div>
						</form>
					{/if}

					{#if item.cancelledAt}
						<p class="mt-4 text-sm text-stone-500">
							Cancelled on {formatDateTime(item.cancelledAt)}
						</p>
					{/if}

					{#if item.completedAt}
						<p class="mt-4 text-sm text-stone-500">
							Completed on {formatDateTime(item.completedAt)}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>
