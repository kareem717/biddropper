import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	jobs,
	addresses,
	industries,
	jobIndustries,
	bids,
	bidStatus,
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
	const jobIndustryData: (typeof jobIndustries.$inferInsert)[] = [];
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

		for (let i = 0; i < 5000; i++) {
			addressData.push({
				id: randomUUID(),
				xCoordinate: String(faker.location.latitude()),
				yCoordinate: String(faker.location.longitude()),
				line1: faker.location.streetAddress(),
				line2: faker.location.secondaryAddress(),
				city: faker.location.city(),
				fullAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`, // Added fullAddress
				region: faker.location.state(),
				postalCode: faker.location.zipCode(),
				country: faker.location.country(),
				rawJson: null,
				district: faker.location.city(),
				regionCode: faker.location.city(),
			});
		}
		console.log("Seed start [addresses]");
		// insert in batches of 1k
		for (let i = 0; i < addressData.length; i += 1000) {
			await tx.insert(addresses).values(addressData.slice(i, i + 1000));
		}
		console.log("Seed done [addresses]");

		for (let i = 0; i < 5000; i++) {
			jobData.push({
				id: randomUUID(),
				isActive: faker.datatype.boolean(),
				isCommercialProperty: faker.datatype.boolean(),
				description: faker.lorem.sentence({ min: 10, max: 200 }),
				startDate: faker.date.recent().toISOString(),
				endDate: faker.date.future().toISOString(),
				startDateFlag: faker.helpers.arrayElement([
					"none",
					"flexible",
					"urgent",
				])!,
				propertyType: faker.helpers.arrayElement([
					"detached",
					"apartment",
					"semi-detached",
				])!,
				addressId: faker.helpers.arrayElement(
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
					jobId: jobData[i].id!,
					industryId: industry!,
				}))
			);
		}
		console.log("Seed start [job_industries]");
		// insert in batches of 1k
		for (let i = 0; i < jobIndustryData.length; i += 1000) {
			await tx.insert(jobIndustries).values(jobIndustryData.slice(i, i + 1000));
		}
		console.log("Seed done [job_industries]");

		// add 1-50 bids per job
		for (let j = 0; j < 5000; j++) {
			bidData.push({
				id: randomUUID(),
				senderCompanyId: "2331d376-3ec5-4691-95c9-f38f1db6dc6b",
				note: faker.lorem.sentence({ min: 1, max: 5 }),
				priceUsd: faker.number.int({ min: 1000, max: 24999999 }).toString(),
				status: faker.helpers.arrayElement(bidStatus.enumValues),
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
