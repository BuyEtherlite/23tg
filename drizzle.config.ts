import { defineConfig } from "drizzle-kit";

// Support both DATABASE_URL (development) and POSTGRES_URL (Vercel)
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL or DATABASE_URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  },
});
