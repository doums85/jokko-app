import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Only allow in development
if (process.env.NODE_ENV === "production") {
  throw new Error("Test cleanup endpoint should not be available in production");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          select: { organizationId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete in correct order to respect foreign key constraints
    // 1. Delete memberships
    await prisma.membership.deleteMany({
      where: { userId: user.id },
    });

    // 2. Delete organizations (only if no other members)
    for (const membership of user.memberships) {
      const otherMembers = await prisma.membership.count({
        where: { organizationId: membership.organizationId },
      });

      if (otherMembers === 0) {
        await prisma.organization.delete({
          where: { id: membership.organizationId },
        }).catch(() => {
          // Organization might already be deleted
        });
      }
    }

    // 3. Delete accounts
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });

    // 4. Delete sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // 5. Finally delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: "Cleanup successful" });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
