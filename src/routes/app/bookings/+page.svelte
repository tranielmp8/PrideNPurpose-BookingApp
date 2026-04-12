<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	type PendingAction = {
		bookingId: string;
		customerName: string;
		type: 'cancel' | 'complete';
	};

	let pendingAction = $state<PendingAction | null>(null);
	const modalCopy = $derived(getModalCopy());
	const currentBookings = $derived(data.bookings.filter((item) => item.status === 'scheduled'));
	const cancelledBookings = $derived(data.bookings.filter((item) => item.status === 'cancelled'));
	const completedBookings = $derived(data.bookings.filter((item) => item.status === 'completed'));
	const sections = $derived([
		{ key: 'current' as const, title: 'Current Meetings', items: currentBookings },
		{ key: 'cancelled' as const, title: 'Cancelled Meetings', items: cancelledBookings },
		{ key: 'completed' as const, title: 'Completed Meetings', items: completedBookings }
	]);

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

	function getCardClass(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') {
			return 'border-red-200 bg-red-50/40';
		}

		if (status === 'completed') {
			return 'border-emerald-200 bg-emerald-50/40';
		}

		return 'border-stone-200 bg-white';
	}

	function getStatusClass(status: (typeof data.bookings)[number]['status']) {
		if (status === 'cancelled') {
			return 'text-red-700';
		}

		if (status === 'completed') {
			return 'text-emerald-700';
		}

		return 'text-stone-500';
	}

	function openActionModal(item: (typeof data.bookings)[number], type: PendingAction['type']) {
		pendingAction = {
			bookingId: item.id,
			customerName: item.customerNameSnapshot,
			type
		};
	}

	function closeActionModal() {
		pendingAction = null;
	}

	function getModalCopy() {
		if (!pendingAction) {
			return null;
		}

		if (pendingAction.type === 'cancel') {
			return {
				title: 'Cancel booking?',
				copy: `This will cancel ${pendingAction.customerName}'s meeting and remove the active booking.`,
				buttonLabel: 'Yes, cancel booking',
				buttonClass:
					'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
			};
		}

		return {
			title: 'Mark booking complete?',
			copy: `This will mark ${pendingAction.customerName}'s meeting as completed.`,
			buttonLabel: 'Yes, mark complete',
			buttonClass:
				'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600'
		};
	}

	function getSectionDescription(section: 'current' | 'cancelled' | 'completed') {
		if (section === 'current') {
			return 'Upcoming and active meetings you can still manage from here.';
		}

		if (section === 'cancelled') {
			return `Recently cancelled meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
		}

		return `Recently completed meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
	}
</script>

<svelte:head>
	<title>Conversations | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Bookings</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Review and manage appointment records.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Current, cancelled, and completed bookings are separated below. Older cancelled and completed
			items move to Archive after 30 days.
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
		<div class="space-y-8">
			{#each sections as section}
				<div class="space-y-4">
					<div class="flex flex-wrap items-end justify-between gap-3">
						<div>
							<h2 class="text-2xl font-semibold tracking-tight text-stone-900">{section.title}</h2>
							<p class="mt-2 text-sm text-stone-600">{getSectionDescription(section.key)}</p>
						</div>
						<p class="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
							{section.items.length} {section.items.length === 1 ? 'meeting' : 'meetings'}
						</p>
					</div>

					{#if section.items.length === 0}
						<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600">
							No {section.key} meetings right now.
						</div>
					{:else}
						<div class="space-y-4">
							{#each section.items as item}
								<div class={`rounded-[1.5rem] border p-6 ${getCardClass(item.status)}`}>
									<div class="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p class={`text-sm uppercase tracking-[0.25em] ${getStatusClass(item.status)}`}>{item.status}</p>
											<h3 class="mt-2 text-xl font-semibold tracking-tight">
												{item.customerNameSnapshot}
											</h3>
											<p class="mt-1 text-sm text-stone-500">{item.customerEmailSnapshot}</p>
											<p class="mt-2">
												<span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
													{item.customerAccountId ? 'Account customer' : 'Guest customer'}
												</span>
											</p>
										</div>

										<div class="flex items-start gap-3">
											<div class="text-right text-sm text-stone-500">
												<p>{formatDateTime(item.startAt)}</p>
												<p class="mt-1">{item.service?.name ?? 'Service removed'}</p>
											</div>

											{#if item.status === 'scheduled'}
												<div class="flex flex-col gap-2">
													<button
														class="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
														onclick={() => openActionModal(item, 'complete')}
														type="button"
													>
														Complete
													</button>

													<button
														class="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50"
														onclick={() => openActionModal(item, 'cancel')}
														type="button"
													>
														Cancel
													</button>
												</div>
											{:else}
												<form method="POST" action="?/archiveBooking" use:enhance>
													<input name="bookingId" type="hidden" value={item.id} />
													<button
														class="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
														type="submit"
													>
														Archive
													</button>
												</form>
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
				</div>
			{/each}
		</div>
	{/if}
</section>

{#if pendingAction}
	<button
		aria-label="Close confirmation dialog"
		class="fixed inset-0 z-40 bg-slate-950/45"
		onclick={closeActionModal}
		type="button"
	></button>
	<div class="fixed inset-0 z-50 flex items-center justify-center px-4">
		<div class="w-full max-w-md rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_35px_100px_rgba(15,23,42,0.22)]">
			{#if modalCopy}
				<p class="text-sm uppercase tracking-[0.24em] text-stone-500">Confirm action</p>
				<h2 class="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{modalCopy.title}</h2>
				<p class="mt-3 text-sm leading-6 text-stone-600">{modalCopy.copy}</p>

				<div class="mt-6 flex flex-wrap justify-end gap-3">
					<button
						class="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
						onclick={closeActionModal}
						type="button"
					>
						Go back
					</button>

					<form
						method="POST"
						action={pendingAction.type === 'cancel' ? '?/cancelBooking' : '?/completeBooking'}
						use:enhance={() => {
							return async ({ update }) => {
								await update();
								closeActionModal();
							};
						}}
					>
						<input name="bookingId" type="hidden" value={pendingAction.bookingId} />
						<button
							class={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 ${modalCopy.buttonClass}`}
							type="submit"
						>
							{modalCopy.buttonLabel}
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
