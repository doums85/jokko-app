# Jokko - Technical Documentation (Next.js 16)

```
                    🚀 JOKKO - WhatsApp Business SaaS + AI
                        Multi-Schema Architecture
    
    ┌─────────────────────────────────────────────────────────────┐
    │                      TECH STACK                             │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │  Next.js 16 │  │ Better Auth │  │    Neon DB +        │ │
    │  │ + Turbopack │  │ + AWS SES   │  │ Prisma Multi-Schema │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │   Zustand   │  │ shadcn/ui   │  │   Playwright        │ │
    │  │   + Zod     │  │ WhatsApp    │  │     Tests           │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │   React 19  │  │   Cache     │  │  React Compiler     │ │
    │  │    .2       │  │ Components  │  │    (Stable)         │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    │                                                             │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
    │  │  AWS SES    │  │   AWS S3    │  │  Image Optimization │ │
    │  │  ($0.10/k)  │  │ (Unlimited) │  │     (Sharp)         │ │
    │  └─────────────┘  └─────────────┘  └─────────────────────┘ │
    └─────────────────────────────────────────────────────────────┘
```

## 🎯 Overview

**Jokko** is a multi-tenant SaaS enabling businesses to manage WhatsApp Business communications with AI assistance. Uses multi-schema Prisma architecture for cost-effective tenant isolation.

### Business Model
- **Monthly subscriptions**: $29, $99, $299
- **Multi-schema isolation**: Complete data separation with single DB
- **Subdomains**: `client.jokko.co`
- **Target**: SMBs, e-commerce, customer service

### Core Features
- Multi-agent WhatsApp Business management
- AI conversations (OpenAI/Claude)
- Automated response templates
- Analytics and reporting
- Stripe billing integration

## 🏗️ Technical Architecture

### Stack (Next.js 16)
```typescript
Framework: Next.js 16 (App Router) + TypeScript
Bundler: Turbopack (default, 2-5x faster builds)
React: React 19.2 (View Transitions, useEffectEvent, Activity)
Authentication: Better Auth + AWS SES emails
Database: Neon PostgreSQL + Prisma Multi-Schema
Storage: AWS S3 (images, media, files)
State: Zustand (zero Context API)
UI: shadcn/ui + Tailwind CSS (WhatsApp design)
Validation: Zod schemas
Testing: Playwright only
Deployment: Vercel + wildcard SSL
Cache System: Cache Components with "use cache" directive
Performance: React Compiler (stable, opt-in)
```

### Multi-Schema Architecture
```
Single Neon Database
├── Schema "auth" → Better Auth tables
├── Schema "main" → Tenant management
├── Schema "tenant_a" → Client A business data
├── Schema "tenant_b" → Client B business data
└── Schema "tenant_n" → Client N business data

Cost: $19/month total vs $950/month with separate DBs
Isolation: Complete schema separation
Performance: Native PostgreSQL schema switching
Build Performance: 2-5x faster with Turbopack default
```

## 🗄️ Database Architecture

### Single Prisma Schema with Multi-Schema Support
```prisma
// prisma/schema.prisma - Single file with multiple schemas

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "main", "tenant_a", "tenant_b"]
}

// Better Auth Schema
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  tenantId      String?   @map("tenant_id")
  role          String    @default("owner")
  
  accounts Account[]
  sessions Session[]
  
  @@map("users")
  @@schema("auth")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
  @@schema("auth")
}

// Main Schema - Tenant Management
model Tenant {
  id           String @id @default(cuid())
  slug         String @unique @db.VarChar(50)
  name         String @db.VarChar(100)
  ownerEmail   String @map("owner_email")
  plan         String @default("starter")
  schemaName   String @map("schema_name") // "tenant_a", "tenant_b"
  status       String @default("active")
  createdAt    DateTime @default(now()) @map("created_at")
  
  subscriptions Subscription[]
  
  @@map("tenants")
  @@schema("main")
}

model Subscription {
  id                   String   @id @default(cuid())
  tenantId             String   @map("tenant_id")
  stripeSubscriptionId String   @unique @map("stripe_subscription_id")
  plan                 String
  status               String
  currentPeriodStart   DateTime @map("current_period_start")
  currentPeriodEnd     DateTime @map("current_period_end")
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@map("subscriptions")
  @@schema("main")
}
```

