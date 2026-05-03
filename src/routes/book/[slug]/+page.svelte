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
			name: data.customerAccount?.name ?? '',
			email: data.customerAccount?.email ?? '',
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
		return parseDateKey(dateKey).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
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
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
	}

	function getCalendarDays() {
		return buildCalendarDays(data.selectedDate);
	}

	function getPreviousMonth() {
		return shiftMonth(data.selectedDate, -1);
	}

	function getNextMonth() {
		return shiftMonth(data.selectedDate, 1);
	}

	function submitServiceSelection() {
		serviceFilterForm?.requestSubmit();
	}

	function getSelectedServiceName() {
		return (
			data.services.find((service) => service.id === data.selectedServiceId)?.name ??
			'Selected service'
		);
	}

	function getSelectedService() {
		return data.services.find((service) => service.id === data.selectedServiceId) ?? null;
	}

	function getServiceRuleBadges(service: (typeof data.services)[number]) {
		const badges: string[] = [];

		if (service.isIntroOffer) {
			badges.push('Intro session');
		}

		if (service.requiresCustomerAccount) {
			badges.push('Account required');
		} else if (!service.allowGuestBooking) {
			badges.push('No guest booking');
		}

		if (service.maxBookingsPerCustomer !== null) {
			badges.push(`Max ${service.maxBookingsPerCustomer} per customer`);
		}

		return badges;
	}

	function getSelectedServiceMessage(service: (typeof data.services)[number] | null) {
		if (!service) {
			return null;
		}

		if (service.isIntroOffer && service.maxBookingsPerCustomer === 1) {
			return 'Start here with Intro Conversation. It is the first-step session for new customers and can be booked once per customer.';
		}

		if (service.isIntroOffer) {
			return 'Start here with Intro Conversation. This service is designed as the first-step conversation for new customers.';
		}

		if (service.requiresCustomerAccount) {
			return 'Website Creation is for returning customers and requires a customer account before booking.';
		}

		if (service.maxBookingsPerCustomer !== null) {
			return `This service is limited to ${service.maxBookingsPerCustomer} booking${service.maxBookingsPerCustomer === 1 ? '' : 's'} per customer.`;
		}

		return null;
	}
</script>

<svelte:head>
	<title>Book {data.workspace.name} | Pride N Purpose</title>
</svelte:head>

