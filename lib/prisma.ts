import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function extractDatabaseUrl(prismaUrl: string): string {
  // If it's a standard postgres:// URL, return as is
  if (!prismaUrl.startsWith('prisma+postgres://')) {
    return prismaUrl
  }

  // Extract the API key from prisma+postgres URL
  const url = new URL(prismaUrl)
  const apiKey = url.searchParams.get('api_key')

  if (!apiKey) {
    throw new Error('Missing api_key in prisma+postgres URL')
  }

  try {
    // Decode the API key to get the actual database URL
    const decodedString = Buffer.from(apiKey, 'base64').toString('utf-8')
    const decoded = JSON.parse(decodedString)
    return decoded.databaseUrl
  } catch (error) {
    console.error('Failed to decode Prisma Postgres API key:', error)
    console.error('Decoded string:', Buffer.from(apiKey, 'base64').toString('utf-8'))
    throw error
  }
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!

  // Check if using Prisma Postgres (connection pooling)
  if (connectionString.startsWith('prisma+postgres://')) {
    // Extract the actual PostgreSQL URL from the Prisma Postgres URL
    const actualDbUrl = extractDatabaseUrl(connectionString)
    const pool = new Pool({ connectionString: actualDbUrl })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }

  // Standard PostgreSQL connection
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