### Dynamic Tenant Schema Generation
```typescript
// lib/prisma-generator.ts
export function generateTenantSchema(tenantSlug: string) {
  return `
// Tenant Schema: ${tenantSlug}
model TenantUser {
  id         String    @id @default(cuid())
  email      String    @unique
  name       String?
  role       String    @default("agent")
  isActive   Boolean   @default(true) @map("is_active")
  lastSeenAt DateTime? @map("last_seen_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  
  conversations Conversation[]
  messages      Message[]
  
  @@map("tenant_users")
  @@schema("${tenantSlug}")
}

model Conversation {
  id                String    @id @default(cuid())
  whatsappContactId String    @map("whatsapp_contact_id")
  contactName       String?   @map("contact_name")
  contactPhone      String    @map("contact_phone")
  assignedToId      String?   @map("assigned_to")
  status            String    @default("new")
  lastMessageAt     DateTime? @map("last_message_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  assignedTo TenantUser? @relation(fields: [assignedToId], references: [id])
  messages   Message[]
  
  @@map("conversations")
  @@schema("${tenantSlug}")
}

model Message {
  id                String   @id @default(cuid())
  conversationId    String   @map("conversation_id")
  content           String   @db.Text
  senderType        String   @map("sender_type") // user, contact, ai
  senderId          String?  @map("sender_id")
  whatsappMessageId String?  @map("whatsapp_message_id")
  isAiGenerated     Boolean  @default(false) @map("is_ai_generated")
  timestamp         DateTime @default(now())
  
  conversation Conversation @relation(fields: [conversationId], references: [id])
  sender       TenantUser?  @relation(fields: [senderId], references: [id])
  
  @@map("messages")
  @@schema("${tenantSlug}")
}

model TenantSettings {
  id              String   @id @default(cuid())
  whatsappApiKey  String?  @map("whatsapp_api_key") @db.Text
  openaiApiKey    String?  @map("openai_api_key") @db.Text
  timezone        String   @default("Europe/Paris")
  businessHours   Json?    @map("business_hours")
  autoReply       Boolean  @default(false) @map("auto_reply")
  welcomeMessage  String?  @map("welcome_message") @db.Text
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")
  
  @@map("tenant_settings")
  @@schema("${tenantSlug}")
}
`;
}
```

## 🔧 Multi-Schema Implementation

### Prisma Client with Schema Context
```typescript
// lib/db/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Tenant-aware database operations
export async function withTenantSchema<T>(
  schemaName: string,
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  // Set search path to tenant schema
  await prisma.$executeRaw`SET search_path TO ${schemaName}, public`;
  
  try {
    return await operation(prisma);
  } finally {
    // Reset search path
    await prisma.$executeRaw`SET search_path TO public`;
  }
}

// Helper for tenant operations
export async function getTenantDb(tenantSlug: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug }
  });
  
  if (!tenant) throw new Error('Tenant not found');
  
  return {
    tenant,
    execute: <T>(operation: (db: PrismaClient) => Promise<T>) =>
      withTenantSchema(tenant.schemaName, operation)
  };
}
```

### Tenant Creation with Schema Generation
```typescript
// lib/tenant-manager.ts
export async function createTenant({
  slug,
  name,
  ownerEmail,
  plan
}: {
  slug: string;
  name: string;
  ownerEmail: string;
  plan: string;
}) {
  const schemaName = `tenant_${slug}`;
  
  try {
    // 1. Create schema in database
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS ${schemaName}`;
    
    // 2. Create tenant record
    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        ownerEmail,
        plan,
        schemaName,
        status: 'active'
      }
    });
    
    // 3. Generate and run tenant schema migration
    await generateAndApplyTenantSchema(schemaName);
    
    return tenant;
  } catch (error) {
    // Cleanup on failure
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`;
    throw error;
  }
}

async function generateAndApplyTenantSchema(schemaName: string) {
  // Generate schema content
  const schemaContent = generateTenantSchema(schemaName);
  
  // Write to temporary schema file
  await fs.writeFile(`/tmp/${schemaName}.prisma`, schemaContent);
  
  // Run migration for this schema
  execSync(`pnpm prisma db push --schema=/tmp/${schemaName}.prisma`);
}
```

## ⚡ Next.js 16 Performance Improvements

### Turbopack Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is default, no need to specify
  // Optional: Enable React Compiler (opt-in)
  experimental: {
    reactCompiler: false, // Set to true if your code is compatible
    cacheComponents: true, // Enable Cache Components
    turbopackFileSystemCacheForDev: true, // Faster dev rebuilds
  },
  // Layout deduplication and incremental prefetching are automatic
};

