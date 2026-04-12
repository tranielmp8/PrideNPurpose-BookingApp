import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { booking, customer, customerAccount, service } from '$lib/server/db/schema';

export async function getCustomerAccountForUser(userId: string) {
	return db.query.customerAccount.findFirst({
		where: eq(customerAccount.userId, userId)
	});
}

export async function getCustomerAccountForUserAndWorkspace(userId: string, workspaceId: string) {
	return db.query.customerAccount.findFirst({
		where: and(eq(customerAccount.userId, userId), eq(customerAccount.workspaceId, workspaceId))
	});
}

export async function createCustomerAccountForUser(input: {
	userId: string;
	workspaceId: string;
	name: string;
	email: string;
}) {
	const [createdCustomerAccount] = await db
		.insert(customerAccount)
		.values({
			userId: input.userId,
			workspaceId: input.workspaceId,
			name: input.name,
			email: input.email
		})
		.returning();

	return createdCustomerAccount;
}

export async function linkGuestBookingsToCustomerAccount(input: {
	customerAccountId: string;
	workspaceId: string;
	email: string;
}) {
	const normalizedEmail = input.email.trim().toLowerCase();

	const matchingCustomer = await db.query.customer.findFirst({
		where: and(eq(customer.workspaceId, input.workspaceId), eq(customer.email, normalizedEmail))
	});

	if (!matchingCustomer) {
		return 0;
	}

	const linkedBookings = await db
		.update(booking)
		.set({
			customerAccountId: input.customerAccountId,
			updatedAt: new Date()
		})
		.where(
			and(
				eq(booking.workspaceId, input.workspaceId),
				eq(booking.customerId, matchingCustomer.id),
				isNull(booking.customerAccountId)
			)
		)
		.returning({ id: booking.id });

	return linkedBookings.length;
}

export async function getBookingsForCustomerAccount(customerAccountId: string) {
	const bookings = await db.query.booking.findMany({
		where: eq(booking.customerAccountId, customerAccountId),
		orderBy: (booking, { desc }) => [desc(booking.startAt)]
	});

	const services = await db.query.service.findMany();
	const serviceMap = new Map(services.map((item) => [item.id, item]));

	return bookings.map((item) => ({
		...item,
		service: serviceMap.get(item.serviceId) ?? null
	}));
}
