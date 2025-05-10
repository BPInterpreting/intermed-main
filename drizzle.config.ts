import "dotenv/config";
import type {Config} from "drizzle-kit";
import {config} from "dotenv";

console.log('[DEBUG] DATABASE_URL in drizzle.config.ts:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error("🔴 DATABASE_URL environment variable is not set or not loaded correctly!");
}

config({path: ".env"});

export default({
    schema: "./db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
})