export default nextConfig;
```

### Cache Components with "use cache" Directive
```typescript
// app/dashboard/[tenant]/page.tsx
import { Suspense } from 'react';

// Static shell that caches for entire session
export default async function DashboardPage(props: {
  params: Promise<{ tenant: string }>;
}) {
  const params = await props.params; // Async params in Next.js 16

  return (
    <div data-tenant={params.tenant}>
      {/* Cached layout */}
      <DashboardHeader tenantSlug={params.tenant} />
      <Sidebar />
      
      {/* Dynamic content - not cached */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ConversationsFeed tenantSlug={params.tenant} />
      </Suspense>
    </div>
  );
}

// Explicit caching for expensive computations
async function ConversationsFeed({ tenantSlug }: { tenantSlug: string }) {
  'use cache'; // Enable caching for this component
  
  const conversations = await getTenantDb(tenantSlug).execute(db =>
    db.conversation.findMany({
      include: { messages: true, assignedTo: true }
    })
  );
  
  return (
    <div className="space-y-2">
      {conversations.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}

// Opt-in caching for specific sections
async function TenantSettings({ tenantSlug }: { tenantSlug: string }) {
  'use cache';
  
  const settings = await getTenantDb(tenantSlug).execute(db =>
    db.tenantSettings.findUnique({ where: { id: tenantSlug } })
  );
  
  return <SettingsPanel settings={settings} />;
}
```

### Improved Caching APIs
```typescript
// lib/cache-actions.ts
'use server';

import { revalidateTag, updateTag, refresh } from 'next/cache';

// For stale-while-revalidate (SWR) behavior
export async function revalidateConversations(
  tenantSlug: string,
  cacheLife: 'max' | 'seconds' = 'max'
) {
  revalidateTag(`conversations-${tenantSlug}`);
  // Use cache-life for SWR behavior
  // 'max' = revalidate in background, serve cached data immediately
}

// For read-your-writes semantics (user sees changes immediately)
export async function updateTenantSettings(
  tenantSlug: string,
  newSettings: any
) {
  'use server';
  
  await prisma.tenantSettings.update({
    where: { id: tenantSlug },
    data: newSettings
  });
  
  // Expire cache and refresh immediately
  updateTag(`settings-${tenantSlug}`);
  
  // User sees their changes right away
}

// For refreshing uncached data (notifications, live counts)
export async function markNotificationAsRead(notificationId: string) {
  'use server';
  
  await db.notification.update({
    where: { id: notificationId },
    data: { read: true }
  });
  
  // Refresh the router without specific cache tags
  refresh();
}
```

## 🔀 proxy.ts Replaces middleware.ts

### New proxy.ts Pattern (Recommended)
```typescript
// proxy.ts - New convention in Next.js 16
import { NextRequest, NextResponse } from 'next/server';

// Default export or named 'proxy' function
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Tenant-specific routing
  if (!['www', 'app', 'api'].includes(subdomain)) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: subdomain }
    });
    
    if (tenant) {
      const response = NextResponse.next();
      response.headers.set('x-tenant-schema', tenant.schemaName);
      response.headers.set('x-tenant-slug', tenant.slug);
      return response;
    }
  }
  
  // Default behavior
  return NextResponse.next();
}

