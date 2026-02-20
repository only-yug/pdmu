import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./db/migrations",
    dialect: "sqlite",
    driver: "d1-http",
});
