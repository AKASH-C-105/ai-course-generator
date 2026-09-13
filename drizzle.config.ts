// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local file for drizzle-kit CLI
dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./configs/schema.tsx",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DB_CONNECTION_STRING!,
  },
});
