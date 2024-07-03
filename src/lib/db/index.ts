import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";
import { registerService } from "@/utils";

const connectionString = env.DATABASE_URL;
const client = postgres(connectionString);

export const db = registerService("db", () => drizzle(client));
