<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function dayLabel(dayOfWeek: number) {
		return data.days.find((day) => day.value === dayOfWeek)?.label ?? `Day ${dayOfWeek}`;
	}
</script>

<svelte:head>
	<title>Availability | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-7 text-slate-900">
	<div class="border-b border-[#d5e2e9] pb-6">
		<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Availability</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
			Control when customers can book time.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
			Booking rules, weekly schedule blocks, and date overrides are organized as rows you can open when edits are needed.
		</p>
	</div>

	{#if form?.availabilityMessage}
		<p class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
			{form.availabilityMessage}
		</p>
	{/if}

	<details class="border border-[#d5e2e9]" open>
		<summary class="grid cursor-pointer list-none gap-3 bg-[#f7fafb] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
			<div>
				<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Booking rules</h2>
				<p class="mt-1 text-sm text-slate-600">
					Notice, change cutoff, booking window, and daily capacity.
				</p>
			</div>
			<p class="text-sm font-semibold text-[#384959]">Edit rules</p>
		</summary>

		<form method="POST" action="?/updateBookingRules" use:enhance class="border-t border-[#d5e2e9] p-5">
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-slate-700" for="minNoticeMinutes">Minimum notice</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="minNoticeMinutes" name="minNoticeMinutes" type="number" min="0" step="1" value={data.bookingRules.minNoticeMinutes} />
					<p class="mt-2 text-xs leading-5 text-slate-500">Use minutes. 1440 means at least 24 hours.</p>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="customerChangeCutoffMinutes">Customer change cutoff</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="customerChangeCutoffMinutes" name="customerChangeCutoffMinutes" type="number" min="0" step="1" value={data.bookingRules.customerChangeCutoffMinutes} />
					<p class="mt-2 text-xs leading-5 text-slate-500">How long before the meeting customers can cancel or reschedule online.</p>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="bookingWindowDays">Booking window</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="bookingWindowDays" name="bookingWindowDays" type="number" min="1" step="1" value={data.bookingRules.bookingWindowDays} />
					<p class="mt-2 text-xs leading-5 text-slate-500">How many days ahead people can book.</p>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="maxBookingsPerDay">Max bookings/day</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="maxBookingsPerDay" name="maxBookingsPerDay" type="number" min="0" step="1" value={data.bookingRules.maxBookingsPerDay ?? ''} placeholder="Optional" />
					<p class="mt-2 text-xs leading-5 text-slate-500">Optional daily cap across all services.</p>
				</div>
			</div>

			<button class="mt-5 bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">
				Save rules
			</button>
		</form>
	</details>

	<section class="border border-[#d5e2e9]">
		<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-4">
			<div>
				<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Weekly schedule</h2>
				<p class="mt-1 text-sm text-slate-600">Recurring day and time windows.</p>
			</div>
		</div>

		<details>
			<summary class="cursor-pointer list-none border-b border-[#d5e2e9] px-5 py-4 text-sm font-semibold text-[#384959] transition hover:bg-[#f7fafb]">
				Add weekly availability
			</summary>
			<form method="POST" action="?/createWeeklyWindow" use:enhance class="grid gap-4 border-b border-[#d5e2e9] bg-[#fbfcfd] p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
				<div>
					<label class="text-sm font-medium text-slate-700" for="dayOfWeek">Day</label>
					<select class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="dayOfWeek" name="dayOfWeek">
						{#each data.days as day}
							<option value={day.value}>{day.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="startTime">Start</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="startTime" name="startTime" type="time" required value="09:00" />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="endTime">End</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="endTime" name="endTime" type="time" required value="17:00" />
				</div>
				<button class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">
					Add
				</button>
			</form>
		</details>

		{#if data.weeklyAvailability.length === 0}
			<div class="p-5 text-sm text-slate-600">No weekly schedule yet.</div>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.weeklyAvailability as item}
					<details class="group">
						<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 transition hover:bg-[#f7fafb] md:grid-cols-[1fr_1fr_7rem] md:items-center">
							<p class="font-semibold text-slate-950">{dayLabel(item.dayOfWeek)}</p>
							<p class="text-sm text-slate-600">{item.startTime} to {item.endTime}</p>
							<p class="text-sm font-semibold text-[#384959] md:text-right">
								<span class="group-open:hidden">Edit</span>
								<span class="hidden group-open:inline">Close</span>
							</p>
						</summary>

						<div class="border-t border-[#d5e2e9] bg-[#fbfcfd] p-5">
							<form method="POST" action="?/updateWeeklyWindow" use:enhance class="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
								<input name="availabilityId" type="hidden" value={item.id} />
								<div>
									<label class="text-sm font-medium text-slate-700" for={`weekly-start-${item.id}`}>Start</label>
									<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id={`weekly-start-${item.id}`} name="startTime" type="time" required value={item.startTime} />
								</div>
								<div>
									<label class="text-sm font-medium text-slate-700" for={`weekly-end-${item.id}`}>End</label>
									<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id={`weekly-end-${item.id}`} name="endTime" type="time" required value={item.endTime} />
								</div>
								<button class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">Save</button>
							</form>

							<form class="mt-3" method="POST" action="?/deleteWeeklyWindow" use:enhance>
								<input name="availabilityId" type="hidden" value={item.id} />
								<button class="border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50" type="submit">Remove window</button>
							</form>
						</div>
					</details>
				{/each}
			</div>
		{/if}
	</section>

	<section class="border border-[#d5e2e9]">
		<div class="border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-4">
			<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Date overrides</h2>
			<p class="mt-1 text-sm text-slate-600">Blackout dates and custom date-specific windows.</p>
		</div>

		<details>
			<summary class="cursor-pointer list-none border-b border-[#d5e2e9] px-5 py-4 text-sm font-semibold text-[#384959] transition hover:bg-[#f7fafb]">
				Add date override
			</summary>
			<form method="POST" action="?/createOverride" use:enhance class="grid gap-4 border-b border-[#d5e2e9] bg-[#fbfcfd] p-5 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-slate-700" for="overrideDate">Date</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="overrideDate" name="overrideDate" type="date" required />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="mode">Mode</label>
					<select class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="mode" name="mode">
						<option value="unavailable">Blackout date</option>
						<option value="custom">Custom date window</option>
					</select>
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="overrideStartTime">Start time</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="overrideStartTime" name="startTime" type="time" value="09:00" />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="overrideEndTime">End time</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm text-slate-900" id="overrideEndTime" name="endTime" type="time" value="17:00" />
				</div>
				<div class="md:col-span-2">
					<button class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">Save override</button>
				</div>
			</form>
		</details>

		{#if data.availabilityOverrides.length === 0}
			<div class="p-5 text-sm text-slate-600">No date-specific overrides yet.</div>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.availabilityOverrides as override}
					<div class="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
						<p class="font-semibold text-slate-950">{override.overrideDate}</p>
						<p class="text-sm text-slate-600">
							{#if override.isUnavailable}
								Unavailable all day
							{:else if override.windows.length > 0}
								{override.windows.map((window) => `${window.startTime} to ${window.endTime}`).join(', ')}
							{:else}
								Custom override
							{/if}
						</p>
						<form method="POST" action="?/deleteOverride" use:enhance>
							<input name="overrideId" type="hidden" value={override.id} />
							<button class="border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50" type="submit">Remove</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</section>
