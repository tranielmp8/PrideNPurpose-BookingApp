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
		return form?.confirmedBooking?.startAt === isoString;
	}
</script>

<svelte:head>
	<title>Book {data.workspace.name} | Booking App</title>
</svelte:head>

<div class="min-h-screen bg-stone-950 px-6 py-16 text-stone-100">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.78fr_1.22fr]">
		<section class="rounded-[2rem] border border-white/10 bg-white/5 p-8">
			<p class="text-sm uppercase tracking-[0.3em] text-amber-300">Public booking page</p>
			<h1 class="mt-4 text-4xl font-semibold tracking-tight">{data.workspace.name}</h1>
			<p class="mt-4 text-sm leading-6 text-stone-300">
				{data.workspace.description || 'Choose a service, pick an available time, and confirm your booking.'}
			</p>

			<div class="mt-8 space-y-4 text-sm text-stone-300">
				<div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
					<p class="text-xs uppercase tracking-[0.25em] text-stone-500">Timezone</p>
					<p class="mt-2 text-base font-medium text-white">{data.timezone}</p>
				</div>
				{#if data.workspace.locationLabel}
					<div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
						<p class="text-xs uppercase tracking-[0.25em] text-stone-500">Location</p>
						<p class="mt-2 text-base font-medium text-white">{data.workspace.locationLabel}</p>
					</div>
				{/if}
				<div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
					<p class="text-xs uppercase tracking-[0.25em] text-stone-500">Booking page</p>
					<p class="mt-2 text-base font-medium text-white">/book/{page.params.slug}</p>
				</div>
			</div>
		</section>

		<section class="rounded-[2rem] bg-white p-8 text-stone-900 shadow-2xl shadow-black/20">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-2xl font-semibold tracking-tight">Book a session</h2>
				{#if form?.bookingSuccess}
					<p class="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">
						Booking confirmed
					</p>
				{/if}
			</div>

			{#if form?.bookingMessage}
				<p class="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
					{form.bookingMessage}
				</p>
			{/if}

			{#if form?.confirmedBooking?.zohoJoinLink}
				<div class="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
					<p class="font-medium">Meeting link ready</p>
					<p class="mt-2 break-all">{form.confirmedBooking.zohoJoinLink}</p>
				</div>
			{/if}

			{#if data.services.length === 0}
				<div class="mt-6 rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
					This provider has not published any active services yet.
				</div>
			{:else}
				<form method="GET" class="mt-6 grid gap-4 md:grid-cols-[1fr_220px_auto]">
					<div>
						<label class="text-sm font-medium text-stone-700" for="service-select">Service</label>
						<select
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="service-select"
							name="service"
						>
							{#each data.services as service}
								<option value={service.id} selected={service.id === data.selectedServiceId}>
									{service.name} · {service.durationMinutes} min
								</option>
							{/each}
						</select>
					</div>

					<div>
						<label class="text-sm font-medium text-stone-700" for="date-select">Date</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="date-select"
							name="date"
							type="date"
							value={data.selectedDate}
						/>
					</div>

					<div class="flex items-end">
						<button
							class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
							type="submit"
						>
							Check times
						</button>
					</div>
				</form>

				<div class="mt-8">
					<h3 class="text-lg font-semibold tracking-tight">Available times</h3>
					<p class="mt-2 text-sm text-stone-500">Times shown in {data.timezone}</p>

					{#if data.slots.length === 0}
						<div class="mt-4 rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
							No available times for this service and date.
						</div>
					{:else}
						<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{#each data.slots as slot}
								<div
									class={`rounded-2xl border px-4 py-3 text-left text-sm ${
										isSelectedSlot(slot.startAt.toISOString())
											? 'border-emerald-500 bg-emerald-50 text-emerald-900'
											: 'border-stone-200 bg-stone-50'
									}`}
								>
									<span class="block font-medium">{slot.label}</span>
									<span class="mt-1 block text-xs text-stone-500">{data.selectedDate}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<form method="POST" action="?/createBooking" use:enhance class="mt-8 space-y-4 rounded-[1.5rem] border border-stone-200 p-6">
					<input name="serviceId" type="hidden" value={data.selectedServiceId} />
					<input name="selectedDate" type="hidden" value={data.selectedDate} />

					<div>
						<label class="text-sm font-medium text-stone-700" for="slotStartAt">Selected time</label>
						<select
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
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
							<label class="text-sm font-medium text-stone-700" for="name">Your name</label>
							<input
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="name"
								name="name"
								required
								value={getBookingValues().name}
							/>
						</div>

						<div>
							<label class="text-sm font-medium text-stone-700" for="email">Email</label>
							<input
								class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
								id="email"
								name="email"
								type="email"
								required
								value={getBookingValues().email}
							/>
						</div>
					</div>

					<div>
						<label class="text-sm font-medium text-stone-700" for="notes">Notes</label>
						<textarea
							class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="notes"
							name="notes"
						>{getBookingValues().notes}</textarea>
					</div>

					<button
						class="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
						type="submit"
					>
						Confirm booking
					</button>
				</form>
			{/if}
		</section>
	</div>
</div>
