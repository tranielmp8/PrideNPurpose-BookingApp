<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const bookingRuleHelp = {
		minNotice: 'How much lead time you require before a new booking can be made. Example: 1440 minutes means customers must book at least 24 hours ahead.',
		customerChangeCutoff: 'How close to the meeting a customer can cancel or reschedule online. Example: 720 minutes means changes stop 12 hours before the meeting.',
		bookingWindow: 'How far into the future customers can see and book available times. Example: 30 days means they can book up to 30 days from today.',
		maxBookingsPerDay: 'The maximum number of bookings allowed in one day across all services. Leave it blank if there is no daily limit.'
	};

	function dayLabel(dayOfWeek: number) {
		return data.days.find((day) => day.value === dayOfWeek)?.label ?? `Day ${dayOfWeek}`;
	}
</script>

<svelte:head>
	<title>Availability | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="border-b pb-6" style="border-color: var(--c-border)">
		<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Availability</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
			Control when customers can book time.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
			Booking rules, weekly schedule blocks, and date overrides are organized as rows you can open when edits are needed.
		</p>
	</div>

	{#if form?.availabilityMessage}
		<p class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
			{form.availabilityMessage}
		</p>
	{/if}

	<!-- Booking rules -->
	<details class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)" open>
		<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
			<div>
				<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Booking rules</h2>
				<p class="mt-1 text-sm" style="color: var(--c-text2)">Notice, change cutoff, booking window, and daily capacity.</p>
			</div>
			<p class="text-sm font-semibold text-[#c2410c]">Edit rules</p>
		</summary>

		<form method="POST" action="?/updateBookingRules" use:enhance class="border-t p-5" style="border-color: var(--c-border)">
			<div class="grid gap-4 md:grid-cols-2">
				{#each [
					{ id: 'minNoticeMinutes', label: 'Minimum notice', help: bookingRuleHelp.minNotice, hint: 'Use minutes. 1440 means at least 24 hours.', value: data.bookingRules.minNoticeMinutes, helpId: 'min-notice-help' },
					{ id: 'customerChangeCutoffMinutes', label: 'Customer change cutoff', help: bookingRuleHelp.customerChangeCutoff, hint: 'How long before the meeting customers can cancel or reschedule online.', value: data.bookingRules.customerChangeCutoffMinutes, helpId: 'customer-change-cutoff-help' },
					{ id: 'bookingWindowDays', label: 'Booking window', help: bookingRuleHelp.bookingWindow, hint: 'How many days ahead people can book.', value: data.bookingRules.bookingWindowDays, helpId: 'booking-window-help' },
					{ id: 'maxBookingsPerDay', label: 'Max bookings/day', help: bookingRuleHelp.maxBookingsPerDay, hint: 'Optional daily cap across all services.', value: data.bookingRules.maxBookingsPerDay ?? '', helpId: 'max-bookings-help' }
				] as rule}
					<div>
						<div class="flex items-center gap-2">
							<label class="text-sm font-medium" for={rule.id} style="color: var(--c-text2)">{rule.label}</label>
							<span class="help-popover">
								<button class="help-trigger" type="button" aria-label="{rule.label} explanation" aria-describedby={rule.helpId}>?</button>
								<span class="help-bubble" id={rule.helpId} role="tooltip">{rule.help}</span>
							</span>
						</div>
						<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
							style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
							id={rule.id} name={rule.id} type="number" min="0" step="1" value={rule.value} placeholder="Optional" />
						<p class="mt-2 text-xs leading-5" style="color: var(--c-text3)">{rule.hint}</p>
					</div>
				{/each}
			</div>

			<button class="mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]" type="submit">
				Save rules
			</button>
		</form>
	</details>

	<!-- Weekly schedule -->
	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 pnp-muted" style="border-color: var(--c-border)">
			<div>
				<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Weekly schedule</h2>
				<p class="mt-1 text-sm" style="color: var(--c-text2)">Recurring day and time windows.</p>
			</div>
		</div>

		<details>
			<summary class="cursor-pointer list-none border-b px-5 py-4 text-sm font-semibold text-[#c2410c] transition hover:pnp-muted" style="border-color: var(--c-border)">
				Add weekly availability
			</summary>
			<form method="POST" action="?/createWeeklyWindow" use:enhance
				class="grid gap-4 border-b p-5 pnp-muted md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
				style="border-color: var(--c-border)">
				<div>
					<label class="text-sm font-medium" for="dayOfWeek" style="color: var(--c-text2)">Day</label>
					<select class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="dayOfWeek" name="dayOfWeek">
						{#each data.days as day}
							<option value={day.value}>{day.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="text-sm font-medium" for="startTime" style="color: var(--c-text2)">Start</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="startTime" name="startTime" type="time" required value="09:00" />
				</div>
				<div>
					<label class="text-sm font-medium" for="endTime" style="color: var(--c-text2)">End</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="endTime" name="endTime" type="time" required value="17:00" />
				</div>
				<button class="rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary" type="submit">Add</button>
			</form>
		</details>

		{#if data.weeklyAvailability.length === 0}
			<div class="p-5 text-sm" style="color: var(--c-text2)">No weekly schedule yet.</div>
		{:else}
			<div class="divide-y" style="border-color: var(--c-border)">
				{#each data.weeklyAvailability as item}
					<details class="group">
						<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 transition md:grid-cols-[1fr_1fr_7rem] md:items-center">
							<p class="font-semibold" style="color: var(--c-text)">{dayLabel(item.dayOfWeek)}</p>
							<p class="text-sm" style="color: var(--c-text2)">{item.startTime} to {item.endTime}</p>
							<p class="text-sm font-semibold text-[#c2410c] md:text-right">
								<span class="group-open:hidden">Edit</span>
								<span class="hidden group-open:inline">Close</span>
							</p>
						</summary>

						<div class="border-t p-5 pnp-muted" style="border-color: var(--c-border)">
							<form method="POST" action="?/updateWeeklyWindow" use:enhance class="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
								<input name="availabilityId" type="hidden" value={item.id} />
								<div>
									<label class="text-sm font-medium" for={`weekly-start-${item.id}`} style="color: var(--c-text2)">Start</label>
									<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
										style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
										id={`weekly-start-${item.id}`} name="startTime" type="time" required value={item.startTime} />
								</div>
								<div>
									<label class="text-sm font-medium" for={`weekly-end-${item.id}`} style="color: var(--c-text2)">End</label>
									<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
										style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
										id={`weekly-end-${item.id}`} name="endTime" type="time" required value={item.endTime} />
								</div>
								<button class="rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary" type="submit">Save</button>
							</form>

							<form class="mt-3" method="POST" action="?/deleteWeeklyWindow" use:enhance>
								<input name="availabilityId" type="hidden" value={item.id} />
								<button class="rounded-xl border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white" type="submit">
									Remove window
								</button>
							</form>
						</div>
					</details>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Date overrides -->
	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="border-b px-5 py-4 pnp-muted" style="border-color: var(--c-border)">
			<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Date overrides</h2>
			<p class="mt-1 text-sm" style="color: var(--c-text2)">Blackout dates and custom date-specific windows.</p>
		</div>

		<details>
			<summary class="cursor-pointer list-none border-b px-5 py-4 text-sm font-semibold text-[#c2410c] transition hover:pnp-muted" style="border-color: var(--c-border)">
				Add date override
			</summary>
			<form method="POST" action="?/createOverride" use:enhance class="grid gap-4 border-b p-5 pnp-muted md:grid-cols-2" style="border-color: var(--c-border)">
				<div>
					<label class="text-sm font-medium" for="overrideDate" style="color: var(--c-text2)">Date</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="overrideDate" name="overrideDate" type="date" required />
				</div>
				<div>
					<label class="text-sm font-medium" for="mode" style="color: var(--c-text2)">Mode</label>
					<select class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="mode" name="mode">
						<option value="unavailable">Blackout date</option>
						<option value="custom">Custom date window</option>
					</select>
				</div>
				<div>
					<label class="text-sm font-medium" for="overrideStartTime" style="color: var(--c-text2)">Start time</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="overrideStartTime" name="startTime" type="time" value="09:00" />
				</div>
				<div>
					<label class="text-sm font-medium" for="overrideEndTime" style="color: var(--c-text2)">End time</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text);"
						id="overrideEndTime" name="endTime" type="time" value="17:00" />
				</div>
				<div class="md:col-span-2">
					<button class="rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]" type="submit">
						Save override
					</button>
				</div>
			</form>
		</details>

		{#if data.availabilityOverrides.length === 0}
			<div class="p-5 text-sm" style="color: var(--c-text2)">No date-specific overrides yet.</div>
		{:else}
			<div class="divide-y" style="border-color: var(--c-border)">
				{#each data.availabilityOverrides as override}
					<div class="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
						<p class="font-semibold" style="color: var(--c-text)">{override.overrideDate}</p>
						<p class="text-sm" style="color: var(--c-text2)">
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
							<button class="rounded-xl border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white" type="submit">
								Remove
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</section>

<style>
	.help-popover {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.help-trigger {
		display: inline-flex;
		height: 1.25rem;
		width: 1.25rem;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--c-border);
		border-radius: 9999px;
		background: var(--c-surface);
		color: var(--c-text2);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1;
		transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
	}

	.help-trigger:hover,
	.help-trigger:focus-visible {
		border-color: #c2410c;
		background: #c2410c;
		color: #ffffff;
		outline: none;
	}

	.help-bubble {
		position: absolute;
		z-index: 20;
		bottom: calc(100% + 0.6rem);
		left: 50%;
		width: min(18rem, calc(100vw - 2rem));
		transform: translateX(-50%) translateY(0.25rem);
		border: 1px solid var(--c-border);
		background: var(--c-surface);
		box-shadow: var(--shadow-md);
		color: var(--c-text2);
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.45;
		opacity: 0;
		padding: 0.75rem;
		pointer-events: none;
		transition: opacity 150ms ease, transform 150ms ease;
		visibility: hidden;
		border-radius: 0.75rem;
	}

	.help-bubble::after {
		position: absolute;
		top: 100%;
		left: 50%;
		height: 0.65rem;
		width: 0.65rem;
		border-right: 1px solid var(--c-border);
		border-bottom: 1px solid var(--c-border);
		background: var(--c-surface);
		content: '';
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.help-popover:hover .help-bubble,
	.help-trigger:focus-visible + .help-bubble {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
		visibility: visible;
	}

	@media (max-width: 640px) {
		.help-bubble {
			left: auto;
			right: -0.75rem;
			transform: translateY(0.25rem);
		}
		.help-bubble::after {
			left: auto;
			right: 1rem;
			transform: translateY(-50%) rotate(45deg);
		}
		.help-popover:hover .help-bubble,
		.help-trigger:focus-visible + .help-bubble {
			transform: translateY(0);
		}
	}
</style>