{#if showLimitModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-5 backdrop-blur-sm"
		role="presentation"
		onclick={() => { showLimitModal = false; }}
	>
		<div
			class="w-full max-w-md rounded-[2.5rem] border border-[#d5e2e9] bg-white p-8 shadow-[0_40px_100px_rgba(93,122,139,0.22)]"
			onclick={stopModalClick}
			onkeydown={(event) => event.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="limit-modal-title"
			tabindex="-1"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
					<svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
					</svg>
				</div>
				<button
					type="button"
					onclick={() => { showLimitModal = false; }}
					class="rounded-full border border-[#d5e2e9] bg-[#f8fbfc] px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white"
				>
					Close
				</button>
			</div>

			<h2 id="limit-modal-title" class="mt-5 font-serif text-2xl tracking-tight text-[#384959]">
				You've already completed your Intro Session
			</h2>
			<p class="mt-3 text-sm leading-7 text-slate-600">
				The Intro Conversation is a one-time first-step session for new customers and can only be
				booked once per customer. It looks like you've already had yours — great news, you're all
				set to move forward!
			</p>
			<p class="mt-3 text-sm leading-7 text-slate-600">
				To book a follow-up or your next session, choose a different service from the list above.
				If you have questions, feel free to reach out through the contact page.
			</p>

			<div class="mt-7 flex flex-wrap gap-3">
				<button
					type="button"
					onclick={() => { showLimitModal = false; }}
					class="rounded-full bg-[#96C2DB] px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
				>
					Choose another service
				</button>
				<a
					href={`/book/${page.params.slug}/contact`}
					class="rounded-full border border-[#d5e2e9] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc]"
				>
					Contact us
				</a>
			</div>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-4 py-8 text-slate-900 sm:px-5 md:px-8 md:py-14">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white/92 p-6 shadow-[0_30px_90px_rgba(93,122,139,0.12)] backdrop-blur md:p-9">
			<div>
				<p class="text-base font-bold uppercase tracking-[0.18em] text-[#384959]">
					Pride N Purpose
				</p>
				<p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
					Conversations
				</p>
			</div>
			<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-6xl">
				Book your next conversation with intention.
			</h1>
			<p class="mt-5 text-base leading-7 text-slate-600">
				{data.workspace.description ||
					'Choose a service, pick a day from the calendar, and reserve a time that works for you.'}
			</p>

			<div class="mt-8 grid gap-4">
				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Timezone</p>
					<p class="mt-2 text-base font-semibold">{data.timezone}</p>
				</div>

				{#if data.workspace.locationLabel}
					<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
						<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
							Location
						</p>
						<p class="mt-2 text-base font-semibold">{data.workspace.locationLabel}</p>
					</div>
				{/if}

				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#96C2DB] p-5 text-slate-900">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">
						Booking link
					</p>
					<p class="mt-2 text-sm leading-6 text-slate-800">/book/{page.params.slug}</p>
				</div>

				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Need help?</p>
					<p class="mt-2 text-sm leading-6 text-slate-600">
						Questions before booking or trouble with scheduling?
					</p>
					<a
						class="mt-4 inline-flex rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
						href={`/book/${page.params.slug}/contact`}
					>
						Contact us
					</a>
				</div>

				<div class="rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] p-5">
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Customer account</p>
					<p class="mt-2 text-sm leading-6 text-slate-600">
						{#if data.customerAccount}
							You are signed in as {data.customerAccount.email}.
						{:else}
							Create an account to manage bookings from a customer dashboard.
						{/if}
					</p>
					<div class="mt-4 flex flex-wrap gap-3">
						{#if data.customerAccount}
							<a
								class="inline-flex rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
								href="/customer/dashboard"
							>
								Open dashboard
							</a>
						{:else}
							<a
								class="inline-flex rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
								href={`/customer/sign-in?workspace=${page.params.slug}`}
							>
								Sign in
							</a>
							<a
								class="inline-flex rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
								href={`/customer/sign-up?workspace=${page.params.slug}`}
							>
								Create account
							</a>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-6 shadow-[0_35px_100px_rgba(93,122,139,0.1)] md:p-9">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
						Public booking page
					</p>
					<h2 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">Reserve a session</h2>
						<p class="mt-3 text-sm leading-6 text-slate-600">
							Start with Intro Conversation. Website Creation is for returning customers. Choose your service, select a day from the calendar, then confirm your details.
						</p>
						{#if getSelectedServiceMessage(getSelectedService())}
							<p class="mt-3 rounded-2xl border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
								{getSelectedServiceMessage(getSelectedService())}
							</p>
						{/if}
					</div>

				{#if form?.bookingSuccess}
					<p class="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
						Booking confirmed
					</p>
				{/if}
			</div>

			{#if form?.bookingMessage && !form?.bookingSuccess}
				<p class="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{form.bookingMessage}
				</p>
			{/if}

			{#if form?.confirmedBooking?.zohoJoinLink}
				<div class="mt-4 rounded-[1.75rem] border border-[#c8dce7] bg-[#edf5f9] px-5 py-4 text-sm text-slate-800">
					<p class="font-semibold">Meeting link ready</p>
					<p class="mt-2 break-all">{form.confirmedBooking.zohoJoinLink}</p>
				</div>
			{/if}

			{#if data.services.length === 0}
				<div class="mt-6 rounded-[1.75rem] border border-dashed border-[#cfdce4] bg-[#f8fbfc] p-6 text-sm text-slate-600">
					This provider has not published any active services yet.
				</div>
			{:else}
				<form method="GET" bind:this={serviceFilterForm} class="mt-8 space-y-4">
					<input type="hidden" name="date" value={data.selectedDate} />

					<details class="border border-[#d5e2e9] bg-white" open>
						<summary class="grid cursor-pointer list-none gap-2 bg-[#f8fbfc] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
							<div>
								<h3 class="text-lg font-semibold tracking-tight text-[#384959]">1. Choose a service</h3>
								<p class="mt-1 text-sm text-slate-600">Selected: {getSelectedServiceName()}</p>
							</div>
							<p class="text-sm font-semibold text-[#384959]">Open services</p>
						</summary>

						<div class="divide-y divide-[#d5e2e9] border-t border-[#d5e2e9]">
							{#each data.services as service}
								<label class="block cursor-pointer">
									<input
										class="peer sr-only"
										type="radio"
										name="service"
										value={service.id}
										checked={service.id === data.selectedServiceId}
										onchange={submitServiceSelection}
									/>
									<span class="grid gap-3 px-5 py-4 transition peer-checked:bg-[#edf5f9] hover:bg-[#f8fbfc] md:grid-cols-[minmax(12rem,1fr)_9rem_auto] md:items-center">
										<span>
											<span class="block text-base font-semibold text-slate-900">{service.name}</span>
										</span>
										<span class="text-sm font-semibold text-slate-700">
											{service.durationMinutes} min
											{#if service.priceCents}
												· ${(service.priceCents / 100).toFixed(2)}
											{/if}
										</span>
										{#if getServiceRuleBadges(service).length > 0}
											<div class="mt-3 flex flex-wrap gap-2">
												{#each getServiceRuleBadges(service) as badge}
													<span class="rounded-full border border-[#cfdce4] bg-white px-3 py-1 text-xs font-semibold text-slate-700">
														{badge}
													</span>
												{/each}
											</div>
										{/if}
									</span>
								</label>
							{/each}
						</div>
					</details>

					<details class="border border-[#d5e2e9] bg-white" open>
						<summary class="grid cursor-pointer list-none gap-2 bg-[#f8fbfc] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
							<div>
								<h3 class="text-lg font-semibold tracking-tight text-[#384959]">2. Choose a day</h3>
								<p class="mt-1 text-sm text-slate-600">Selected: {formatFriendlyDate(data.selectedDate)}</p>
							</div>
							<p class="text-sm font-semibold text-[#384959]">Open calendar</p>
						</summary>

						<div class="grid gap-6 border-t border-[#d5e2e9] p-5 xl:grid-cols-[1fr_220px]">
							<div>
								<div class="border border-[#d5e2e9] bg-[#f8fbfc] p-4 sm:p-5">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<a
										class="border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc]"
										href={`?service=${data.selectedServiceId}&date=${getPreviousMonth()}`}
									>
										Previous
									</a>
								<p class="text-base font-semibold tracking-tight text-[#384959] sm:text-lg">{getMonthLabel(data.selectedDate)}</p>
									<a
										class="border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc]"
										href={`?service=${data.selectedServiceId}&date=${getNextMonth()}`}
									>
										Next
									</a>
								</div>

								<div class="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:gap-2 sm:text-xs sm:tracking-[0.18em]">
									{#each weekdayLabels as weekday}
										<div class="py-2">{weekday}</div>
									{/each}
								</div>

								<div class="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
									{#each getCalendarDays() as day}
										<a
											class={`flex h-10 items-center justify-center text-xs font-semibold transition sm:h-12 sm:text-sm ${
												day.isSelected
												? 'bg-[#96C2DB] text-slate-900 shadow-[0_12px_30px_rgba(93,122,139,0.16)]'
												: day.inMonth
													? 'bg-white text-slate-800 hover:bg-[#eef4f7]'
													: 'bg-[#eef4f7] text-slate-400 hover:bg-[#e5edf1]'
											} ${day.isToday && !day.isSelected ? 'ring-2 ring-cyan-300' : ''}`}
											href={`?service=${data.selectedServiceId}&date=${day.dateKey}`}
										>
											{day.label}
										</a>
									{/each}
								</div>
							</div>
						</div>

						<div>
							<label class="text-sm font-medium text-slate-700" for="date-select">Direct date pick</label>
							<input
								class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
								id="date-select"
								name="date"
								type="date"
								value={data.selectedDate}
							/>
							<button
								class="mt-3 w-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
								type="submit"
							>
								Update calendar
							</button>
						</div>
						</div>
					</details>
				</form>

				<details class="mt-4 border border-[#d5e2e9] bg-white" open>
					<summary class="grid cursor-pointer list-none gap-2 bg-[#f8fbfc] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<h3 class="text-lg font-semibold tracking-tight text-[#384959]">3. Choose an available time</h3>
							<p class="mt-1 text-sm text-slate-600">{getSelectedServiceName()} in {data.timezone}</p>
						</div>
						<p class="text-sm font-semibold text-[#384959]">{formatFriendlyDate(data.selectedDate)}</p>
					</summary>

					{#if data.slots.length === 0}
						<div class="border-t border-[#d5e2e9] p-6 text-sm text-slate-600">
							No available times for this service and date.
						</div>
					{:else}
						<div class="divide-y divide-[#d5e2e9] border-t border-[#d5e2e9]">
							{#each data.slots as slot}
								<button
									type="button"
									onclick={() => { selectedSlot = slot.startAt.toISOString(); }}
									class={`grid w-full gap-2 px-5 py-4 text-left text-sm transition md:grid-cols-[1fr_auto] md:items-center ${
										isSelectedSlot(slot.startAt.toISOString())
											? 'bg-[#edf5f9] text-slate-900'
											: 'bg-white hover:bg-[#f4f9fb]'
									}`}
								>
									<span class="block text-base font-semibold">{slot.label}</span>
									<span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
										{isSelectedSlot(slot.startAt.toISOString()) ? 'Selected' : 'Available'}
									</span>
								</button>
							{/each}
						</div>
					{/if}
				</details>

				<details class="mt-4 border border-[#d5e2e9] bg-white" open>
					<summary class="grid cursor-pointer list-none gap-2 bg-[#f8fbfc] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<h3 class="text-lg font-semibold tracking-tight text-[#384959]">4. Confirm booking details</h3>
							<p class="mt-1 text-sm text-slate-600">Service: {getSelectedServiceName()}</p>
						</div>
						<p class="text-sm font-semibold text-[#384959]">Open details</p>
					</summary>

					<form method="POST" action="?/createBooking" use:enhance class="space-y-5 border-t border-[#d5e2e9] p-5 sm:p-6">
						<input name="serviceId" type="hidden" value={data.selectedServiceId} />
						<input name="selectedDate" type="hidden" value={data.selectedDate} />

						<div class="border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
							Booking service: <span class="font-semibold text-slate-900">{getSelectedServiceName()}</span>
						</div>

						<div>
							<label class="text-sm font-medium text-slate-700" for="slotStartAt">Confirm your time</label>
							<select
								class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
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
								<label class="text-sm font-medium text-slate-700" for="name">Your name</label>
								<input
									class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
									id="name"
									name="name"
									required
									value={getBookingValues().name}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-slate-700" for="email">Email</label>
								<input
									class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
									id="email"
									name="email"
									type="email"
									required
									value={getBookingValues().email}
								/>
							</div>
						</div>

						<div>
							<label class="text-sm font-medium text-slate-700" for="notes">Notes</label>
							<textarea
								class="mt-2 block min-h-28 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
								id="notes"
								name="notes"
							>{getBookingValues().notes}</textarea>
						</div>

						<button
							class="w-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
							type="submit"
						>
							Confirm booking
						</button>

						<p class="text-center text-xs leading-6 text-slate-500">
							By confirming this booking, you agree to the
							<a class="font-semibold text-slate-700 underline underline-offset-4" href={`/book/${page.params.slug}/terms`}>
								Terms and Conditions
							</a>
							and acknowledge the
							<a class="font-semibold text-slate-700 underline underline-offset-4" href={`/book/${page.params.slug}/privacy`}>
								Privacy Policy
							</a>.
						</p>
					</form>
				</details>
			{/if}
		</section>
	</div>
</div>
