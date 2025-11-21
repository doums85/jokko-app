#!/usr/bin/env tsx

/**
 * Script de test AWS SES
 *
 * Ce script permet de tester rapidement l'envoi d'emails via AWS SES
 * avec le template React Email du mot de passe oublié.
 *
 * Usage:
 *   pnpm tsx scripts/test-ses.ts votre-email@exemple.com
 *
 * Ou modifier directement TEST_EMAIL dans le code ci-dessous.
 */

import { sendReactEmail } from "../lib/aws/ses";
import { PasswordResetEmail } from "../emails/password-reset";

// ============================================================================
// Configuration
// ============================================================================

// MODIFIEZ CET EMAIL POUR VOS TESTS
const TEST_EMAIL = process.argv[2] || "votre-email@exemple.com";

const TEST_DATA = {
  userName: "Test User",
  resetLink: "http://localhost:3000/reset-password?token=test-token-abc123xyz",
  expiresIn: 1, // heure
};

// ============================================================================
// Test SES
// ============================================================================

async function testSES() {
  console.log("┌────────────────────────────────────────────────────────────┐");
  console.log("│             🧪 Test d'envoi AWS SES - Jokko              │");
  console.log("└────────────────────────────────────────────────────────────┘");
  console.log("");

  // Vérifier les variables d'environnement
  console.log("📋 Vérification de la configuration...");
  console.log("");

  const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "SES_FROM_EMAIL",
  ];

  const missingVars: string[] = [];
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.log(`  ❌ ${varName}: Non défini`);
    } else {
      // Masquer les credentials pour la sécurité
      const displayValue =
        varName.includes("KEY") || varName.includes("SECRET")
          ? value.substring(0, 8) + "***"
          : value;
      console.log(`  ✅ ${varName}: ${displayValue}`);
    }
  });

  console.log("");

  if (missingVars.length > 0) {
    console.error("❌ Variables d'environnement manquantes:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("");
    console.error("💡 Vérifiez votre fichier .env");
    process.exit(1);
  }

  // Vérifier l'email de destination
  if (TEST_EMAIL === "votre-email@exemple.com") {
    console.error("⚠️  ATTENTION: Vous devez modifier TEST_EMAIL dans le script");
    console.error("");
    console.error("   Option 1: Modifier la constante TEST_EMAIL dans le code");
    console.error("   Option 2: Passer l'email en argument:");
    console.error("   $ pnpm tsx scripts/test-ses.ts mon-email@exemple.com");
    console.error("");
    process.exit(1);
  }

  console.log("📧 Email de destination:", TEST_EMAIL);
  console.log("");

  // Avertissement mode Sandbox
  console.log("⚠️  NOTE IMPORTANTE:");
  console.log("   Si SES est en mode Sandbox, l'email destinataire doit être vérifié");
  console.log("   dans AWS SES Console avant de recevoir des emails.");
  console.log("");

  console.log("🚀 Envoi de l'email de test...");
  console.log("");

  try {
    await sendReactEmail({
      to: TEST_EMAIL,
      subject: "Test - Réinitialisation de mot de passe Jokko",
      react: PasswordResetEmail({
        userName: TEST_DATA.userName,
        resetLink: TEST_DATA.resetLink,
        expiresIn: TEST_DATA.expiresIn,
      }),
    });

    console.log("┌────────────────────────────────────────────────────────────┐");
    console.log("│                   ✅ SUCCÈS !                              │");
    console.log("└────────────────────────────────────────────────────────────┘");
    console.log("");
    console.log("L'email a été envoyé avec succès !");
    console.log("");
    console.log("📧 Destinataire:", TEST_EMAIL);
    console.log("📨 Sujet: Test - Réinitialisation de mot de passe Jokko");
    console.log("");
    console.log("🔍 Vérifications à faire:");
    console.log("   1. Ouvrez votre boîte mail");
    console.log("   2. Vérifiez le dossier Spam/Courrier indésirable");
    console.log("   3. Vérifiez le design de l'email:");
    console.log("      - Header noir avec logo 'JOKKO'");
    console.log("      - Bouton noir 'Réinitialiser mon mot de passe'");
    console.log("      - Info box avec ⏱️ et 🔒");
    console.log("      - Footer avec lien et copyright");
    console.log("   4. Testez le bouton (devrait ouvrir localhost:3000)");
    console.log("");
    console.log("💡 Si vous ne recevez pas l'email:");
    console.log("   - Vérifiez que l'email est vérifié dans SES (mode Sandbox)");
    console.log("   - Consultez tasks/AWS_VERIFICATION.md pour le troubleshooting");
    console.log("   - Vérifiez les logs AWS SES Console");
    console.log("");

    process.exit(0);
  } catch (error: any) {
    console.log("┌────────────────────────────────────────────────────────────┐");
    console.log("│                   ❌ ERREUR                                │");
    console.log("└────────────────────────────────────────────────────────────┘");
    console.log("");
    console.error("L'envoi de l'email a échoué.");
    console.error("");
    console.error("Détails de l'erreur:");
    console.error(error);
    console.error("");

    // Diagnostics selon le type d'erreur
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes("MessageRejected")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ AWS SES a rejeté le message");
      console.error("");
      console.error("   Causes possibles:");
      console.error("   1. Email destinataire non vérifié (mode Sandbox)");
      console.error("   2. Email sur la suppression list (bounce/complaint)");
      console.error("   3. Format d'email invalide");
      console.error("");
      console.error("   Solutions:");
      console.error("   - Vérifiez l'email dans AWS SES Console");
      console.error("   - Demandez la sortie du mode Sandbox");
      console.error("   - Consultez tasks/AWS_VERIFICATION.md");
    } else if (errorMessage.includes("credentials")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Problème d'authentification AWS");
      console.error("");
      console.error("   Solutions:");
      console.error("   - Vérifiez AWS_ACCESS_KEY_ID dans .env");
      console.error("   - Vérifiez AWS_SECRET_ACCESS_KEY dans .env");
      console.error("   - Vérifiez que les credentials sont valides dans AWS Console");
      console.error("   - Redémarrez le serveur après modification .env");
    } else if (errorMessage.includes("region")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Problème de région AWS");
      console.error("");
      console.error("   Solutions:");
      console.error("   - Vérifiez AWS_REGION dans .env (actuellement: eu-central-1)");
      console.error("   - Vérifiez que l'email est vérifié dans cette région");
    } else {
      console.error("🔍 Diagnostic:");
      console.error("   Consultez docs/AWS_SETUP.md pour le troubleshooting");
      console.error("   ou tasks/AWS_VERIFICATION.md pour plus d'aide");
    }

    console.error("");
    process.exit(1);
  }
}

// Exécuter le test
testSES();
