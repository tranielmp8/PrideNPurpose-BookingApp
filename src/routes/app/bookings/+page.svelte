<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	type Booking = (typeof data.bookings)[number];
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
		{ key: 'current' as const, title: 'Current meetings', items: currentBookings },
		{ key: 'cancelled' as const, title: 'Cancelled meetings', items: cancelledBookings },
		{ key: 'completed' as const, title: 'Completed meetings', items: completedBookings }
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
			parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
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

	function getRescheduleValues(item: Booking): RescheduleValues {
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

	function getStatusClass(status: Booking['status']) {
		if (status === 'cancelled') return 'bg-red-50 text-red-700';
		if (status === 'completed') return 'bg-emerald-50 text-emerald-700';
		return 'bg-[#e7f0f4] text-[#384959]';
	}

	function openActionModal(item: Booking, type: PendingAction['type']) {
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
		if (!pendingAction) return null;

		if (pendingAction.type === 'cancel') {
			return {
				title: 'Cancel booking?',
				copy: `This will cancel ${pendingAction.customerName}'s meeting and remove the active booking.`,
				buttonLabel: 'Yes, cancel booking',
				buttonClass: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
			};
		}

		return {
			title: 'Mark booking complete?',
			copy: `This will mark ${pendingAction.customerName}'s meeting as completed.`,
			buttonLabel: 'Yes, mark complete',
			buttonClass: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600'
		};
	}

	function getSectionDescription(section: 'current' | 'cancelled' | 'completed') {
		if (section === 'current') return 'Upcoming and active meetings you can still manage from here.';
		if (section === 'cancelled') {
			return `Recently cancelled meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
		}

		return `Recently completed meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
	}
</script>

<svelte:head>
	<title>Conversations | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="border-b border-[#d5e2e9] pb-6">
		<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Bookings</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
			Review and manage appointment records.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
			Current, cancelled, and completed bookings are grouped into condensed rows. Open a row to see notes, links, and actions.
		</p>
	</div>

	{#if form?.bookingMessage}
		<p class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
			{form.bookingMessage}
		</p>
	{/if}

	{#if data.bookings.length === 0}
		<div class="border border-dashed border-[#cfdce4] bg-[#f7fafb] p-6 text-sm text-slate-600">
			No bookings yet. Share the public link once your services and availability are ready.
		</div>
	{:else}
		<div class="space-y-7">
			{#each sections as section}
				<section class="border border-[#d5e2e9]">
					<div class="flex flex-wrap items-end justify-between gap-3 border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-4">
						<div>
							<h2 class="text-xl font-semibold tracking-tight text-[#384959]">{section.title}</h2>
							<p class="mt-1 text-sm text-slate-600">{getSectionDescription(section.key)}</p>
						</div>
						<p class="bg-white px-3 py-1 text-sm font-semibold text-slate-600">
							{section.items.length} {section.items.length === 1 ? 'meeting' : 'meetings'}
						</p>
					</div>

					{#if section.items.length === 0}
						<p class="p-5 text-sm text-slate-600">No {section.key} meetings right now.</p>
					{:else}
						<div class="divide-y divide-[#d5e2e9]">
							{#each section.items as item}
								<details class="group">
									<summary class="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-[#f7fafb] md:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_10rem_7rem] md:items-center md:px-5">
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

									<div class="border-t border-[#d5e2e9] bg-[#fbfcfd] px-5 py-5">
										<div class="grid gap-4 md:grid-cols-2">
											<div class="space-y-3 text-sm text-slate-600">
												<p>
													<span class="font-semibold text-slate-950">Tracking:</span>
													Email captured with booking record
												</p>
												{#if item.customerNotes}
													<p>
														<span class="font-semibold text-slate-950">Notes:</span>
														{item.customerNotes}
													</p>
												{/if}
												{#if item.cancelledAt}
													<p>Cancelled on {formatDateTime(item.cancelledAt)}</p>
												{/if}
												{#if item.completedAt}
													<p>Completed on {formatDateTime(item.completedAt)}</p>
												{/if}
											</div>

											<div class="space-y-3 text-sm text-slate-600">
												{#if item.status === 'scheduled' && item.zohoStartLink}
													<p class="break-all"><span class="font-semibold text-slate-950">Host link:</span> {item.zohoStartLink}</p>
												{/if}
												{#if item.status === 'scheduled' && item.zohoJoinLink}
													<p class="break-all"><span class="font-semibold text-slate-950">Join link:</span> {item.zohoJoinLink}</p>
												{/if}
											</div>
										</div>

										{#if item.status === 'scheduled'}
											<form
												method="POST"
												action="?/rescheduleBooking"
												use:enhance
												class="mt-5 grid gap-4 border border-[#d5e2e9] bg-white p-4 md:grid-cols-[1fr_1fr_auto]"
											>
												<input name="bookingId" type="hidden" value={item.id} />

												<div>
													<label class="text-sm font-medium text-slate-700" for={`reschedule-date-${item.id}`}>New date</label>
													<input
														class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
														id={`reschedule-date-${item.id}`}
														name="rescheduleDate"
														type="date"
														value={getRescheduleValues(item).rescheduleDate}
													/>
												</div>

												<div>
													<label class="text-sm font-medium text-slate-700" for={`reschedule-time-${item.id}`}>New time</label>
													<input
														class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
														id={`reschedule-time-${item.id}`}
														name="rescheduleTime"
														type="time"
														value={getRescheduleValues(item).rescheduleTime}
													/>
												</div>

												<div class="flex items-end">
													<button class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">
														Reschedule
													</button>
												</div>
											</form>

											<div class="mt-4 flex flex-wrap gap-3">
												<button class="bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700" onclick={() => openActionModal(item, 'complete')} type="button">
													Complete
												</button>
												<button class="border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50" onclick={() => openActionModal(item, 'cancel')} type="button">
													Cancel
												</button>
											</div>
										{:else}
											<form class="mt-5" method="POST" action="?/archiveBooking" use:enhance>
												<input name="bookingId" type="hidden" value={item.id} />
												<button class="border border-[#cfdce4] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]" type="submit">
													Archive
												</button>
											</form>
										{/if}
									</div>
								</details>
							{/each}
						</div>
					{/if}
				</section>
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
		<div class="w-full max-w-md border border-[#d5e2e9] bg-white p-6 shadow-[0_35px_100px_rgba(15,23,42,0.22)]">
			{#if modalCopy}
				<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Confirm action</p>
				<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#384959]">{modalCopy.title}</h2>
				<p class="mt-3 text-sm leading-6 text-slate-600">{modalCopy.copy}</p>

				<div class="mt-6 flex flex-wrap justify-end gap-3">
					<button class="border border-[#cfdce4] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]" onclick={closeActionModal} type="button">
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
						<button class={`px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${modalCopy.buttonClass}`} type="submit">
							{modalCopy.buttonLabel}
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
