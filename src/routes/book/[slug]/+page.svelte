<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { data, form } = $props();

	type BookingValues = {
		name: string;
		email: string;
		notes: string;
		serviceId: string;
		selectedDate: string;
	};

	type CalendarDay = {
		dateKey: string;
		label: number;
		inMonth: boolean;
		isSelected: boolean;
		isToday: boolean;
	};

	const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let serviceFilterForm = $state<HTMLFormElement | null>(null);
	let selectedSlot = $state('');
	let showLimitModal = $state(false);

	$effect(() => {
		if (form && 'bookingLimitReached' in form && form.bookingLimitReached) {
			showLimitModal = true;
		}
	});

	function stopModalClick(event: MouseEvent) {
		event.stopPropagation();
	}

	function getBookingValues(): BookingValues {
		if (form && typeof form === 'object' && 'bookingValues' in form) {
			return form.bookingValues as BookingValues;
		}
		return {
			name: '',
			email: '',
			notes: '',
			serviceId: data.selectedServiceId,
			selectedDate: data.selectedDate
		};
	}

	function isSelectedSlot(isoString: string) {
		return form?.confirmedBooking?.startAt === isoString || selectedSlot === isoString;
	}

	function parseDateKey(dateKey: string) {
		const [year, month, day] = dateKey.split('-').map(Number);
		return new Date(year, (month ?? 1) - 1, day ?? 1);
	}

	function formatDateKey(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function getMonthLabel(dateKey: string) {
		return parseDateKey(dateKey).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}

	function shiftMonth(dateKey: string, amount: number) {
		const date = parseDateKey(dateKey);
		return formatDateKey(new Date(date.getFullYear(), date.getMonth() + amount, 1));
	}

	function buildCalendarDays(dateKey: string): CalendarDay[] {
		const selected = parseDateKey(dateKey);
		const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
		const gridStart = new Date(monthStart);
		gridStart.setDate(monthStart.getDate() - monthStart.getDay());

		const todayKey = formatDateKey(new Date());
		const days: CalendarDay[] = [];

		for (let index = 0; index < 42; index += 1) {
			const current = new Date(gridStart);
			current.setDate(gridStart.getDate() + index);
			const currentKey = formatDateKey(current);
			days.push({
				dateKey: currentKey,
				label: current.getDate(),
				inMonth: current.getMonth() === selected.getMonth(),
				isSelected: currentKey === dateKey,
				isToday: currentKey === todayKey
			});
		}
		return days;
	}

	function formatFriendlyDate(dateKey: string) {
		return parseDateKey(dateKey).toLocaleDateString('en-US', {
			weekday: 'long', month: 'long', day: 'numeric'
		});
	}

	function getCalendarDays() { return buildCalendarDays(data.selectedDate); }
	function getPreviousMonth() { return shiftMonth(data.selectedDate, -1); }
	function getNextMonth() { return shiftMonth(data.selectedDate, 1); }
	function submitServiceSelection() { serviceFilterForm?.requestSubmit(); }

	function getSelectedServiceName() {
		return data.services.find((s) => s.id === data.selectedServiceId)?.name ?? 'Selected service';
	}

	function getSelectedService() {
		return data.services.find((s) => s.id === data.selectedServiceId) ?? null;
	}

	function getServiceRuleBadges(service: (typeof data.services)[number]) {
		const badges: string[] = [];
		if (service.isIntroOffer) badges.push('Intro session');
		if (service.maxBookingsPerCustomer !== null) badges.push(`Max ${service.maxBookingsPerCustomer} per customer`);
		return badges;
	}

	function getServiceDescription(service: (typeof data.services)[number]) {
		return service.description?.trim() || 'More details for this service will be shared during your connection.';
	}

	function getServicePreview(service: (typeof data.services)[number]) {
		const description = service.description?.trim();
		if (!description) return 'Open the details below to learn what to expect from this service.';
		if (description.length <= 118) return description;
		return `${description.slice(0, 118).trim()}...`;
	}

	function getSelectedServiceMessage(service: (typeof data.services)[number] | null) {
		if (!service) return null;
		if (service.isIntroOffer && service.maxBookingsPerCustomer === 1) {
			return 'Start here with Intro Conversation. It is the first-step session for new customers and can be booked once per customer.';
		}
		if (service.isIntroOffer) {
			return 'Start here with Intro Conversation. This service is designed as the first-step conversation for new customers.';
		}
		if (service.maxBookingsPerCustomer !== null) {
			return `This service is limited to ${service.maxBookingsPerCustomer} booking${service.maxBookingsPerCustomer === 1 ? '' : 's'} per customer.`;
		}
		return null;
	}
</script>

<svelte:head>
	<title>Book {data.workspace.name} | PNP Connect</title>
</svelte:head>

<!-- Booking limit modal -->
{#if showLimitModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center px-5"
		style="background-color: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
		role="presentation"
		onclick={() => { showLimitModal = false; }}
	>
		<div
			class="w-full max-w-md rounded-[2.5rem] border p-8 shadow-[var(--shadow-lg)] pnp-surface"
			style="border-color: var(--c-border)"
			onclick={stopModalClick}
			onkeydown={(event) => event.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="limit-modal-title"
			tabindex="-1"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style="background-color: rgba(239,68,68,0.12)">
					<svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
					</svg>
				</div>
				<button
					type="button"
					onclick={() => { showLimitModal = false; }}
					class="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
					style="border-color: var(--c-border); color: var(--c-text2)"
				>
					Close
				</button>
			</div>

			<h2 id="limit-modal-title" class="mt-5 font-serif text-2xl tracking-tight" style="color: var(--c-text)">
				You've already completed your Intro Session
			</h2>
			<p class="mt-3 text-sm leading-7" style="color: var(--c-text2)">
				The Intro Conversation is a one-time first-step session for new customers and can only be
				booked once per customer. It looks like you've already had yours — great news, you're all
				set to move forward!
			</p>
			<p class="mt-3 text-sm leading-7" style="color: var(--c-text2)">
				To book a follow-up or your next session, choose a different service from the list above.
				If you have questions, feel free to reach out through the contact page.
			</p>

			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					onclick={() => { showLimitModal = false; }}
					class="rounded-full px-5 py-2.5 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(232,85,33,0.35)]"
				>
					Choose another service
				</button>
				<a
					href={`/book/${page.params.slug}/contact`}
					class="rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
					style="border-color: var(--c-border); color: var(--c-text2)"
				>
					Contact us
				</a>
			</div>
		</div>
	</div>
{/if}

<div class="pnp-page px-4 py-8 sm:px-5 md:px-8 md:py-14">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">

		<!-- Left info sidebar -->
		<section class="rounded-[2.5rem] border p-6 md:p-9 shadow-[var(--shadow-lg)] pnp-surface"
			style="border-color: var(--c-border)">
			<div>
				<p class="text-base font-bold uppercase tracking-[0.18em] text-[#e85521]">
					PNP Connect
				</p>
				<p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em]" style="color: var(--c-text3)">
					Vision sessions
				</p>
			</div>
			<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight md:text-6xl" style="color: var(--c-text)">
				Connect with me, <span class="text-[#e85521]">Traniel Pride</span>, about your Vision!
			</h1>
			<p class="mt-5 text-base leading-7" style="color: var(--c-text2)">
				{data.workspace.description ||
					'Choose the service that fits where you are right now, then reserve time for a focused conversation about your next step.'}
			</p>

			<div class="mt-8 grid gap-4">
				<div class="rounded-[1.75rem] border p-5 pnp-muted" style="border-color: var(--c-border)">
					<p class="text-xs font-semibold uppercase tracking-[0.25em]" style="color: var(--c-text3)">Timezone</p>
					<p class="mt-2 text-base font-semibold" style="color: var(--c-text)">{data.timezone}</p>
				</div>

				{#if data.workspace.locationLabel}
					<div class="rounded-[1.75rem] border p-5 pnp-muted" style="border-color: var(--c-border)">
						<p class="text-xs font-semibold uppercase tracking-[0.25em]" style="color: var(--c-text3)">Location</p>
						<p class="mt-2 text-base font-semibold" style="color: var(--c-text)">{data.workspace.locationLabel}</p>
					</div>
				{/if}

				<div class="rounded-[1.75rem] p-5 shadow-[var(--shadow-sm)]"
					style="background: linear-gradient(135deg, #e85521 0%, #c94818 100%); color: white;">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Booking link</p>
					<p class="mt-2 text-sm leading-6 text-white">/book/{page.params.slug}</p>
				</div>

				<div class="rounded-[1.75rem] border p-5 pnp-muted" style="border-color: var(--c-border)">
					<p class="text-xs font-semibold uppercase tracking-[0.25em]" style="color: var(--c-text3)">Need help?</p>
					<p class="mt-2 text-sm leading-6" style="color: var(--c-text2)">
						Questions before booking or trouble with scheduling?
					</p>
					<a
						class="mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
						style="border-color: var(--c-border); color: var(--c-text2)"
						href={`/book/${page.params.slug}/contact`}
					>
						Contact us
					</a>
				</div>
			</div>
		</section>

		<!-- Right booking panel -->
		<section class="rounded-[2.5rem] border p-6 md:p-9 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.28em]" style="color: var(--c-text3)">
						PNP Connect page
					</p>
					<h2 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
						Choose how we connect
					</h2>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Start with the service that matches your vision, your questions, or the support you need
						next. Read each description, choose a time, then confirm your details.
					</p>
					{#if getSelectedServiceMessage(getSelectedService())}
						<p class="mt-3 rounded-2xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
							{getSelectedServiceMessage(getSelectedService())}
						</p>
					{/if}
				</div>

				{#if form?.bookingSuccess}
					<p class="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-500">
						Connection confirmed
					</p>
				{/if}
			</div>

			{#if form?.bookingMessage && !form?.bookingSuccess}
				<p class="mt-6 rounded-[1.5rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
					{form.bookingMessage}
				</p>
			{/if}

			{#if form?.confirmedBooking?.zohoJoinLink}
				<div class="mt-4 rounded-[1.75rem] border px-5 py-4 text-sm pnp-muted" style="border-color: var(--c-border)">
					<p class="font-semibold text-[#e85521]">Meeting link ready</p>
					<p class="mt-2 break-all" style="color: var(--c-text2)">{form.confirmedBooking.zohoJoinLink}</p>
				</div>
			{/if}

			{#if data.services.length === 0}
				<div class="mt-6 rounded-[1.75rem] border border-dashed p-6 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
					This provider has not published any active services yet.
				</div>
			{:else}
				<form method="GET" bind:this={serviceFilterForm} class="mt-8 space-y-4">
					<input type="hidden" name="date" value={data.selectedDate} />

					<!-- Step 1: Choose service -->
					<details class="rounded-[1.5rem] border overflow-hidden pnp-surface" style="border-color: var(--c-border)" open>
						<summary class="grid cursor-pointer list-none gap-2 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
							<div>
								<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">1. Choose a service</h3>
								<p class="mt-1 text-sm" style="color: var(--c-text2)">Selected: {getSelectedServiceName()}</p>
							</div>
							<p class="text-sm font-semibold text-[#e85521]">Open services</p>
						</summary>

						<div class="grid gap-4 border-t p-4 pnp-muted sm:p-5" style="border-color: var(--c-border)">
							{#each data.services as service}
								<div class="overflow-hidden rounded-[1.35rem] border-2 transition pnp-surface shadow-[var(--shadow-sm)]"
									style={service.id === data.selectedServiceId
										? 'border-color: #e85521; box-shadow: 0 0 0 4px rgba(232,85,33,0.15)'
										: `border-color: var(--c-border)`}
								>
									<label class="grid cursor-pointer gap-4 p-4 sm:p-5 md:grid-cols-[auto_1fr_auto] md:items-start">
										<input
											class="mt-1 h-5 w-5 accent-[#e85521]"
											type="radio"
											name="service"
											value={service.id}
											checked={service.id === data.selectedServiceId}
											onchange={submitServiceSelection}
										/>
										<span class="min-w-0">
											<span class="flex flex-wrap items-center gap-2">
												<span class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">
													{service.name}
												</span>
												{#if service.id === data.selectedServiceId}
													<span class="rounded-full bg-[#e85521] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
														Selected
													</span>
												{/if}
											</span>
											<span class="mt-2 block text-sm leading-6" style="color: var(--c-text2)">
												{getServicePreview(service)}
											</span>
											{#if getServiceRuleBadges(service).length > 0}
												<span class="mt-3 flex flex-wrap gap-2">
													{#each getServiceRuleBadges(service) as badge}
														<span class="rounded-full border px-3 py-1 text-xs font-semibold pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
															{badge}
														</span>
													{/each}
												</span>
											{/if}
										</span>
										<span class="rounded-full border px-4 py-2 text-sm font-semibold pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
											{service.durationMinutes} min
											{#if service.priceCents}
												- ${(service.priceCents / 100).toFixed(2)}
											{/if}
										</span>
									</label>

									<details class="border-t pnp-muted" style="border-color: var(--c-border)">
										<summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold transition hover:text-[#e85521] sm:px-5" style="color: var(--c-text2)">
											<span>Read more about this service</span>
											<span class="text-xs uppercase tracking-[0.18em]" style="color: var(--c-text3)">Details</span>
										</summary>
										<div class="border-t px-4 py-4 text-sm leading-7 pnp-surface sm:px-5" style="border-color: var(--c-border); color: var(--c-text2)">
											<p>{getServiceDescription(service)}</p>
										</div>
									</details>
								</div>
							{/each}
						</div>
					</details>

					<!-- Step 2: Choose day -->
					<details class="rounded-[1.5rem] border overflow-hidden pnp-surface" style="border-color: var(--c-border)" open>
						<summary class="grid cursor-pointer list-none gap-2 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
							<div>
								<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">2. Choose a day</h3>
								<p class="mt-1 text-sm" style="color: var(--c-text2)">Selected: {formatFriendlyDate(data.selectedDate)}</p>
							</div>
							<p class="text-sm font-semibold text-[#e85521]">Open calendar</p>
						</summary>

						<div class="grid gap-6 border-t p-5 xl:grid-cols-[1fr_220px]" style="border-color: var(--c-border)">
							<div>
								<div class="rounded-xl border p-4 pnp-muted sm:p-5" style="border-color: var(--c-border)">
									<div class="flex flex-wrap items-center justify-between gap-3">
										<a
											class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
											style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text2)"
											href={`?service=${data.selectedServiceId}&date=${getPreviousMonth()}`}
										>
											Previous
										</a>
										<p class="text-base font-semibold tracking-tight sm:text-lg" style="color: var(--c-text)">{getMonthLabel(data.selectedDate)}</p>
										<a
											class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
											style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text2)"
											href={`?service=${data.selectedServiceId}&date=${getNextMonth()}`}
										>
											Next
										</a>
									</div>

									<div class="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] sm:gap-2 sm:text-xs sm:tracking-[0.18em]"
										style="color: var(--c-text3)">
										{#each weekdayLabels as weekday}
											<div class="py-2">{weekday}</div>
										{/each}
									</div>

									<div class="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
										{#each getCalendarDays() as day}
											<a
												class="flex h-10 items-center justify-center rounded-lg text-xs font-semibold transition sm:h-12 sm:text-sm"
												style={day.isSelected
													? 'background-color: #e85521; color: white; box-shadow: 0 8px 24px rgba(232,85,33,0.4);'
													: day.inMonth
														? `background-color: var(--c-surface); color: var(--c-text);`
														: `background-color: var(--c-muted); color: var(--c-text3);`}
												class:ring-2={day.isToday && !day.isSelected}
												class:ring-[#e85521]={day.isToday && !day.isSelected}
												href={`?service=${data.selectedServiceId}&date=${day.dateKey}`}
											>
												{day.label}
											</a>
										{/each}
									</div>
								</div>
							</div>

							<div>
								<label class="text-sm font-medium" for="date-select" style="color: var(--c-text2)">Direct date pick</label>
								<input
									class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521]"
									style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
									id="date-select"
									name="date"
									type="date"
									value={data.selectedDate}
								/>
								<button
									class="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(232,85,33,0.3)]"
									type="submit"
								>
									Update calendar
								</button>
							</div>
						</div>
					</details>
				</form>

				<!-- Step 3: Choose time -->
				<details class="mt-4 rounded-[1.5rem] border overflow-hidden pnp-surface" style="border-color: var(--c-border)" open>
					<summary class="grid cursor-pointer list-none gap-2 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">3. Choose an available time</h3>
							<p class="mt-1 text-sm" style="color: var(--c-text2)">{getSelectedServiceName()} in {data.timezone}</p>
						</div>
						<p class="text-sm font-semibold text-[#e85521]">{formatFriendlyDate(data.selectedDate)}</p>
					</summary>

					{#if data.slots.length === 0}
						<div class="border-t p-6 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
							No available times for this service and date.
						</div>
					{:else}
						<div class="divide-y border-t" style="border-color: var(--c-border)">
							{#each data.slots as slot}
								<button
									type="button"
									onclick={() => { selectedSlot = slot.startAt.toISOString(); }}
									class="grid w-full gap-2 px-5 py-4 text-left text-sm transition md:grid-cols-[1fr_auto] md:items-center"
									style={isSelectedSlot(slot.startAt.toISOString())
										? 'background-color: rgba(232,85,33,0.08); border-left: 3px solid #e85521;'
										: `background-color: var(--c-surface);`}
								>
									<span class="block text-base font-semibold" style="color: var(--c-text)">{slot.label}</span>
									<span class="text-xs font-semibold uppercase tracking-[0.18em]"
										style={isSelectedSlot(slot.startAt.toISOString()) ? 'color: #e85521' : `color: var(--c-text3)`}>
										{isSelectedSlot(slot.startAt.toISOString()) ? 'Selected' : 'Available'}
									</span>
								</button>
							{/each}
						</div>
					{/if}
				</details>

				<!-- Step 4: Confirm details -->
				<details class="mt-4 rounded-[1.5rem] border overflow-hidden pnp-surface" style="border-color: var(--c-border)" open>
					<summary class="grid cursor-pointer list-none gap-2 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<h3 class="text-lg font-semibold tracking-tight" style="color: var(--c-text)">4. Confirm connection details</h3>
							<p class="mt-1 text-sm" style="color: var(--c-text2)">Service: {getSelectedServiceName()}</p>
						</div>
						<p class="text-sm font-semibold text-[#e85521]">Open details</p>
					</summary>

					<form method="POST" action="?/createBooking" use:enhance class="space-y-5 border-t p-5 sm:p-6" style="border-color: var(--c-border)">
						<input name="serviceId" type="hidden" value={data.selectedServiceId} />
						<input name="selectedDate" type="hidden" value={data.selectedDate} />

						<div class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border)">
							Booking service: <span class="font-semibold" style="color: var(--c-text)">{getSelectedServiceName()}</span>
						</div>

						<div>
							<label class="text-sm font-medium" for="slotStartAt" style="color: var(--c-text2)">Confirm your time</label>
							<select
								class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521]"
								style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
								id="slotStartAt"
								name="slotStartAt"
								required
								bind:value={selectedSlot}
							>
								<option value="">Choose a time</option>
								{#each data.slots as slot}
									<option value={slot.startAt.toISOString()}>
										{slot.label}
									</option>
								{/each}
							</select>
						</div>

						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<label class="text-sm font-medium" for="name" style="color: var(--c-text2)">Your name</label>
								<input
									class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521]"
									style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
									id="name"
									name="name"
									required
									value={getBookingValues().name}
								/>
							</div>

							<div>
								<label class="text-sm font-medium" for="email" style="color: var(--c-text2)">Email</label>
								<input
									class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521]"
									style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
									id="email"
									name="email"
									type="email"
									required
									value={getBookingValues().email}
								/>
							</div>
						</div>

						<div>
							<label class="text-sm font-medium" for="notes" style="color: var(--c-text2)">Notes</label>
							<textarea
								class="mt-2 block min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521]"
								style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
								id="notes"
								name="notes"
							>{getBookingValues().notes}</textarea>
						</div>

						<button
							class="w-full rounded-full px-5 py-3.5 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_20px_rgba(232,85,33,0.4)]"
							type="submit"
						>
							Confirm connection
						</button>

						<p class="text-center text-xs leading-6" style="color: var(--c-text3)">
							By confirming this connection, you agree to the
							<a class="font-semibold underline underline-offset-4 hover:text-[#e85521] transition" style="color: var(--c-text2)" href={`/book/${page.params.slug}/terms`}>
								Terms and Conditions
							</a>
							and acknowledge the
							<a class="font-semibold underline underline-offset-4 hover:text-[#e85521] transition" style="color: var(--c-text2)" href={`/book/${page.params.slug}/privacy`}>
								Privacy Policy
							</a>.
						</p>
					</form>
				</details>
			{/if}
		</section>
	</div>
</div>
