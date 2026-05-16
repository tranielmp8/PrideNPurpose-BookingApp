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
		if (priceCents === null) {
			return '';
		}

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
				case 'price':
					return formatPrice(selectedService.priceCents);
				case 'description':
					return selectedService.description ?? '';
				case 'confirmationMessage':
					return selectedService.confirmationMessage ?? '';
				case 'maxBookingsPerCustomer':
					return selectedService.maxBookingsPerCustomer?.toString() ?? '';
				case 'durationMinutes':
				case 'bufferBeforeMinutes':
				case 'bufferAfterMinutes':
					return selectedService[field].toString();
				case 'currencyCode':
				case 'name':
					return selectedService[field];
				default:
					return '';
			}
		}

		return getCreateValues()[field]?.toString() ?? '';
	}

	function getChecked(field: 'isIntroOffer') {
		if (modalMode === 'edit' && selectedService) {
			return selectedService[field];
		}

		return getCreateValues()[field];
	}

	function openCreateModal() {
		selectedService = null;
		modalMode = 'create';
	}

	function openEditModal(service: ServiceItem) {
		selectedService = service;
		modalMode = 'edit';
	}

	function closeModal() {
		modalMode = null;
		selectedService = null;
	}

	function serviceStatus(item: ServiceItem) {
		return item.isActive ? 'Active' : 'Archived';
	}
</script>

