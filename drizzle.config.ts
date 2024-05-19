import "dotenv/config";
import type {Config} from "drizzle-kit";
import {config} from "dotenv";

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