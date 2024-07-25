import QueryClient from ".";
import { addresses } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";
import { registerService } from "@/lib/utils";
import { db } from "..";
import { NewAddress } from "./validation";

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
