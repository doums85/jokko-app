import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
// import { Pool } from "pg";

// Temporarily using SQLite due to Neon quota limits
// Switch back to PostgreSQL when quota is resolved:
// export const auth = betterAuth({
//   database: new Pool({
//     host: "ep-weathered-star-ag54zsin-pooler.c-2.eu-central-1.aws.neon.tech",
//     database: "neondb",
//     user: "neondb_owner",
//     password: "npg_JLbyVhW16ktX",
//     port: 5432,
//     ssl: { rejectUnauthorized: false },
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
// });

export const auth = betterAuth({
    database: new Database("./sqlite.db"),
    emailAndPassword: {
        enabled: true,
    },
});
