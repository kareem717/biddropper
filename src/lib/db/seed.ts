import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	jobs,
	addresses,
	industries,
	jobIndustries,
	bids,
	bidStatus,
	companies,
	accounts,
	jobBids,
} from "./drizzle/schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { env } from "../env.mjs";
import { count, eq } from "drizzle-orm";
import readline from "readline";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
	return new Promise((resolve) => rl.question(query, resolve));
};

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
	const companyData: (typeof companies.$inferInsert)[] = [];

	await db.transaction(async (tx) => {
		let accountId: string | null = "";
		// prompt user to confirm seeding
		const confirmed = await askQuestion(
			"Are you sure you want to seed the database? This action cannot be undone. (yes/no): "
		);
		if (confirmed.toLowerCase() !== "yes") {
			console.log("Seeding cancelled");
			rl.close();
			return;
		} else {
			// ask for account id
			accountId = await askQuestion(
				"Enter the account id to seed the database: "
			);
			if (!accountId) {
				console.log("Account id not found");
				rl.close();
				return;
			}
		}

		const accs = await tx
			.select()
			.from(accounts)
			.where(eq(accounts.id, accountId));

		if (accs.length === 0) {
			console.log("Account not found");
			return;
		}

		const account = accs[0];

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

		//seed 3 companies
		for (let i = 0; i < 3; i++) {
			companyData.push({
				id: randomUUID(),
				name: faker.company.buzzPhrase(),
				addressId: faker.helpers.arrayElement(
					addressData.map((address) => address.id)
				)!,
				ownerId: account.id,
				emailAddress: faker.internet.email(),
				phoneNumber: faker.phone.number(),
				dateFounded: faker.date.recent().toISOString(),
			});
		}
		console.log("Seed start [companies]");
		// insert in batches of 1k
		for (let i = 0; i < companyData.length; i += 1000) {
			await tx.insert(companies).values(companyData.slice(i, i + 1000));
		}
		console.log("Seed done [companies]");

		// add 1-50 bids per job
		for (let j = 0; j < 5000; j++) {
			bidData.push({
				id: randomUUID(),
				senderCompanyId: faker.helpers.arrayElement(
					companyData.map((company) => company.id)
				)!,
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

		console.log("Seed start [job_bids]");

		// create job bids
		const jobBidData = bidData.map((bid) => ({
			jobId: faker.helpers.arrayElement(jobData.map((job) => job.id))!,
			bidId: bid.id!,
		}));

		for (let i = 0; i < jobBidData.length; i += 1000) {
			await tx.insert(jobBids).values(jobBidData.slice(i, i + 1000));
		}
		console.log("Seed done [job_bids]");
	});

	console.log("Seeding complete");
	rl.close();
	process.exit(0);
};

main();