<svelte:head>
	<title>Services | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="flex flex-col gap-4 border-b border-[#d5e2e9] pb-6 md:flex-row md:items-end md:justify-between">
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Services</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
				Manage bookable services.
			</h1>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
				These rows control what customers can choose from on the public booking page.
			</p>
		</div>

		<button
			class="inline-flex items-center justify-center bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]"
			type="button"
			onclick={openCreateModal}
		>
			Add service
		</button>
	</div>

	{#if form?.serviceMessage}
		<p class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
			{form.serviceMessage}
		</p>
	{/if}

	<section class="border border-[#d5e2e9]">
		<div class="hidden grid-cols-[minmax(12rem,1.4fr)_8rem_8rem_8rem_9rem] gap-4 border-b border-[#d5e2e9] bg-[#f7fafb] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
			<p>Service</p>
			<p>Duration</p>
			<p>Price</p>
			<p>Status</p>
			<p class="text-right">Actions</p>
		</div>

		{#if data.services.length === 0}
			<div class="p-8 text-sm leading-6 text-slate-600">
				No services yet. Add the first service to start shaping the public booking flow.
			</div>
		{:else}
			<div class="divide-y divide-[#d5e2e9]">
				{#each data.services as item}
					<div class="grid gap-3 px-4 py-4 transition hover:bg-[#f7fafb] md:grid-cols-[minmax(12rem,1.4fr)_8rem_8rem_8rem_9rem] md:items-center md:gap-4 md:px-5">
						<button
							class="text-left"
							type="button"
							onclick={() => openEditModal(item)}
							aria-label={`Edit ${item.name}`}
						>
							<span class="block text-base font-semibold tracking-tight text-slate-950">
								{item.name}
							</span>
							<span class="mt-1 block text-sm leading-5 text-slate-500">
								{item.description || 'No description added.'}
							</span>
							<span class="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
								{#if item.isIntroOffer}
									<span class="bg-[#e7f0f4] px-2 py-1 text-[#384959]">Intro</span>
								{/if}
								{#if item.maxBookingsPerCustomer !== null}
									<span class="bg-[#f1f5f7] px-2 py-1">Max {item.maxBookingsPerCustomer}/customer</span>
								{/if}
							</span>
						</button>

						<button
							class="text-left text-sm text-slate-700 md:text-base"
							type="button"
							onclick={() => openEditModal(item)}
						>
							<span class="font-semibold md:hidden">Duration: </span>{item.durationMinutes} min
							{#if item.bufferBeforeMinutes || item.bufferAfterMinutes}
								<span class="block text-xs text-slate-500">
									Buffers {item.bufferBeforeMinutes}/{item.bufferAfterMinutes} min
								</span>
							{/if}
						</button>

						<button
							class="text-left text-sm text-slate-700 md:text-base"
							type="button"
							onclick={() => openEditModal(item)}
						>
							<span class="font-semibold md:hidden">Price: </span>
							{#if item.priceCents !== null}
								{item.currencyCode} {formatPrice(item.priceCents)}
							{:else}
								No price
							{/if}
						</button>

						<button
							class="text-left"
							type="button"
							onclick={() => openEditModal(item)}
						>
							<span
								class={[
									'inline-flex px-3 py-1 text-xs font-semibold',
									item.isActive
										? 'bg-[#e7f0f4] text-[#384959]'
										: 'bg-slate-100 text-slate-500'
								]}
							>
								{serviceStatus(item)}
							</span>
						</button>

						<form class="flex justify-start md:justify-end" method="POST" action="?/toggleService" use:enhance>
							<input name="serviceId" type="hidden" value={item.id} />
							<input name="isActive" type="hidden" value={item.isActive ? 'true' : 'false'} />
							<button
								class="border border-[#cfdce4] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]"
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8"
		role="presentation"
		onclick={closeModal}
	>
		<div
			class="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-[#d5e2e9] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:p-7"
			role="dialog"
			aria-modal="true"
			aria-labelledby="service-modal-title"
			tabindex="-1"
			onclick={(event) => event.stopPropagation()}
			onkeydown={(event) => event.stopPropagation()}
		>
			<div class="flex items-start justify-between gap-4 border-b border-[#d5e2e9] pb-5">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
						{modalMode === 'edit' ? 'Edit service' : 'New service'}
					</p>
					<h2 id="service-modal-title" class="mt-2 text-2xl font-semibold tracking-tight text-[#384959]">
						{modalMode === 'edit' ? selectedService?.name : 'Add a bookable service'}
					</h2>
				</div>

				<button
					class="border border-[#cfdce4] bg-[#f7fafb] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]"
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
					<label class="text-sm font-medium text-slate-700" for="name">Service name</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="name"
						name="name"
						required
						value={getValue('name')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="durationMinutes">Duration</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="durationMinutes"
						name="durationMinutes"
						type="number"
						min="1"
						step="1"
						required
						value={getValue('durationMinutes')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="price">Price</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="price"
						name="price"
						type="number"
						min="0"
						step="0.01"
						placeholder="Optional"
						value={getValue('price')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="currencyCode">Currency</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm uppercase"
						id="currencyCode"
						name="currencyCode"
						maxlength="3"
						value={getValue('currencyCode')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="bufferBeforeMinutes">Buffer before</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="bufferBeforeMinutes"
						name="bufferBeforeMinutes"
						type="number"
						min="0"
						step="1"
						value={getValue('bufferBeforeMinutes')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="bufferAfterMinutes">Buffer after</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="bufferAfterMinutes"
						name="bufferAfterMinutes"
						type="number"
						min="0"
						step="1"
						value={getValue('bufferAfterMinutes')}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="maxBookingsPerCustomer">
						Max bookings per customer
					</label>
					<input
						class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="maxBookingsPerCustomer"
						name="maxBookingsPerCustomer"
						type="number"
						min="0"
						step="1"
						placeholder="Optional"
						value={getValue('maxBookingsPerCustomer')}
					/>
				</div>

				<div class="grid gap-3">
					<label class="flex items-start gap-3 border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
						<input
							class="mt-1 rounded border-[#cfdce4]"
							name="isIntroOffer"
							type="checkbox"
							checked={getChecked('isIntroOffer')}
						/>
						<span>Intro session or first-step offer</span>
					</label>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="description">Description</label>
					<textarea
						class="mt-2 block min-h-28 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="description"
						name="description"
					>{getValue('description')}</textarea>
				</div>

				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="confirmationMessage">
						Confirmation email override
					</label>
					<textarea
						class="mt-2 block min-h-28 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm"
						id="confirmationMessage"
						name="confirmationMessage"
						placeholder="Optional. Overrides the workspace default for this service."
					>{getValue('confirmationMessage')}</textarea>
				</div>

				<div class="flex flex-col-reverse gap-3 border-t border-[#d5e2e9] pt-5 md:col-span-2 md:flex-row md:justify-end">
					<button
						class="border border-[#cfdce4] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]"
						type="button"
						onclick={closeModal}
					>
						Cancel
					</button>
					<button
						class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]"
						type="submit"
					>
						{modalMode === 'edit' ? 'Save changes' : 'Create service'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
