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
		return form?.confirmedBooking?.startAt === isoString;
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

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-4 py-8 text-slate-900 sm:px-5 md:px-8 md:py-14">
	<div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
		<section class="rounded-[2.5rem] border border-[#d5e2e9] bg-white/92 p-6 shadow-[0_30px_90px_rgba(93,122,139,0.12)] backdrop-blur md:p-9">
			<p class="brand-script text-2xl text-slate-600 md:text-3xl">Pride N Purpose Bookings</p>
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

			{#if form?.bookingMessage}
				<p class="mt-6 rounded-[1.5rem] border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
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
				<form method="GET" bind:this={serviceFilterForm} class="mt-8 space-y-8">
					<input type="hidden" name="date" value={data.selectedDate} />

					<div>
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h3 class="text-lg font-semibold tracking-tight text-[#384959]">1. Choose a service</h3>
							<p class="text-sm text-slate-500">Start with Intro Conversation</p>
						</div>

						<p class="mt-3 text-sm leading-6 text-slate-600">
							Intro Conversation is the first step for new customers. Website Creation is for returning customers who are ready to move forward.
						</p>

						<div class="mt-4 grid gap-3 md:grid-cols-2">
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
									<span class="block rounded-[1.75rem] border border-[#d5e2e9] bg-[#f8fbfc] px-5 py-4 transition peer-checked:border-[#96C2DB] peer-checked:bg-[#edf5f9] peer-checked:shadow-[0_12px_32px_rgba(93,122,139,0.12)] hover:border-[#b8ccd8]">
										<span class="block text-base font-semibold text-slate-900">{service.name}</span>
										<span class="mt-2 block text-sm text-slate-600">
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
					</div>

					<div class="grid gap-6 xl:grid-cols-[1fr_220px]">
						<div>
							<div class="flex flex-wrap items-center justify-between gap-3">
							<h3 class="text-lg font-semibold tracking-tight text-[#384959]">2. Choose a day</h3>
								<p class="text-sm text-slate-500">Selected: {formatFriendlyDate(data.selectedDate)}</p>
							</div>

							<div class="mt-4 rounded-[2rem] border border-[#d5e2e9] bg-[#f8fbfc] p-4 sm:p-5">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<a
										class="rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc]"
										href={`?service=${data.selectedServiceId}&date=${getPreviousMonth()}`}
									>
										Previous
									</a>
								<p class="text-base font-semibold tracking-tight text-[#384959] sm:text-lg">{getMonthLabel(data.selectedDate)}</p>
									<a
										class="rounded-full border border-[#d5e2e9] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#b8ccd8] hover:bg-[#f8fbfc]"
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
											class={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold transition sm:h-12 sm:rounded-2xl sm:text-sm ${
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
								class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
								id="date-select"
								name="date"
								type="date"
								value={data.selectedDate}
							/>
							<button
								class="mt-3 w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
								type="submit"
							>
								Update calendar
							</button>
						</div>
					</div>
				</form>

				<div class="mt-8 rounded-[2rem] border border-[#d5e2e9] bg-[#f8fbfc] p-6">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 class="text-lg font-semibold tracking-tight text-[#384959]">3. Choose an available time</h3>
							<p class="mt-1 text-sm text-slate-500">
								{getSelectedServiceName()} in {data.timezone}
							</p>
						</div>
						<p class="rounded-full bg-[#e5edf1] px-4 py-2 text-sm font-semibold text-slate-700">
							{formatFriendlyDate(data.selectedDate)}
						</p>
					</div>

					{#if data.slots.length === 0}
						<div class="mt-4 rounded-[1.5rem] border border-dashed border-[#cfdce4] bg-white p-6 text-sm text-slate-600">
							No available times for this service and date.
						</div>
					{:else}
						<div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
							{#each data.slots as slot}
								<div
									class={`rounded-[1.5rem] border px-4 py-4 text-left text-sm ${
										isSelectedSlot(slot.startAt.toISOString())
													? 'border-[#96C2DB] bg-[#edf5f9] text-slate-900'
													: 'border-[#d5e2e9] bg-white'
									}`}
								>
									<span class="block text-base font-semibold">{slot.label}</span>
									<span class="mt-1 block text-xs uppercase tracking-[0.2em] text-slate-500">
										Available
									</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<form method="POST" action="?/createBooking" use:enhance class="mt-8 space-y-5 rounded-[2rem] border border-[#d5e2e9] bg-white p-5 sm:p-6">
					<input name="serviceId" type="hidden" value={data.selectedServiceId} />
					<input name="selectedDate" type="hidden" value={data.selectedDate} />

					<div class="rounded-[1.5rem] border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-3 text-sm text-slate-700">
						Booking service: <span class="font-semibold text-slate-900">{getSelectedServiceName()}</span>
					</div>

					<div>
						<label class="text-sm font-medium text-slate-700" for="slotStartAt">4. Select your time</label>
						<select
							class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
							id="slotStartAt"
							name="slotStartAt"
							required
						>
							<option value="">Choose a time</option>
							{#each data.slots as slot}
								<option
									value={slot.startAt.toISOString()}
									selected={isSelectedSlot(slot.startAt.toISOString())}
								>
									{slot.label}
								</option>
							{/each}
						</select>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<label class="text-sm font-medium text-slate-700" for="name">Your name</label>
							<input
								class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
								id="name"
								name="name"
								required
								value={getBookingValues().name}
							/>
						</div>

						<div>
							<label class="text-sm font-medium text-slate-700" for="email">Email</label>
							<input
								class="mt-2 block w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
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
							class="mt-2 block min-h-28 w-full rounded-2xl border-[#cfdce4] bg-white px-4 py-3 text-sm"
							id="notes"
							name="notes"
						>{getBookingValues().notes}</textarea>
					</div>

					<button
						class="w-full rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
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
			{/if}
		</section>
	</div>
</div>