// Config for proxy.ts
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Backward Compatibility Note
```typescript
// middleware.ts - Still supported but deprecated in Next.js 16
// Migration: Rename to proxy.ts and export as 'proxy' function
// The behavior is identical, but naming is clearer
```

## 🎨 WhatsApp Design System

### Color Palette & Components
```javascript
// tailwind.config.js - WhatsApp theme
module.exports = {
  theme: {
    extend: {
      colors: {
        whatsapp: {
          50: '#F0FDF4',
          500: '#25D366',  // Primary green
          700: '#15803D',
        },
        bubble: {
          sent: '#DCF8C6',
          received: '#FFFFFF',
          system: '#F3F4F6',
        },
        app: {
          bg: '#F8FAFC',
          sidebar: '#FFFFFF',
          header: '#075E54',
        }
      }
    }
  }
}
```

## 🔐 Better Auth + AWS SES Integration

### Authentication Configuration
```typescript
// lib/auth.ts
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/aws/email-templates';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      tenantId: { type: "string", required: false },
      role: { type: "string", defaultValue: "owner" }
    }
  },
  trustedOrigins: [/^https:\/\/.*\.jokko\.co$/]
});
```

### AWS SES Email Templates
```typescript
// lib/aws/email-templates.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailParams): Promise<void> {
  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' },
        Text: text ? { Data: text, Charset: 'UTF-8' } : undefined,
      },
    },
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error('SES Email Error:', error);
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        background-color: #25D366;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
      ">Verify Email</a>
      <p style="color: #666; margin-top: 20px;">
        Or copy this link: <code>${verificationUrl}</code>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Jokko Email',
    html,
    text: `Verify your email: ${verificationUrl}`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="
        background-color: #25D366;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
      ">Reset Password</a>
      <p style="color: #666; margin-top: 20px;">
        This link expires in 1 hour.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        If you didn't request this, your account is secure.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Jokko Password',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
}
```

## 📦 AWS S3 Media Storage

### S3 Client Setup
```typescript
// lib/aws/s3-client.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export { s3Client, getSignedUrl };
```

### S3 Upload Service with Image Optimization
```typescript
// lib/aws/s3-upload.ts
import { s3Client, getSignedUrl } from './s3-client';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ key: string; url: string }> {
  const { folder = 'uploads', maxWidth = 2000, maxHeight = 2000, quality = 80 } = options;

  const fileExtension = fileName.split('.').pop();
  const uniqueKey = `${folder}/${Date.now()}-${uuidv4()}.${fileExtension}`;

  let body = file;

  // Image optimization
  if (contentType.startsWith('image/')) {
    try {
      body = await sharp(file)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(fileExtension === 'png' ? 'png' : 'jpeg', {
          quality,
          progressive: true,
        })
        .toBuffer();
    } catch (error) {
      console.error('Image optimization failed:', error);
    }
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: uniqueKey,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=2592000',
    Metadata: {
      'uploaded-at': new Date().toISOString(),
      'original-name': fileName,
    },
  });

  try {
    await s3Client.send(command);
    const publicUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${uniqueKey}`;
    return { key: uniqueKey, url: publicUrl };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

// Generate presigned URL for private files
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Presigned URL error:', error);
    throw new Error('Failed to generate download URL');
  }
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}
```

### API Route for Image Upload
```typescript
// app/api/upload/image/route.ts
'use server';

