<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	type ServiceValues = {
		name: string;
		description: string;
		confirmationMessage: string;
		durationMinutes: string;
		price: string;
		currencyCode: string;
		bufferBeforeMinutes: string;
		bufferAfterMinutes: string;
		maxBookingsPerCustomer: string;
		isIntroOffer: boolean;
		allowGuestBooking: boolean;
		requiresCustomerAccount: boolean;
	};

	function getServiceValues(): ServiceValues {
		if (form && typeof form === 'object' && 'serviceValues' in form) {
			return form.serviceValues as ServiceValues;
		}

		return {
			name: '',
			description: '',
			confirmationMessage: '',
			durationMinutes: '30',
			price: '',
			currencyCode: 'USD',
			bufferBeforeMinutes: '0',
			bufferAfterMinutes: '0',
			maxBookingsPerCustomer: '',
			isIntroOffer: false,
			allowGuestBooking: true,
			requiresCustomerAccount: false
		};
	}

	function formatPrice(priceCents: number | null) {
		if (priceCents === null) {
			return '';
		}

		return (priceCents / 100).toFixed(2);
	}
</script>

<svelte:head>
	<title>Services | Booking App</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Services</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Define the appointments people can book.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Services now save directly to the database and control what appears on the public booking page.
		</p>
	</div>

	{#if form?.serviceMessage}
		<p class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
			{form.serviceMessage}
		</p>
	{/if}

	<div class="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Create service</h2>
			<form method="POST" action="?/createService" use:enhance class="mt-6 space-y-4">
				<div>
					<label class="text-sm font-medium text-stone-700" for="name">Service name</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="name"
						name="name"
						required
						value={getServiceValues().name}
					/>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium text-stone-700" for="durationMinutes">Duration (minutes)</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="durationMinutes"
							name="durationMinutes"
							type="number"
							min="1"
							step="1"
							required
							value={getServiceValues().durationMinutes}
						/>
					</div>

					<div>
						<label class="text-sm font-medium text-stone-700" for="price">Price</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="price"
							name="price"
							type="number"
							min="0"
							step="0.01"
							placeholder="Optional"
							value={getServiceValues().price}
						/>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="currencyCode">Currency</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="currencyCode"
						name="currencyCode"
						maxlength="3"
						value={getServiceValues().currencyCode}
					/>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium text-stone-700" for="bufferBeforeMinutes">Buffer before (minutes)</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="bufferBeforeMinutes"
							name="bufferBeforeMinutes"
							type="number"
							min="0"
							step="1"
							value={getServiceValues().bufferBeforeMinutes}
						/>
					</div>

					<div>
						<label class="text-sm font-medium text-stone-700" for="bufferAfterMinutes">Buffer after (minutes)</label>
						<input
							class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
							id="bufferAfterMinutes"
							name="bufferAfterMinutes"
							type="number"
							min="0"
							step="1"
							value={getServiceValues().bufferAfterMinutes}
						/>
					</div>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="maxBookingsPerCustomer"
						>Max bookings per customer</label
					>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="maxBookingsPerCustomer"
						name="maxBookingsPerCustomer"
						type="number"
						min="0"
						step="1"
						placeholder="Optional"
						value={getServiceValues().maxBookingsPerCustomer}
					/>
				</div>

				<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
					<input
						class="mt-1 rounded border-stone-300"
						name="isIntroOffer"
						type="checkbox"
						checked={getServiceValues().isIntroOffer}
					/>
					<span>Mark this as an intro session or first-step offer.</span>
				</label>

				<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
					<input
						class="mt-1 rounded border-stone-300"
						name="allowGuestBooking"
						type="checkbox"
						checked={getServiceValues().allowGuestBooking}
					/>
					<span>Allow guest booking for this service.</span>
				</label>

				<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
					<input
						class="mt-1 rounded border-stone-300"
						name="requiresCustomerAccount"
						type="checkbox"
						checked={getServiceValues().requiresCustomerAccount}
					/>
					<span>Require a signed-in customer account to book this service.</span>
				</label>

				<div>
					<label class="text-sm font-medium text-stone-700" for="description">Description</label>
					<textarea
						class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="description"
						name="description"
					>{getServiceValues().description}</textarea>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="confirmationMessage">
						Confirmation email override
					</label>
					<textarea
						class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="confirmationMessage"
						name="confirmationMessage"
						placeholder="Optional. Overrides the workspace default for this service."
					>{getServiceValues().confirmationMessage}</textarea>
				</div>

				<button
					class="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
					type="submit"
				>
					Create service
				</button>
			</form>
		</section>

		<section class="space-y-4">
			<h2 class="text-xl font-semibold tracking-tight">Existing services</h2>

			{#if data.services.length === 0}
				<div class="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
					No services yet. Create one to start shaping the public booking flow.
				</div>
			{:else}
				{#each data.services as item}
					<div class="rounded-[1.5rem] border border-stone-200 p-6">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h3 class="text-lg font-semibold tracking-tight">{item.name}</h3>
								<p class="text-sm text-stone-500">
									{item.durationMinutes} min
									{#if item.priceCents !== null}
										, {item.currencyCode} {formatPrice(item.priceCents)}
									{/if}
									{#if item.bufferBeforeMinutes || item.bufferAfterMinutes}
										, buffers {item.bufferBeforeMinutes}/{item.bufferAfterMinutes} min
									{/if}
									{#if item.isIntroOffer}
										, intro offer
									{/if}
									{#if !item.allowGuestBooking}
										, guests off
									{/if}
									{#if item.requiresCustomerAccount}
										, account required
									{/if}
									{#if item.maxBookingsPerCustomer !== null}
										, max {item.maxBookingsPerCustomer}/customer
									{/if}
									, {item.isActive ? 'Active' : 'Archived'}
								</p>
							</div>

							<form method="POST" action="?/toggleService" use:enhance>
								<input name="serviceId" type="hidden" value={item.id} />
								<input name="isActive" type="hidden" value={item.isActive ? 'true' : 'false'} />
								<button
									class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
									type="submit"
								>
									{item.isActive ? 'Archive' : 'Reactivate'}
								</button>
							</form>
						</div>

						<form method="POST" action="?/updateService" use:enhance class="mt-6 grid gap-4 md:grid-cols-2">
							<input name="serviceId" type="hidden" value={item.id} />

							<div>
								<label class="text-sm font-medium text-stone-700" for={`name-${item.id}`}>Name</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`name-${item.id}`}
									name="name"
									required
									value={item.name}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`duration-${item.id}`}>Duration</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`duration-${item.id}`}
									name="durationMinutes"
									type="number"
									min="1"
									step="1"
									required
									value={item.durationMinutes}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`price-${item.id}`}>Price</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`price-${item.id}`}
									name="price"
									type="number"
									min="0"
									step="0.01"
									value={formatPrice(item.priceCents)}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`currency-${item.id}`}>Currency</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`currency-${item.id}`}
									name="currencyCode"
									maxlength="3"
									value={item.currencyCode}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`buffer-before-${item.id}`}>Buffer before</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`buffer-before-${item.id}`}
									name="bufferBeforeMinutes"
									type="number"
									min="0"
									step="1"
									value={item.bufferBeforeMinutes}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`buffer-after-${item.id}`}>Buffer after</label>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`buffer-after-${item.id}`}
									name="bufferAfterMinutes"
									type="number"
									min="0"
									step="1"
									value={item.bufferAfterMinutes}
								/>
							</div>

							<div>
								<label class="text-sm font-medium text-stone-700" for={`max-per-customer-${item.id}`}
									>Max bookings per customer</label
								>
								<input
									class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`max-per-customer-${item.id}`}
									name="maxBookingsPerCustomer"
									type="number"
									min="0"
									step="1"
									value={item.maxBookingsPerCustomer ?? ''}
								/>
							</div>

							<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
								<input
									class="mt-1 rounded border-stone-300"
									name="isIntroOffer"
									type="checkbox"
									checked={item.isIntroOffer}
								/>
								<span>Intro session or first-step offer</span>
							</label>

							<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
								<input
									class="mt-1 rounded border-stone-300"
									name="allowGuestBooking"
									type="checkbox"
									checked={item.allowGuestBooking}
								/>
								<span>Allow guest booking</span>
							</label>

							<label class="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
								<input
									class="mt-1 rounded border-stone-300"
									name="requiresCustomerAccount"
									type="checkbox"
									checked={item.requiresCustomerAccount}
								/>
								<span>Require customer account</span>
							</label>

							<div class="md:col-span-2">
								<label class="text-sm font-medium text-stone-700" for={`description-${item.id}`}>Description</label>
								<textarea
									class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`description-${item.id}`}
									name="description"
								>{item.description ?? ''}</textarea>
							</div>

							<div class="md:col-span-2">
								<label class="text-sm font-medium text-stone-700" for={`confirmation-${item.id}`}>
									Confirmation email override
								</label>
								<textarea
									class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
									id={`confirmation-${item.id}`}
									name="confirmationMessage"
								>{item.confirmationMessage ?? ''}</textarea>
							</div>

							<div class="md:col-span-2">
								<button
									class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
									type="submit"
								>
									Save changes
								</button>
							</div>
						</form>
					</div>
				{/each}
			{/if}
		</section>
	</div>
</section>
