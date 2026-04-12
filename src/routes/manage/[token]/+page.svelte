<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function formatDateTime(value: string | Date) {
		return new Intl.DateTimeFormat('en-US', {
			timeZone: data.workspace.timezone,
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Manage Booking | Booking App</title>
</svelte:head>

<section class="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Manage booking</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Update your appointment details.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Review your scheduled time, join link, and online change options for this booking.
		</p>
	</div>

	{#if form?.manageMessage}
		<p class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
			{form.manageMessage}
		</p>
	{/if}

	<section class="rounded-[1.5rem] border border-stone-200 bg-white p-6">
		<h2 class="text-xl font-semibold tracking-tight">{data.service.name}</h2>
		<p class="mt-3 text-sm text-stone-600">{data.booking.customerNameSnapshot}</p>
		<p class="mt-2 text-sm text-stone-600">{data.booking.customerEmailSnapshot}</p>
		<p class="mt-4 text-base text-stone-900">{formatDateTime(data.booking.startAt)}</p>
		<p class="mt-2 text-sm text-stone-600">Timezone: {data.workspace.timezone}</p>

		{#if data.booking.status === 'scheduled' && data.booking.zohoJoinLink}
			<div class="mt-6 rounded-2xl bg-stone-50 px-4 py-4">
				<p class="text-sm text-stone-600">Join link</p>
				<a class="mt-2 block break-all text-sm font-medium text-stone-900 underline" href={data.booking.zohoJoinLink}>
					{data.booking.zohoJoinLink}
				</a>
			</div>
		{/if}
	</section>

	{#if data.booking.status !== 'scheduled'}
		<section class="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
			This booking is already {data.booking.status} and can no longer be changed online.
		</section>
	{:else if !data.canChange}
		<section class="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
			The online change window has passed for this booking. Please contact {data.workspace.name} directly for any last-minute requests.
		</section>
	{:else}
		<div class="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
			<section class="rounded-[1.5rem] border border-stone-200 p-6">
				<h2 class="text-xl font-semibold tracking-tight">Reschedule</h2>
				<form method="POST" action="?/rescheduleBooking" use:enhance class="mt-6 grid gap-4 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium text-stone-700" for="rescheduleDate">New date</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="rescheduleDate"
							name="rescheduleDate"
							type="date"
							value={form?.rescheduleValues?.rescheduleDate ?? data.defaultRescheduleDate}
						/>
					</div>

					<div>
						<label class="text-sm font-medium text-stone-700" for="rescheduleTime">New time</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="rescheduleTime"
							name="rescheduleTime"
							type="time"
							value={form?.rescheduleValues?.rescheduleTime ?? data.defaultRescheduleTime}
						/>
					</div>

					<div class="md:col-span-2">
						<button
							class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
							type="submit"
						>
							Reschedule booking
						</button>
					</div>
				</form>
			</section>

			<section class="rounded-[1.5rem] border border-stone-200 p-6">
				<h2 class="text-xl font-semibold tracking-tight">Cancel</h2>
				<p class="mt-3 text-sm leading-6 text-stone-600">
					Cancel this booking if you no longer need the appointment.
				</p>
				<form method="POST" action="?/cancelBooking" use:enhance class="mt-6">
					<button
						class="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
						type="submit"
					>
						Cancel booking
					</button>
				</form>
			</section>
		</div>
	{/if}
</section>
