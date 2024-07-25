import QueryClient from ".";
import { addresses } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { registerService } from "@/lib/utils";
import { db } from "..";

export type NewAddress = z.infer<typeof NewAddressSchema>;
export const NewAddressSchema = createInsertSchema(addresses).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});

export type ShowAddress = z.infer<typeof ShowAddressSchema>;
export const ShowAddressSchema = createSelectSchema(addresses);

class AddressQueryClient extends QueryClient {
	async Create(values: NewAddress) {
		const [newAddress] = await this.caller
			.insert(addresses)
			.values(values)
			.returning();

		return newAddress;
	}

	async GetDetailedById(id: string) {
		const [res] = await this.caller
			.select()
			.from(addresses)
			.where(eq(addresses.id, id));

		return res;
	}
}

// Create  global service
export default registerService(
	"addressQueryClient",
	() => new AddressQueryClient(db)
);
