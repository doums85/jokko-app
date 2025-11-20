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
  // At repo root, this points to the prisma/ folder
  schema: "./prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
