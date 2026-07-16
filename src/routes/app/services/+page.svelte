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
	};

	type ServiceItem = (typeof data.services)[number];

	const emptyServiceValues: ServiceValues = {
		name: '',
		description: '',
		confirmationMessage: '',
		durationMinutes: '30',
		price: '',
		currencyCode: 'USD',
		bufferBeforeMinutes: '0',
		bufferAfterMinutes: '0',
		maxBookingsPerCustomer: '',
		isIntroOffer: false
	};

	let modalMode = $state<'create' | 'edit' | null>(null);
	let selectedService = $state<ServiceItem | null>(null);

	$effect(() => {
		if (form && typeof form === 'object' && 'serviceValues' in form && modalMode === null) {
			modalMode = 'create';
		}
	});

	function formatPrice(priceCents: number | null) {
		if (priceCents === null) return '';
		return (priceCents / 100).toFixed(2);
	}

	function getCreateValues(): ServiceValues {
		if (form && typeof form === 'object' && 'serviceValues' in form) {
			return form.serviceValues as ServiceValues;
		}
		return emptyServiceValues;
	}

	function getValue(field: keyof ServiceValues) {
		if (modalMode === 'edit' && selectedService) {
			switch (field) {
				case 'price': return formatPrice(selectedService.priceCents);
				case 'description': return selectedService.description ?? '';
				case 'confirmationMessage': return selectedService.confirmationMessage ?? '';
				case 'maxBookingsPerCustomer': return selectedService.maxBookingsPerCustomer?.toString() ?? '';
				case 'durationMinutes':
				case 'bufferBeforeMinutes':
				case 'bufferAfterMinutes': return selectedService[field].toString();
				case 'currencyCode':
				case 'name': return selectedService[field];
				default: return '';
			}
		}
		return getCreateValues()[field]?.toString() ?? '';
	}

	function getChecked(field: 'isIntroOffer') {
		if (modalMode === 'edit' && selectedService) return selectedService[field];
		return getCreateValues()[field];
	}

	function openCreateModal() { selectedService = null; modalMode = 'create'; }
	function openEditModal(service: ServiceItem) { selectedService = service; modalMode = 'edit'; }
	function closeModal() { modalMode = null; selectedService = null; }
	function serviceStatus(item: ServiceItem) { return item.isActive ? 'Active' : 'Archived'; }
</script>

