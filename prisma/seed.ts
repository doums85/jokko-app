import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

function extractDatabaseUrl(prismaUrl: string): string {
  if (!prismaUrl.startsWith("prisma+postgres://")) {
    return prismaUrl;
  }
  const url = new URL(prismaUrl);
  const apiKey = url.searchParams.get("api_key");
  if (!apiKey) {
    throw new Error("Missing api_key in prisma+postgres URL");
  }
  const decodedString = Buffer.from(apiKey, "base64").toString("utf-8");
  const decoded = JSON.parse(decodedString);
  return decoded.databaseUrl;
}

const connectionString = process.env.DATABASE_URL!;
let prisma: PrismaClient;

if (connectionString.startsWith("prisma+postgres://")) {
  const actualDbUrl = extractDatabaseUrl(connectionString);
  const pool = new Pool({ connectionString: actualDbUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log("🌱 Starting seed...");

  // Password hash for all users (password: "Password123!")
  const passwordHash = await hash("Password123!", 10);

  // Define owners - each will get their own organization
  const owners = [
    {
      name: "Alice Owner",
      email: "alice.owner@acme.com",
      org: { name: "Acme Corporation", slug: "acme-corp", description: "A leading technology company" },
    },
    {
      name: "Bob Owner",
      email: "bob.owner@techstart.com",
      org: { name: "TechStart Inc", slug: "techstart", description: "Innovative startup solutions" },
    },
    {
      name: "Charlie Owner",
      email: "charlie.owner@dataworks.com",
      org: { name: "DataWorks", slug: "dataworks", description: "Data analytics platform" },
    },
    {
      name: "Diana Owner",
      email: "diana.owner@cloudnine.com",
      org: { name: "CloudNine Solutions", slug: "cloudnine", description: "Cloud infrastructure services" },
    },
    {
      name: "Eve Owner",
      email: "eve.owner@devhub.com",
      org: { name: "DevHub", slug: "devhub", description: "Developer tools and services" },
    },
  ];

  // Other users (will be randomly assigned to organizations)
  const otherUsers = [
    // 3 ADMIN
    { name: "Frank Admin", email: "frank.admin@example.com", role: "ADMIN" },
    { name: "Grace Admin", email: "grace.admin@example.com", role: "ADMIN" },
    { name: "Henry Admin", email: "henry.admin@example.com", role: "ADMIN" },

    // 6 MANAGER
    { name: "Ivy Manager", email: "ivy.manager@example.com", role: "MANAGER" },
    { name: "Jack Manager", email: "jack.manager@example.com", role: "MANAGER" },
    { name: "Kate Manager", email: "kate.manager@example.com", role: "MANAGER" },
    { name: "Liam Manager", email: "liam.manager@example.com", role: "MANAGER" },
    { name: "Mia Manager", email: "mia.manager@example.com", role: "MANAGER" },
    { name: "Noah Manager", email: "noah.manager@example.com", role: "MANAGER" },

    // 13 MEMBER
    { name: "Olivia Membre", email: "olivia.membre@example.com", role: "MEMBER" },
    { name: "Paul Membre", email: "paul.membre@example.com", role: "MEMBER" },
    { name: "Quinn Membre", email: "quinn.membre@example.com", role: "MEMBER" },
    { name: "Ruby Membre", email: "ruby.membre@example.com", role: "MEMBER" },
    { name: "Sam Membre", email: "sam.membre@example.com", role: "MEMBER" },
    { name: "Tina Membre", email: "tina.membre@example.com", role: "MEMBER" },
    { name: "Uma Membre", email: "uma.membre@example.com", role: "MEMBER" },
    { name: "Victor Membre", email: "victor.membre@example.com", role: "MEMBER" },
    { name: "Wendy Membre", email: "wendy.membre@example.com", role: "MEMBER" },
    { name: "Xavier Membre", email: "xavier.membre@example.com", role: "MEMBER" },
    { name: "Yara Membre", email: "yara.membre@example.com", role: "MEMBER" },
    { name: "Zack Membre", email: "zack.membre@example.com", role: "MEMBER" },
    { name: "Anna Membre", email: "anna.membre@example.com", role: "MEMBER" },
  ];

  const organizations: { id: string; name: string; slug: string }[] = [];

  console.log("\n📦 Creating organizations and owners...");

  // Create organizations and their owners
  for (const ownerData of owners) {
    // Create organization
    const org = await prisma.organization.upsert({
      where: { slug: ownerData.org.slug },
      update: {},
      create: ownerData.org,
    });

    organizations.push(org);

    // Create owner user
    const user = await prisma.user.upsert({
      where: { email: ownerData.email },
      update: {},
      create: {
        name: ownerData.name,
        email: ownerData.email,
        emailVerified: true,
      },
    });

    // Create account with password
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id,
        },
      },
      update: {},
      create: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });

    // Create membership as OWNER
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        organizationId: org.id,
        role: "OWNER",
      },
    });

    console.log(`  ✓ ${org.name} - ${ownerData.name} (OWNER)`);
  }

  console.log(`\n👥 Creating ${otherUsers.length} additional users...`);

  // Create other users and randomly assign them to organizations
  for (const userData of otherUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        emailVerified: true,
      },
    });

    // Create account with password
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id,
        },
      },
      update: {},
      create: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });

    // Randomly assign to 1-3 organizations
    const numOrgs = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...organizations].sort(() => Math.random() - 0.5);
    const selectedOrgs = shuffled.slice(0, numOrgs);

    for (const org of selectedOrgs) {
      await prisma.membership.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: org.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          organizationId: org.id,
          role: userData.role as "ADMIN" | "MANAGER" | "MEMBER",
        },
      });
    }

    const orgNames = selectedOrgs.map((o) => o.slug).join(", ");
    console.log(`  ✓ ${userData.name} (${userData.role}) → ${orgNames}`);
  }

  console.log("\n📊 Summary by organization:");
  for (const org of organizations) {
    const counts = await prisma.membership.groupBy({
      by: ["role"],
      _count: true,
      where: {
        organizationId: org.id,
      },
    });

    console.log(`\n  ${org.name} (${org.slug}):`);
    counts.forEach((count) => {
      console.log(`    ${count.role}: ${count._count} users`);
    });
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n🔐 All users have the password: Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
