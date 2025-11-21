// ┌─────────────────────────────────────────────────────────┐
// │               Prisma Configuration                      │
// │                                                         │
// │  Points Prisma to the modular schema structure          │
// └─────────────────────────────────────────────────────────┘

import * as dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load environment variables
dotenv.config();

export default defineConfig({
  // Point to the main schema file
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
