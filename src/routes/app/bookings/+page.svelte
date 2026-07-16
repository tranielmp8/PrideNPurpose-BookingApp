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
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
		}).formatToParts(value);
		return Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
	}

	function formatDateTime(value: Date) {
		return new Intl.DateTimeFormat('en-US', {
			timeZone: data.workspace.timezone,
			month: 'short', day: 'numeric', year: 'numeric',
			hour: 'numeric', minute: '2-digit'
		}).format(value);
	}

	type RescheduleValues = { bookingId: string; rescheduleDate: string; rescheduleTime: string; };

	function getRescheduleValues(item: Booking): RescheduleValues {
		if (form && typeof form === 'object' && 'rescheduleValues' in form &&
			(form.rescheduleValues as RescheduleValues | undefined)?.bookingId === item.id) {
			return form.rescheduleValues as RescheduleValues;
		}
		const parts = getZonedParts(item.startAt);
		return { bookingId: item.id, rescheduleDate: `${parts.year}-${parts.month}-${parts.day}`, rescheduleTime: `${parts.hour}:${parts.minute}` };
	}

	function getStatusBadgeStyle(status: Booking['status']) {
		if (status === 'cancelled') return 'background-color: rgba(239,68,68,0.12); color: #ef4444';
		if (status === 'completed') return 'background-color: rgba(16,185,129,0.12); color: #10b981';
		return 'background-color: rgba(194,65,12,0.12); color: #c2410c';
	}

	function openActionModal(item: Booking, type: PendingAction['type']) {
		pendingAction = { bookingId: item.id, customerName: item.customerNameSnapshot, type };
	}

	function closeActionModal() { pendingAction = null; }

	function getModalCopy() {
		if (!pendingAction) return null;
		if (pendingAction.type === 'cancel') {
			return {
				title: 'Cancel booking?',
				copy: `This will cancel ${pendingAction.customerName}'s meeting and remove the active booking.`,
				buttonLabel: 'Yes, cancel booking',
				buttonStyle: 'background-color: #dc2626; color: white',
				hoverClass: 'hover:bg-red-700'
			};
		}
		return {
			title: 'Mark booking complete?',
			copy: `This will mark ${pendingAction.customerName}'s meeting as completed.`,
			buttonLabel: 'Yes, mark complete',
			buttonStyle: 'background-color: #059669; color: white',
			hoverClass: 'hover:bg-emerald-700'
		};
	}

	function getSectionDescription(section: 'current' | 'cancelled' | 'completed') {
		if (section === 'current') return 'Upcoming and active meetings you can still manage from here.';
		if (section === 'cancelled') return `Recently cancelled meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
		return `Recently completed meetings remain visible here before they move to archive after ${data.archiveAfterDays} days.`;
	}
</script>

<svelte:head>
	<title>Bookings | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="border-b pb-6" style="border-color: var(--c-border)">
		<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Bookings</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
			Review and manage appointment records.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
			Current, cancelled, and completed bookings are grouped into condensed rows. Open a row to see notes, links, and actions.
		</p>
	</div>

	{#if form?.bookingMessage}
		<p class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
			{form.bookingMessage}
		</p>
	{/if}

	{#if data.bookings.length === 0}
		<div class="rounded-xl border border-dashed p-6 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
			No bookings yet. Share the public link once your services and availability are ready.
		</div>
	{:else}
		<div class="space-y-7">
			{#each sections as section}
				<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
					<div class="flex flex-wrap items-end justify-between gap-3 border-b px-5 py-4 pnp-muted" style="border-color: var(--c-border)">
						<div>
							<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">{section.title}</h2>
							<p class="mt-1 text-sm" style="color: var(--c-text2)">{getSectionDescription(section.key)}</p>
						</div>
						<p class="rounded-full px-3 py-1 text-sm font-semibold pnp-surface" style="color: var(--c-text2)">
							{section.items.length} {section.items.length === 1 ? 'meeting' : 'meetings'}
						</p>
					</div>

					{#if section.items.length === 0}
						<p class="p-5 text-sm" style="color: var(--c-text2)">No {section.key} meetings right now.</p>
					{:else}
						<div class="divide-y" style="border-color: var(--c-border)">
							{#each section.items as item}
								<details class="group">
									<summary class="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:pnp-muted md:grid-cols-[minmax(12rem,1.2fr)_minmax(12rem,1fr)_10rem_7rem] md:items-center md:px-5"
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
										<p class="text-sm font-semibold text-[#c2410c] md:text-right">
											<span class="group-open:hidden">Open</span>
											<span class="hidden group-open:inline">Close</span>
										</p>
									</summary>

									<div class="border-t px-5 py-5 pnp-muted" style="border-color: var(--c-border)">
										<div class="grid gap-4 md:grid-cols-2">
											<div class="space-y-3 text-sm" style="color: var(--c-text2)">
												<p>
													<span class="font-semibold" style="color: var(--c-text)">Tracking:</span>
													Email captured with booking record
												</p>
												{#if item.customerNotes}
													<p>
														<span class="font-semibold" style="color: var(--c-text)">Notes:</span>
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

											<div class="space-y-3 text-sm" style="color: var(--c-text2)">
												{#if item.status === 'scheduled' && item.zohoStartLink}
													<p class="break-all"><span class="font-semibold" style="color: var(--c-text)">Host link:</span> {item.zohoStartLink}</p>
												{/if}
												{#if item.status === 'scheduled' && item.zohoJoinLink}
													<p class="break-all"><span class="font-semibold" style="color: var(--c-text)">Join link:</span> {item.zohoJoinLink}</p>
												{/if}
											</div>
										</div>

										{#if item.status === 'scheduled'}
											<form method="POST" action="?/rescheduleBooking" use:enhance
												class="mt-5 grid gap-4 rounded-xl border p-4 pnp-surface md:grid-cols-[1fr_1fr_auto]"
												style="border-color: var(--c-border)">
												<input name="bookingId" type="hidden" value={item.id} />

												<div>
													<label class="text-sm font-medium" for={`reschedule-date-${item.id}`} style="color: var(--c-text2)">New date</label>
													<input
														class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
														style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
														id={`reschedule-date-${item.id}`}
														name="rescheduleDate"
														type="date"
														value={getRescheduleValues(item).rescheduleDate}
													/>
												</div>

												<div>
													<label class="text-sm font-medium" for={`reschedule-time-${item.id}`} style="color: var(--c-text2)">New time</label>
													<input
														class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c]"
														style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
														id={`reschedule-time-${item.id}`}
														name="rescheduleTime"
														type="time"
														value={getRescheduleValues(item).rescheduleTime}
													/>
												</div>

												<div class="flex items-end">
													<button class="rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary" type="submit">
														Reschedule
													</button>
												</div>
											</form>

											<div class="mt-4 flex flex-wrap gap-3">
												<button class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
													onclick={() => openActionModal(item, 'complete')} type="button">
													Complete
												</button>
												<button class="rounded-xl border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
													onclick={() => openActionModal(item, 'cancel')} type="button">
													Cancel
												</button>
											</div>
										{:else}
											<form class="mt-5" method="POST" action="?/archiveBooking" use:enhance>
												<input name="bookingId" type="hidden" value={item.id} />
												<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
													style="border-color: var(--c-border); color: var(--c-text2)" type="submit">
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
		class="fixed inset-0 z-40"
		style="background-color: rgba(0,0,0,0.6)"
		onclick={closeActionModal}
		type="button"
	></button>
	<div class="fixed inset-0 z-50 flex items-center justify-center px-4">
		<div class="w-full max-w-md rounded-2xl border p-6 shadow-[0_35px_100px_rgba(0,0,0,0.5)] pnp-surface"
			style="border-color: var(--c-border)">
			{#if modalCopy}
				<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Confirm action</p>
				<h2 class="mt-3 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">{modalCopy.title}</h2>
				<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">{modalCopy.copy}</p>

				<div class="mt-6 flex flex-wrap justify-end gap-3">
					<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
						style="border-color: var(--c-border); color: var(--c-text2)"
						onclick={closeActionModal} type="button">
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
						<button class="rounded-xl px-4 py-2 text-sm font-semibold transition {modalCopy.hoverClass}"
							style={modalCopy.buttonStyle} type="submit">
							{modalCopy.buttonLabel}
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
