<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Availability | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Availability</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Control when customers can book time.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Manage weekly schedule blocks, date-specific overrides, and the core rules that shape valid slots.
		</p>
	</div>

	{#if form?.availabilityMessage}
		<p class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
			{form.availabilityMessage}
		</p>
	{/if}

	<div class="grid gap-6 xl:grid-cols-2">
		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Booking rules</h2>
			<form method="POST" action="?/updateBookingRules" use:enhance class="mt-6 space-y-5">
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div class="grid content-start gap-2 rounded-3xl border border-stone-200 bg-stone-50/60 p-4">
						<label
							class="flex min-h-[2.5rem] items-end text-sm font-medium text-stone-700"
							for="minNoticeMinutes"
						>
							Minimum notice
						</label>
						<p class="min-h-[3.75rem] text-xs leading-5 text-stone-500">
							How much lead time someone needs before a slot can be booked. Use minutes. `1440`
							means at least 24 hours.
						</p>
					<input
							class="block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="minNoticeMinutes"
						name="minNoticeMinutes"
						type="number"
						min="0"
						step="1"
						value={data.bookingRules.minNoticeMinutes}
					/>
					</div>

					<div class="grid content-start gap-2 rounded-3xl border border-stone-200 bg-stone-50/60 p-4">
						<label
							class="flex min-h-[2.5rem] items-end text-sm font-medium text-stone-700"
							for="customerChangeCutoffMinutes"
						>
							Customer change cutoff
						</label>
						<p class="min-h-[3.75rem] text-xs leading-5 text-stone-500">
							How long before the meeting a customer can still cancel or reschedule online. `0`
							means changes stay open until the meeting starts.
						</p>
					<input
							class="block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="customerChangeCutoffMinutes"
						name="customerChangeCutoffMinutes"
						type="number"
						min="0"
						step="1"
						value={data.bookingRules.customerChangeCutoffMinutes}
					/>
					</div>

					<div class="grid content-start gap-2 rounded-3xl border border-stone-200 bg-stone-50/60 p-4">
						<label
							class="flex min-h-[2.5rem] items-end text-sm font-medium text-stone-700"
							for="bookingWindowDays"
						>
							Booking window
						</label>
						<p class="min-h-[3.75rem] text-xs leading-5 text-stone-500">
							How many days ahead people can book. Smaller values keep the calendar tighter and
							prevent far-future bookings.
						</p>
					<input
							class="block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="bookingWindowDays"
						name="bookingWindowDays"
						type="number"
						min="1"
						step="1"
						value={data.bookingRules.bookingWindowDays}
					/>
					</div>

					<div class="grid content-start gap-2 rounded-3xl border border-stone-200 bg-stone-50/60 p-4">
						<label
							class="flex min-h-[2.5rem] items-end text-sm font-medium text-stone-700"
							for="maxBookingsPerDay"
						>
							Max bookings/day
						</label>
						<p class="min-h-[3.75rem] text-xs leading-5 text-stone-500">
							Optional daily cap across all services. Leave blank if you do not want a limit.
						</p>
					<input
							class="block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="maxBookingsPerDay"
						name="maxBookingsPerDay"
						type="number"
						min="0"
						step="1"
						value={data.bookingRules.maxBookingsPerDay ?? ''}
						placeholder="Optional"
					/>
					</div>
				</div>

				<div>
					<button
						class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
						type="submit"
					>
						Save rules
					</button>
				</div>
			</form>
		</section>

		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Add weekly availability</h2>
			<form method="POST" action="?/createWeeklyWindow" use:enhance class="mt-6 grid gap-4 md:grid-cols-3">
				<div>
					<label class="text-sm font-medium text-stone-700" for="dayOfWeek">Day</label>
					<select
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="dayOfWeek"
						name="dayOfWeek"
					>
						{#each data.days as day}
							<option value={day.value}>{day.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="startTime">Start</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="startTime"
						name="startTime"
						type="time"
						required
						value="09:00"
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="endTime">End</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="endTime"
						name="endTime"
						type="time"
						required
						value="17:00"
					/>
				</div>

				<div class="md:col-span-3">
					<button
						class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
						type="submit"
					>
						Add weekly window
					</button>
				</div>
			</form>
		</section>
	</div>

	<div class="grid gap-6 xl:grid-cols-2">
		<section class="space-y-4">
			<h2 class="text-xl font-semibold tracking-tight">Weekly schedule</h2>

			{#if data.weeklyAvailability.length === 0}
				<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
					No weekly schedule yet. Add one or more day/time windows above.
				</div>
			{:else}
				{#each data.weeklyAvailability as item}
					<div class="rounded-[1.5rem] border border-stone-200 p-6">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h3 class="text-lg font-semibold tracking-tight">
								{data.days.find((day) => day.value === item.dayOfWeek)?.label}
							</h3>

							<form method="POST" action="?/deleteWeeklyWindow" use:enhance>
								<input name="availabilityId" type="hidden" value={item.id} />
								<button
									class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
									type="submit"
								>
									Remove
								</button>
							</form>
						</div>

						<form method="POST" action="?/updateWeeklyWindow" use:enhance class="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
							<input name="availabilityId" type="hidden" value={item.id} />

							<div>
								<label class="text-sm font-medium text-stone-700" for={`weekly-start-${item.id}`}>Start</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`weekly-start-${item.id}`}
									name="startTime"
									type="time"
									required
									value={item.startTime}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`weekly-end-${item.id}`}>End</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`weekly-end-${item.id}`}
									name="endTime"
									type="time"
									required
									value={item.endTime}
								/>
							</div>

							<div class="flex items-end">
								<button
									class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
									type="submit"
								>
									Save
								</button>
							</div>
						</form>
					</div>
				{/each}
			{/if}
		</section>

		<section class="space-y-4">
			<h2 class="text-xl font-semibold tracking-tight">Date overrides</h2>

			<div class="rounded-[1.5rem] border border-stone-200 p-6">
				<form method="POST" action="?/createOverride" use:enhance class="space-y-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<label class="text-sm font-medium text-stone-700" for="overrideDate">Date</label>
							<input
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="overrideDate"
								name="overrideDate"
								type="date"
								required
							/>
						</div>

						<div>
							<label class="text-sm font-medium text-stone-700" for="mode">Mode</label>
							<select
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="mode"
								name="mode"
							>
								<option value="unavailable">Blackout date</option>
								<option value="custom">Custom date window</option>
							</select>
						</div>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<label class="text-sm font-medium text-stone-700" for="overrideStartTime">Start time</label>
							<input
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="overrideStartTime"
								name="startTime"
								type="time"
								value="09:00"
							/>
						</div>

						<div>
							<label class="text-sm font-medium text-stone-700" for="overrideEndTime">End time</label>
							<input
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="overrideEndTime"
								name="endTime"
								type="time"
								value="17:00"
							/>
						</div>
					</div>

					<button
						class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
						type="submit"
					>
						Save override
					</button>
				</form>
			</div>

			{#if data.availabilityOverrides.length === 0}
				<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
					No date-specific overrides yet.
				</div>
			{:else}
				{#each data.availabilityOverrides as override}
					<div class="rounded-[1.5rem] border border-stone-200 p-6">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h3 class="text-lg font-semibold tracking-tight">{override.overrideDate}</h3>
								<p class="text-sm text-stone-500">
									{#if override.isUnavailable}
										Unavailable all day
									{:else if override.windows.length > 0}
										{override.windows.map((window) => `${window.startTime} to ${window.endTime}`).join(', ')}
									{:else}
										Custom override
									{/if}
								</p>
							</div>

							<form method="POST" action="?/deleteOverride" use:enhance>
								<input name="overrideId" type="hidden" value={override.id} />
								<button
									class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
									type="submit"
								>
									Remove
								</button>
							</form>
						</div>
					</div>
				{/each}
			{/if}
		</section>
	</div>
</section>
