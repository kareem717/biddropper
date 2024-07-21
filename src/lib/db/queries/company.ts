import QueryClient from ".";
import { eq, and, isNull, sql, inArray, not, desc } from "drizzle-orm";
import {
	companies,
	addresses,
	companyIndustries,
} from "@/lib/db/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { NewAddressSchema } from "./address";
import { ShowIndustrySchema } from "./industry";
import IndustryQueryClient from "./industry";
import AddressQueryClient from "./address";

type NewCompany = z.infer<typeof NewCompanySchema>;
const NewCompanySchema = createInsertSchema(companies, {
	name: z.string().min(3).max(60),
})
	.extend({
		address: NewAddressSchema,
		industries: z
			.string({
				invalid_type_error: "Industries must be an array of strings",
				required_error: "Industries are required",
			})
			.uuid({
				message: "Industries must be valid UUIDs",
			})
			.array(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		deletedAt: true,
		addressId: true,
		englishSearchVector: true,
	});

type EditCompany = z.infer<typeof EditCompanySchema>;
const EditCompanySchema = createInsertSchema(companies, {
	id: z.string().uuid(),
	name: z.string().min(3).max(60),
})
	.extend({
		address: NewAddressSchema,
		industries: ShowIndustrySchema.array(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		isVerified: true,
		isActive: true,
		deletedAt: true,
		englishSearchVector: true,
	});

type ShowCompany = z.infer<typeof ShowCompanySchema>;
const ShowCompanySchema = createSelectSchema(companies);

class CompanyQueryClient extends QueryClient {
	async GetDetailedById(id: string) {
		const [res] = await this.caller
			.select()
			.from(companies)
			.where(eq(companies.id, id));

		return res;
	}

	async GetDetailedManyByOwnerId(
		ownerId: string,
		includeDeleted: boolean = false
	) {
		return await this.caller
			.select()
			.from(companies)
			.where(
				and(
					eq(companies.ownerId, ownerId),
					includeDeleted ? undefined : isNull(companies.deletedAt)
				)
			);
	}

	async GetExtendedById(id: string) {
		const [company] = await this.caller
			.select({
				company: companies,
				address: addresses,
			})
			.from(companies)
			.where(eq(companies.id, id))
			.innerJoin(addresses, eq(companies.addressId, addresses.id));

		const industryQueryClient = new IndustryQueryClient(this.caller);
		const industries = await industryQueryClient.GetDetailedManyByCompanyId(id);

		return {
			...company.company,
			address: company.address,
			industries: industries,
		};
	}

	async GetBasicManyByKeyword(
		keyword: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false,
		ownerId: string
	) {
		const ownedCompanies = await this.GetDetailedManyByOwnerId(ownerId, true);
		const ownedCompanyIds = ownedCompanies.map((company) => company.id);

		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: companies.id,
					name: companies.name,
					deletedAt: companies.deletedAt,
				})
				.from(companies)
				.where(
					and(
						not(inArray(companies.id, ownedCompanyIds)),
						includeDeleted ? undefined : isNull(companies.deletedAt),
						sql`companies.english_search_vector @@ WEBSEARCH_TO_TSQUERY('english',${keyword})`
					)
				)
				.orderBy(
					sql`ts_rank(companies.english_search_vector, WEBSEARCH_TO_TSQUERY('english', ${keyword}))`
				)
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async GetBasicManyByUserReccomendation(
		userId: string,
		page: number,
		pageSize: number,
		includeDeleted: boolean = false
	) {
		const ownedCompanies = await this.GetDetailedManyByOwnerId(userId, true);
		const ownedCompanyIds = ownedCompanies.map((company) => company.id);

		// TODO: implement recommendation logic
		const res = await this.WithOffsetPagination(
			this.caller
				.select({
					id: companies.id,
					name: companies.name,
					deletedAt: companies.deletedAt,
				})
				.from(companies)
				.where(
					and(
						not(inArray(companies.id, ownedCompanyIds)),
						includeDeleted ? undefined : isNull(companies.deletedAt)
					)
				)
				.orderBy(desc(companies.createdAt))
				.$dynamic(),
			page,
			pageSize
		);

		return this.GenerateOffsetPaginationResponse(res, page, pageSize);
	}

	async Create(values: NewCompany) {
		return await this.caller.transaction(async (tx) => {
			const addressQueryClient = new AddressQueryClient(tx);
			const industryQueryClient = new IndustryQueryClient(tx);

			const newAddress = await addressQueryClient.Create(values.address);

			const [newCompany] = await tx
				.insert(companies)
				.values({
					...values,
					addressId: newAddress.id,
				})
				.returning();

			await industryQueryClient.CreateCompanyIndustries(
				values.industries.map((industry) => ({
					companyId: newCompany.id,
					industryId: industry,
				}))
			);

			return newCompany;
		});
	}

	async Update(values: EditCompany) {
		const { address, industries, id: companyId, ...company } = values;

		if (!companyId) {
			throw new Error("Company ID is required");
		}

		await this.caller.transaction(async (tx) => {
			const addressQueryClient = new AddressQueryClient(tx);
			const industryQueryClient = new IndustryQueryClient(tx);

			const currAddress = await addressQueryClient.GetDetailedById(
				company.addressId
			);

			// if the address values have been changed, update the address
			const addressChanged = Object.entries(address).some(([key, value]) =>
				Object.entries(currAddress).some(([k, v]) => k === key && v !== value)
			);

			if (addressChanged) {
				// Since we're reusing address in other places, we don't wanna update the current address, rather create a new one
				const newAddress = await addressQueryClient.Create(address);
				company.addressId = newAddress.id;
			}

			// update the industries, if they already exist, do nothing, otherwise insert them
			const addedIndustries = await industryQueryClient.CreateCompanyIndustries(
				industries.map((industry) => ({
					companyId: companyId,
					industryId: industry.id,
				}))
			);

			// I dont see another use case for this functionality, so no need to include it on the industryQueryClient
			await tx.delete(companyIndustries).where(
				and(
					not(
						inArray(
							companyIndustries.industryId,
							addedIndustries.map((industry) => industry.industryId)
						)
					),
					eq(companyIndustries.companyId, companyId)
				)
			);

			await tx
				.update(companies)
				.set(company)
				.where(eq(companies.id, companyId));
		});
	}

	async Delete(id: string) {
		return await this.caller
			.update(companies)
			.set({ deletedAt: new Date().toISOString() })
			.where(eq(companies.id, id));
	}
}

export { NewCompanySchema, EditCompanySchema, ShowCompanySchema };
export type { NewCompany, EditCompany, ShowCompany };
export default CompanyQueryClient;