<svelte:head>
	<title>Services | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between"
		style="border-color: var(--c-border)">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Services</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
				Manage bookable services.
			</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
				These rows control what customers can choose from on the public booking page.
			</p>
		</div>

		<button
			class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
			type="button"
			onclick={openCreateModal}
		>
			Add service
		</button>
	</div>

	{#if form?.serviceMessage}
		<p class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
			{form.serviceMessage}
		</p>
	{/if}

	<section class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
		<div class="hidden grid-cols-[minmax(12rem,1.4fr)_8rem_8rem_8rem_9rem] gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] md:grid pnp-muted"
			style="border-color: var(--c-border); color: var(--c-text3)">
			<p>Service</p>
			<p>Duration</p>
			<p>Price</p>
			<p>Status</p>
			<p class="text-right">Actions</p>
		</div>

		{#if data.services.length === 0}
			<div class="p-8 text-sm leading-6" style="color: var(--c-text2)">
				No services yet. Add the first service to start shaping the public booking flow.
			</div>
		{:else}
			<div class="divide-y" style="--tw-divide-color: var(--c-border)">
				{#each data.services as item}
					<div class="grid gap-3 px-4 py-4 transition md:grid-cols-[minmax(12rem,1.4fr)_8rem_8rem_8rem_9rem] md:items-center md:gap-4 md:px-5 hover:pnp-muted"
						style="border-color: var(--c-border)">
						<button class="text-left" type="button" onclick={() => openEditModal(item)} aria-label={`Edit ${item.name}`}>
							<span class="block text-base font-semibold tracking-tight" style="color: var(--c-text)">{item.name}</span>
							<span class="mt-1 block text-sm leading-5" style="color: var(--c-text2)">{item.description || 'No description added.'}</span>
							<span class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
								{#if item.isIntroOffer}
									<span class="rounded px-2 py-1 text-[#c2410c]" style="background-color: rgba(194,65,12,0.1)">Intro</span>
								{/if}
								{#if item.maxBookingsPerCustomer !== null}
									<span class="rounded px-2 py-1 pnp-muted" style="color: var(--c-text2)">Max {item.maxBookingsPerCustomer}/customer</span>
								{/if}
							</span>
						</button>

						<button class="text-left text-sm md:text-base" type="button" onclick={() => openEditModal(item)} style="color: var(--c-text2)">
							<span class="font-semibold md:hidden">Duration: </span>{item.durationMinutes} min
							{#if item.bufferBeforeMinutes || item.bufferAfterMinutes}
								<span class="block text-xs" style="color: var(--c-text3)">Buffers {item.bufferBeforeMinutes}/{item.bufferAfterMinutes} min</span>
							{/if}
						</button>

						<button class="text-left text-sm md:text-base" type="button" onclick={() => openEditModal(item)} style="color: var(--c-text2)">
							<span class="font-semibold md:hidden">Price: </span>
							{#if item.priceCents !== null}
								{item.currencyCode} {formatPrice(item.priceCents)}
							{:else}
								No price
							{/if}
						</button>

						<button class="text-left" type="button" onclick={() => openEditModal(item)}>
							<span class={['inline-flex rounded-full px-3 py-1 text-xs font-semibold', item.isActive ? 'text-[#c2410c]' : ''].join(' ')}
								style={item.isActive ? 'background-color: rgba(194,65,12,0.1)' : `background-color: var(--c-muted); color: var(--c-text3)`}>
								{serviceStatus(item)}
							</span>
						</button>

						<form class="flex justify-start md:justify-end" method="POST" action="?/toggleService" use:enhance>
							<input name="serviceId" type="hidden" value={item.id} />
							<input name="isActive" type="hidden" value={item.isActive ? 'true' : 'false'} />
							<button
								class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
								style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
								type="submit"
							>
								{item.isActive ? 'Archive' : 'Reactivate'}
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</section>

{#if modalMode}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
		style="background-color: rgba(0,0,0,0.6)"
		role="presentation"
		onclick={closeModal}
	>
		<div
			class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border p-6 shadow-[0_30px_90px_rgba(0,0,0,0.4)] md:p-7 pnp-surface"
			style="border-color: var(--c-border)"
			role="dialog"
			aria-modal="true"
			aria-labelledby="service-modal-title"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<div class="flex items-start justify-between gap-4 border-b pb-5" style="border-color: var(--c-border)">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">
						{modalMode === 'edit' ? 'Edit service' : 'New service'}
					</p>
					<h2 id="service-modal-title" class="mt-2 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">
						{modalMode === 'edit' ? selectedService?.name : 'Add a bookable service'}
					</h2>
				</div>

				<button
					class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
					style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
					type="button"
					onclick={closeModal}
				>
					Close
				</button>
			</div>

			<form
				method="POST"
				action={modalMode === 'edit' ? '?/updateService' : '?/createService'}
				use:enhance
				class="mt-6 grid gap-5 md:grid-cols-2"
			>
				{#if modalMode === 'edit' && selectedService}
					<input name="serviceId" type="hidden" value={selectedService.id} />
				{/if}

				<div>
					<label class="text-sm font-medium" for="name" style="color: var(--c-text2)">Service name</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="name" name="name" required value={getValue('name')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="durationMinutes" style="color: var(--c-text2)">Duration (min)</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="durationMinutes" name="durationMinutes" type="number" min="1" step="1" required value={getValue('durationMinutes')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="price" style="color: var(--c-text2)">Price</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="price" name="price" type="number" min="0" step="0.01" placeholder="Optional" value={getValue('price')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="currencyCode" style="color: var(--c-text2)">Currency</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm uppercase outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="currencyCode" name="currencyCode" maxlength="3" value={getValue('currencyCode')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="bufferBeforeMinutes" style="color: var(--c-text2)">Buffer before (min)</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="bufferBeforeMinutes" name="bufferBeforeMinutes" type="number" min="0" step="1" value={getValue('bufferBeforeMinutes')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="bufferAfterMinutes" style="color: var(--c-text2)">Buffer after (min)</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="bufferAfterMinutes" name="bufferAfterMinutes" type="number" min="0" step="1" value={getValue('bufferAfterMinutes')} />
				</div>

				<div>
					<label class="text-sm font-medium" for="maxBookingsPerCustomer" style="color: var(--c-text2)">Max bookings per customer</label>
					<input class="mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="maxBookingsPerCustomer" name="maxBookingsPerCustomer" type="number" min="0" step="1" placeholder="Optional" value={getValue('maxBookingsPerCustomer')} />
				</div>

				<div class="grid gap-3">
					<label class="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition cursor-pointer hover:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)">
						<input class="mt-1 rounded accent-[#c2410c]" name="isIntroOffer" type="checkbox" checked={getChecked('isIntroOffer')} />
						<span>Intro session or first-step offer</span>
					</label>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="description" style="color: var(--c-text2)">Description</label>
					<textarea class="mt-2 block min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="description" name="description">{getValue('description')}</textarea>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="confirmationMessage" style="color: var(--c-text2)">Confirmation email override</label>
					<textarea class="mt-2 block min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);"
						id="confirmationMessage" name="confirmationMessage" placeholder="Optional. Overrides the workspace default for this service.">{getValue('confirmationMessage')}</textarea>
				</div>

				<div class="flex flex-col-reverse gap-3 border-t pt-5 md:col-span-2 md:flex-row md:justify-end" style="border-color: var(--c-border)">
					<button
						class="rounded-xl border px-5 py-3 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
						type="button" onclick={closeModal}
					>
						Cancel
					</button>
					<button
						class="rounded-xl px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
						type="submit"
					>
						{modalMode === 'edit' ? 'Save changes' : 'Create service'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