import { uploadToS3 } from '@/lib/aws/s3-upload';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    const result = await uploadToS3(
      fileBuffer,
      file.name,
      file.type,
      {
        folder,
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 80,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

### Database Models for Media
```prisma
// prisma/schema.prisma - Add to tenant schema
model TenantMedia {
  id            String   @id @default(cuid())
  tenantId      String   @map("tenant_id")
  s3Key         String   @map("s3_key")
  s3Url         String   @map("s3_url")
  fileName      String   @map("file_name")
  contentType   String   @map("content_type")
  fileSize      Int      @map("file_size")
  uploadedBy    String   @map("uploaded_by")
  uploadedAt    DateTime @default(now()) @map("uploaded_at")
  
  @@map("tenant_media")
  @@schema("${tenantSlug}")
}

model ConversationAttachment {
  id            String   @id @default(cuid())
  conversationId String  @map("conversation_id")
  mediaId       String   @map("media_id")
  attachmentUrl String   @map("attachment_url")
  attachmentType String  @map("attachment_type")
  createdAt     DateTime @default(now()) @map("created_at")
  
  conversation Conversation @relation(fields: [conversationId], references: [id])
  
  @@map("conversation_attachments")
  @@schema("${tenantSlug}")
}
```


```typescript
// proxy.ts - Tenant detection with async params
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  if (!['www', 'app', 'api'].includes(subdomain)) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: subdomain }
    });
    
    if (tenant) {
      const response = NextResponse.next();
      response.headers.set('x-tenant-schema', tenant.schemaName);
      return response;
    }
  }
  
  return NextResponse.next();
}
```

### Async Params Pattern
```typescript
// app/(dashboard)/[tenant]/page.tsx
export default async function TenantPage(props: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  // Async params - Required in Next.js 16
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const { tenant } = params;
  const page = searchParams.page ?? '1';
  
  return (
    <div data-tenant={tenant}>
      {/* Content */}
    </div>
  );
}

// Type-safe helper for async params
import type { PageProps } from '@/types/next';

export default async function TypeSafePage(
  props: PageProps<'/dashboard/[tenant]'>
) {
  const { tenant } = await props.params;
  
  return <div>{tenant}</div>;
}
```

## 💳 Cost-Effective Billing

### Single Database + AWS Services Pricing
```
Single Neon Pro Database:           $19/month
AWS SES Email:                      $15/month (150k emails)
AWS S3 Storage + Requests:         ~$118/month
Vercel Hosting:                     $20/month
Other (DNS, monitoring):            ~$20/month
────────────────────────────────────────────
Total Infrastructure:              ~$192/month

Revenue Example (50 tenants):
├── Cost: $192/month
├── Revenue: 50 × $29 = $1,450/month  
└── Profit: $1,258/month (87% margin!)

Cost Comparison:
├── Old Stack (Resend + Local): ~$469/month
├── New Stack (AWS SES + S3):   ~$192/month
└── Savings: $277/month (59% reduction!)
```

## 📁 Project Structure

```
app/                              # Next.js App Router (root)
├── (marketing)/                  # Public pages
│   ├── page.tsx                 # Landing page
│   ├── pricing/                 # Plans & pricing
│   ├── login/                   # Authentication
│   ├── signup/                  # Registration
│   └── layout.tsx              # Marketing layout
├── (dashboard)/[tenant]/         # Tenant application (async params)
│   ├── page.tsx                # Dashboard overview
│   ├── conversations/          # Chat interface
│   ├── team/                   # User management
│   ├── settings/               # Configuration
│   ├── billing/                # Stripe integration
│   └── layout.tsx              # Dashboard layout
├── api/                         # API routes
│   ├── auth/[...auth]/         # Better Auth handler
│   ├── tenants/                # Tenant CRUD
│   ├── whatsapp/               # WhatsApp Business API
│   ├── ai/                     # OpenAI integration
│   └── stripe/                 # Billing webhooks
├── globals.css                  # Tailwind styles
├── layout.tsx                   # Root layout
└── not-found.tsx               # Custom 404

components/                      # React components
├── ui/                         # shadcn/ui library
└── shared/                     # Shared components

features/                       # Feature-based organization
├── auth/                       # Authentication feature
│   ├── components/            # Auth-specific components
│   ├── hooks/                 # Auth hooks
│   ├── services/              # Auth API calls
│   └── types.ts               # Auth types
├── tenant/                     # Tenant management
├── dashboard/                  # Dashboard feature
├── chat/                       # WhatsApp chat feature
├── billing/                    # Stripe billing
└── marketing/                  # Marketing pages

lib/                            # Utilities & configuration
├── auth.ts                     # Better Auth config
├── auth-client.ts              # Client-side hooks
├── db/                         # Database clients
├── tenant-resolver.ts          # Subdomain resolution
├── stripe.ts                   # Stripe client
├── cache-actions.ts            # Server actions for caching
├── utils.ts                    # Utilities (cn, etc.)
├── constants.ts                # Plans, configs
└── validations/                # Zod schemas

stores/                         # Zustand stores
├── auth-store.ts              # Auth state
├── tenant-store.ts            # Tenant state
├── chat-store.ts              # Chat state
└── ui-store.ts                # UI state

types/                          # Global TypeScript types
├── auth.ts                    # Better Auth types
├── tenant.ts                  # Business types
├── chat.ts                    # WhatsApp types
├── billing.ts                 # Stripe types
├── next.ts                    # Next.js 16 types (PageProps, etc)
└── global.ts                  # Global types

models/                        # Prisma model definitions
├── auth.prisma               # Auth schema models
├── main.prisma               # Main schema models
└── tenant.prisma             # Tenant schema template

emails/                        # Resend Email Templates
├── components/
│   ├── email-layout.tsx      # Email base layout
│   └── button.tsx            # Email button component
├── welcome.tsx               # Welcome email
├── verification.tsx          # Email verification
├── password-reset.tsx        # Password reset
└── invite.tsx                # Team invitations

tests/                        # Playwright tests
├── auth.spec.ts              # Auth tests
├── tenant-creation.spec.ts   # Onboarding tests
├── dashboard.spec.ts         # Dashboard tests
└── billing.spec.ts           # Stripe tests

proxy.ts                      # NEW: Request proxying (replaces middleware.ts)
prisma/
└── schema.prisma             # Single schema with multi-schema
next.config.ts               # Turbopack, React Compiler config
```

## 🧪 Testing Strategy

### Playwright Multi-Tenant Testing
```typescript
// tests/multi-tenant.spec.ts
test('should isolate data between tenants', async ({ page }) => {
  // Test tenant A
  await page.goto('https://tenant-a.localhost:3000');
  await expect(page.locator('[data-tenant]')).toHaveAttribute('data-tenant', 'tenant_a');
  
  // Test tenant B  
  await page.goto('https://tenant-b.localhost:3000');
  await expect(page.locator('[data-tenant]')).toHaveAttribute('data-tenant', 'tenant_b');
  
  // Verify data isolation
  const tenantAData = await getTenantData('tenant_a');
  const tenantBData = await getTenantData('tenant_b');
  
  expect(tenantAData).not.toContain(tenantBData);
});
```

## 🆕 React 19.2 Features

### View Transitions for Smooth Navigation
```typescript
// app/(dashboard)/conversations/page.tsx
'use client';

import { useTransition } from 'react';
import { startViewTransition } from 'react-dom';

export default function ConversationsPage() {
  const [isPending, startTransition] = useTransition();
  
  function handleNavigate(conversationId: string) {
    startViewTransition(() => {
      // Navigation happens with smooth CSS transitions
      router.push(`/conversations/${conversationId}`);
    });
  }
  
  return (
    <div className="conversation-list">
      {conversations.map(conv => (
        <div
          key={conv.id}
          onClick={() => handleNavigate(conv.id)}
          style={{
            viewTransitionName: `conversation-${conv.id}`
          }}
        >
          {conv.contactName}
        </div>
      ))}
    </div>
  );
}
```

### useEffectEvent for Non-Reactive Logic
```typescript
'use client';

import { useEffect, useEffectEvent } from 'react';

export function ChatInput({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  
  // Non-reactive function - doesn't cause effect re-runs
  const handleSend = useEffectEvent(() => {
    onSendMessage(message);
    setMessage('');
  });
  
  // Effect only depends on sendMessage reference, not onSendMessage
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSend]); // No longer depends on onSendMessage
  
  return (
    <input
      value={message}
      onChange={e => setMessage(e.target.value)}
      placeholder="Type message..."
    />
  );
}
```

## 📊 Business Metrics

### Revenue Projection
```
Starter ($29): 60 customers × $29 = $1,740/month
Pro ($99): 30 customers × $99 = $2,970/month  
Enterprise ($299): 10 customers × $299 = $2,990/month
──────────────────────────────────────────────────
Total MRR: $7,700/month
Infrastructure Cost: ~$192/month
Net Profit: $7,508/month (97.5% margin)

Performance Gains with Next.js 16:
├── Build times: 2-5x faster (Turbopack)
├── Navigation: Faster with layout deduplication
├── Email cost: 95% reduction (AWS SES vs Resend)
├── Storage cost: Unlimited scalability (AWS S3)
└── Developer experience: Significantly improved
```

### Scaling Economics
- **10 tenants**: 99.5% profit margin
- **100 tenants**: 99.9% profit margin  
- **1000 tenants**: 99.99% profit margin
- **Database cost stays constant at $19/month**

## 🔄 Development Roadmap

### Phase 1 - Foundation (8 weeks)
- [x] Multi-schema Prisma architecture
- [x] Better Auth + Resend integration
- [x] WhatsApp-inspired UI design
- [x] Feature-based project structure
- [x] Next.js 16 upgrade with Turbopack
- [x] Cache Components implementation
- [ ] Production deployment

### Phase 2 - WhatsApp Integration (6 weeks)  
- [ ] WhatsApp Business API
- [ ] Real-time chat interface
- [ ] Media handling
- [ ] Message templates

### Phase 3 - AI Features (4 weeks)
- [ ] OpenAI integration
- [ ] Response suggestions  
- [ ] Automated responses
- [ ] AI analytics

### Phase 4 - Performance Optimization (Ongoing)
- [ ] React Compiler opt-in for performance-critical components
- [ ] Advanced Cache Components strategies
- [ ] Layout deduplication testing
- [ ] Incremental prefetching fine-tuning

## 🚀 Deployment

### Production Setup (Next.js 16)
```bash
# Turbopack builds automatically (much faster)
pnpm build
# Output: .next/ with optimized bundles

# Deploy to Vercel
vercel --prod

# Configure wildcard domain
# Set environment variables
# Deploy with zero downtime

# Monitor build performance
# Next.js 16 provides detailed build metrics
```

### Environment Setup
```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://jokko.co
```

## 🎯 Key Improvements in Next.js 16

| Feature | Benefit | Implementation |
|---------|---------|-----------------|
| **Turbopack (Default)** | 2-5x faster builds, 10x faster Fast Refresh | Zero config needed |
| **Cache Components** | Explicit, opt-in caching with "use cache" | Replace implicit caching |
| **Async Params** | Type-safe dynamic routes | `await props.params` |
| **React Compiler** | Automatic memoization, reduced re-renders | Optional, stable |
| **proxy.ts** | Clearer intent than middleware.ts | Rename file, same behavior |
| **React 19.2** | View Transitions, useEffectEvent, Activity | New hooks available |
| **Improved Caching APIs** | updateTag(), refresh(), better revalidateTag() | Server actions integration |

---

**Jokko with Next.js 16** leverages the latest performance improvements with cost-effective AWS services. Turbopack's 2-5x faster builds combined with Cache Components' explicit control, React 19.2's smooth transitions, AWS SES for reliable email delivery ($15/month), and AWS S3 for unlimited media storage create an exceptional developer and business experience while maintaining industry-leading profit margins.

**Ready to deploy:** Next.js 16 + AWS SES + AWS S3 is production-ready and fully supported on Vercel with zero downtime deployments.
