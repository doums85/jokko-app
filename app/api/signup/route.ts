import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify, generateUniqueSlug } from "@/lib/utils/slugify";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      let text = await request.text();
      // Fix escaped characters that shouldn't be escaped in JSON
      // This handles the issue where ! gets escaped to \! somewhere in the pipeline
      text = text.replace(/\\!/g, '!');
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('[Signup] JSON parse error:', parseError);
      throw parseError;
    }
    const { name, email, password, organizationName } = body;

    // Validate required fields
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use better-auth's internal API to create the user with proper password hashing
    // We'll make a server-side call to better-auth's signup endpoint
    const signupRequest = new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const signupResponse = await auth.handler(signupRequest);
    const signupData = await signupResponse.json();

    if (!signupResponse.ok ||  !signupData.user) {
      return NextResponse.json(
        { error: signupData.error || "Failed to create user" },
        { status: signupResponse.status }
      );
    }

    const user = signupData.user;

    // Now create the organization and membership
    try {
      let slug = slugify(organizationName);
      const existingOrg = await prisma.organization.findUnique({
        where: { slug },
      });

      if (existingOrg) {
        slug = generateUniqueSlug(slug);
      }

      await prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            slug,
          },
        });

        await tx.membership.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: "OWNER",
          },
        });
      });
    } catch (orgError) {
      console.error("Organization creation error:", orgError);
      // User was created but organization failed
      // In production, you might want to clean up or retry
    }

    // Return the same response and headers as better-auth (including session cookies)
    return new NextResponse(JSON.stringify(signupData), {
      status: signupResponse.status,
      headers: signupResponse.headers,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
