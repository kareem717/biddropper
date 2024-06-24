import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	jobs,
	addresses,
	industries,
	job_industries,
	bids,
	bid_status,
} from "./drizzle/schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { env } from "../env.mjs";

const main = async () => {
	const client = new Pool({
		connectionString: env.DATABASE_URL,
	});
	const db = drizzle(client);
	const industryData: (typeof industries.$inferInsert)[] = [];
	const addressData: (typeof addresses.$inferInsert)[] = [];
	const jobData: (typeof jobs.$inferInsert)[] = [];
	const jobIndustryData: (typeof job_industries.$inferInsert)[] = [];
	const bidData: (typeof bids.$inferInsert)[] = [];

	await db.transaction(async (tx) => {
		for (let i = 0; i < 150; i++) {
			industryData.push({
				id: randomUUID(),
				name: faker.company.buzzPhrase(),
			});
		}
		console.log("Seed start [industries]");
		await tx.insert(industries).values(industryData);
		console.log("Seed done [industries]");

		for (let i = 0; i < 50000; i++) {
			addressData.push({
				id: randomUUID(),
				x_coordinate: String(faker.location.latitude()),
				y_coordinate: String(faker.location.longitude()),
				line_1: faker.location.streetAddress(),
				line_2: faker.location.secondaryAddress(),
				city: faker.location.city(),
				region: faker.location.state(),
				postal_code: faker.location.zipCode(),
				country: faker.location.country(),
				raw_json: null,
				district: faker.location.city(),
				region_code: faker.location.city(),
			});
		}
		console.log("Seed start [addresses]");
		// insert in batches of 1k
		for (let i = 0; i < addressData.length; i += 1000) {
			await tx.insert(addresses).values(addressData.slice(i, i + 1000));
		}
		console.log("Seed done [addresses]");

		for (let i = 0; i < 20000; i++) {
			jobData.push({
				id: randomUUID(),
				is_active: faker.datatype.boolean(),
				is_commercial_property: faker.datatype.boolean(),
				description: faker.lorem.sentence({ min: 10, max: 200 }),
				start_date: faker.date.recent().toISOString(),
				end_date: faker.date.future().toISOString(),
				start_date_flag: faker.helpers.arrayElement([
					"none",
					"flexible",
					"urgent",
				])!,
				property_type: faker.helpers.arrayElement([
					"detached",
					"apartment",
					"semi-detached",
				])!,
				address_id: faker.helpers.arrayElement(
					addressData.map((address) => address.id)
				)!,
				title: faker.company.buzzPhrase(),
			});
		}
		console.log("Seed start [jobs]");
		// insert in batches of 1k
		for (let i = 0; i < jobData.length; i += 1000) {
			await tx.insert(jobs).values(jobData.slice(i, i + 1000));
		}
		console.log("Seed done [jobs]");

		// add 1-5 industries per job
		for (let i = 0; i < jobData.length; i++) {
			const industries = faker.helpers.arrayElements(
				industryData.map((industry) => industry.id),
				{ min: 1, max: 5 }
			);
			jobIndustryData.push(
				...industries.map((industry) => ({
					id: randomUUID(),
					job_id: jobData[i].id!,
					industry_id: industry!,
				}))
			);
		}
		console.log("Seed start [job_industries]");
		// insert in batches of 1k
		for (let i = 0; i < jobIndustryData.length; i += 1000) {
			await tx
				.insert(job_industries)
				.values(jobIndustryData.slice(i, i + 1000));
		}
		console.log("Seed done [job_industries]");

		// add 1-50 bids per job
		for (let j = 0; j < 50000; j++) {
			bidData.push({
				id: randomUUID(),
				sender_company_id: "44141008-0a47-42d9-818c-d51240e050d4",
				note: faker.lorem.sentence({ min: 10, max: 15 }),
				price_usd: faker.number.int({ min: 1000, max: 24999999 }).toString(),
				status: faker.helpers.arrayElement(bid_status.enumValues),
			});
		}
		console.log("Seed start [bids]");
		// insert in batches of 1k
		for (let i = 0; i < bidData.length; i += 1000) {
			await tx.insert(bids).values(bidData.slice(i, i + 1000));
		}
		console.log("Seed done [bids]");
	});
};

main();
