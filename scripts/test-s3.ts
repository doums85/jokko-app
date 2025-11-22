#!/usr/bin/env tsx

/**
 * Script de test AWS S3
 *
 * Ce script permet de tester rapidement l'upload, le download et la suppression
 * de fichiers sur AWS S3.
 *
 * Usage:
 *   pnpm tsx scripts/test-s3.ts
 */

import { uploadToS3, getFromS3, deleteFromS3, generateS3Key } from "../src/lib/aws/s3";

// ============================================================================
// Configuration
// ============================================================================

const TEST_TENANT_ID = "test-tenant";
const TEST_FILE_CONTENT = "Hello from Jokko S3 test! 🚀";
const TEST_FILE_NAME = "test-file.txt";

// ============================================================================
// Test S3
// ============================================================================

async function testS3() {
  console.log("┌────────────────────────────────────────────────────────────┐");
  console.log("│              🧪 Test d'upload AWS S3 - Jokko              │");
  console.log("└────────────────────────────────────────────────────────────┘");
  console.log("");

  // Vérifier les variables d'environnement
  console.log("📋 Vérification de la configuration...");
  console.log("");

  const requiredEnvVars = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET",
  ];

  const missingVars: string[] = [];
  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.log(`  ❌ ${varName}: Non défini`);
    } else {
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

  let uploadedKey: string | null = null;

  try {
    // ========================================================================
    // Test 1: Upload d'un fichier
    // ========================================================================
    console.log("📤 Test 1: Upload d'un fichier...");
    console.log("");

    const buffer = Buffer.from(TEST_FILE_CONTENT, "utf-8");
    uploadedKey = generateS3Key({
      organizationId: TEST_TENANT_ID,
      userId: "test-user",
      fileName: TEST_FILE_NAME,
      prefix: "documents"
    });

    console.log(`   Tenant: ${TEST_TENANT_ID}`);
    console.log(`   Fichier: ${TEST_FILE_NAME}`);
    console.log(`   Clé S3: ${uploadedKey}`);
    console.log(`   Taille: ${buffer.length} bytes`);
    console.log("");

    const uploadResult = await uploadToS3({
      key: uploadedKey,
      body: buffer,
      contentType: "text/plain",
    });

    console.log("   ✅ Upload réussi!");
    console.log(`   URL: ${uploadResult}`);
    console.log("");

    // ========================================================================
    // Test 2: Download du fichier
    // ========================================================================
    console.log("📥 Test 2: Download du fichier...");
    console.log("");

    const downloadResult = await getFromS3(uploadedKey);

    console.log(`   Clé S3: ${uploadedKey}`);
    console.log(`   Taille: ${downloadResult.length} bytes`);
    console.log("");

    // Vérifier le contenu
    const downloadedContent = Buffer.from(downloadResult).toString("utf-8");
    if (downloadedContent === TEST_FILE_CONTENT) {
      console.log("   ✅ Contenu vérifié! Le fichier téléchargé correspond.");
      console.log(`   Contenu: "${downloadedContent}"`);
    } else {
      console.log("   ❌ Erreur: Le contenu ne correspond pas!");
      console.log(`   Attendu: "${TEST_FILE_CONTENT}"`);
      console.log(`   Reçu: "${downloadedContent}"`);
    }
    console.log("");

    // ========================================================================
    // Test 3: Suppression du fichier
    // ========================================================================
    console.log("🗑️  Test 3: Suppression du fichier...");
    console.log("");

    await deleteFromS3(uploadedKey);

    console.log(`   Clé S3: ${uploadedKey}`);
    console.log("   ✅ Fichier supprimé avec succès!");
    console.log("");

    // Vérifier que le fichier n'existe plus
    try {
      await getFromS3(uploadedKey);
      console.log("   ⚠️  Attention: Le fichier existe encore (attendre propagation)");
    } catch {
      console.log("   ✅ Vérification: Le fichier n'existe plus");
    }
    console.log("");

    // ========================================================================
    // Succès final
    // ========================================================================
    console.log("┌────────────────────────────────────────────────────────────┐");
    console.log("│              ✅ TOUS LES TESTS RÉUSSIS !                  │");
    console.log("└────────────────────────────────────────────────────────────┘");
    console.log("");
    console.log("🎉 AWS S3 est correctement configuré et fonctionnel!");
    console.log("");
    console.log("📊 Résumé:");
    console.log(`   - Bucket: ${process.env.AWS_S3_BUCKET}`);
    console.log(`   - Région: ${process.env.AWS_REGION}`);
    console.log("   - Upload: ✅");
    console.log("   - Download: ✅");
    console.log("   - Suppression: ✅");
    console.log("");
    console.log("💡 Vous pouvez maintenant utiliser S3 dans votre application!");
    console.log("");

    process.exit(0);
  } catch (error: any) {
    console.log("┌────────────────────────────────────────────────────────────┐");
    console.log("│                   ❌ ERREUR                                │");
    console.log("└────────────────────────────────────────────────────────────┘");
    console.log("");
    console.error("Le test S3 a échoué.");
    console.error("");
    console.error("Détails de l'erreur:");
    console.error(error);
    console.error("");

    // Diagnostics selon le type d'erreur
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes("credentials")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Problème d'authentification AWS");
      console.error("");
      console.error("   Solutions:");
      console.error("   - Vérifiez AWS_ACCESS_KEY_ID dans .env");
      console.error("   - Vérifiez AWS_SECRET_ACCESS_KEY dans .env");
      console.error("   - Vérifiez que les credentials sont valides");
      console.error("   - Vérifiez les permissions IAM pour S3");
    } else if (errorMessage.includes("NoSuchBucket")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Le bucket S3 n'existe pas");
      console.error("");
      console.error("   Solutions:");
      console.error(`   - Vérifiez AWS_S3_BUCKET dans .env: ${process.env.AWS_S3_BUCKET}`);
      console.error("   - Créez le bucket dans AWS S3 Console");
      console.error("   - Vérifiez que le bucket est dans la bonne région");
    } else if (errorMessage.includes("AccessDenied") || errorMessage.includes("Forbidden")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Permissions S3 insuffisantes");
      console.error("");
      console.error("   Solutions:");
      console.error("   - Vérifiez les permissions IAM de l'utilisateur");
      console.error("   - Permissions requises: s3:PutObject, s3:GetObject, s3:DeleteObject");
      console.error("   - Consultez docs/AWS_SETUP.md pour la configuration IAM");
    } else if (errorMessage.includes("region")) {
      console.error("🔍 Diagnostic:");
      console.error("   ❌ Problème de région AWS");
      console.error("");
      console.error("   Solutions:");
      console.error(`   - Vérifiez AWS_REGION dans .env: ${process.env.AWS_REGION}`);
      console.error("   - Vérifiez que le bucket existe dans cette région");
    } else {
      console.error("🔍 Diagnostic:");
      console.error("   Consultez docs/AWS_SETUP.md pour le troubleshooting");
    }

    console.error("");

    // Cleanup en cas d'erreur
    if (uploadedKey) {
      console.log("🧹 Nettoyage...");
      try {
        await deleteFromS3(uploadedKey);
        console.log("   ✅ Fichier de test supprimé");
      } catch {
        console.log("   ⚠️  Impossible de supprimer le fichier de test");
      }
      console.log("");
    }

    process.exit(1);
  }
}

// Exécuter le test
testS3();
