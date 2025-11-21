import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReactEmail } from "@/lib/aws/ses";
import { PasswordResetEmail } from "@/emails/password-reset";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Un email de réinitialisation a été envoyé à votre adresse",
      });
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendReactEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      react: PasswordResetEmail({
        userName: user.name,
        resetLink,
        expiresIn: 1,
      }),
    });

    return NextResponse.json({
      message: "Un email de réinitialisation a été envoyé à votre adresse",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
