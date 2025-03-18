import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { DB_URL } from "~/config/env";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
});
