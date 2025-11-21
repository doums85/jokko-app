# 📋 Tâches Jokko

Ce dossier contient toutes les tâches de vérification, configuration et tests pour le projet Jokko.

## 🗂️ Fichiers de tâches

### 1. [AWS_VERIFICATION.md](./AWS_VERIFICATION.md)
**Statut**: ⚠️ À vérifier et tester
**Priorité**: 🔴 HAUTE

Configuration et vérification complète d'AWS SES et S3 pour la fonctionnalité de mot de passe oublié.

**Contenu**:
- Configuration AWS SES (vérification email/domaine)
- Sortie du mode Sandbox SES
- Variables d'environnement AWS
- Tests du flux complet de réinitialisation de mot de passe
- Tests de sécurité (tokens, expiration, etc.)
- Monitoring et troubleshooting

**Actions requises**:
1. Vérifier l'email `noreply@jokko.co` dans AWS SES Console
2. Configurer les variables d'environnement (déjà fait ✅)
3. Tester l'envoi d'email avec `pnpm tsx scripts/test-ses.ts`
4. Tester le flux complet de mot de passe oublié
5. Vérifier tous les tests de sécurité

---

### 2. [PASSWORD_RESET_SETUP.md](./PASSWORD_RESET_SETUP.md)
**Statut**: ⚠️ Configuration et tests requis
**Priorité**: 🔴 HAUTE

Guide détaillé pour configurer et tester la fonctionnalité complète de mot de passe oublié.

**Contenu**:
- Configuration AWS SES étape par étape
- Configuration des variables d'environnement
- Mise à jour de la base de données
- Tests fonctionnels détaillés
- Tests de sécurité approfondis
- Troubleshooting des problèmes courants

**Checklist complète incluse** avec tous les items à vérifier.

---

## 🚀 Quick Start

### Étape 1: Configuration AWS
```bash
# Les variables AWS sont déjà configurées dans .env
# Vérifiez-les:
cat .env | grep AWS
```

**Variables configurées** ✅:
- `AWS_REGION=eu-central-1`
- `AWS_ACCESS_KEY_ID=AKIAQOI5F3WOT6GF3KU6`
- `AWS_SECRET_ACCESS_KEY=***` (masqué)
- `AWS_S3_BUCKET=jokko-dev-media`
- `AWS_SES_CONFIGURATION_SET=email-marketing`
- `SES_FROM_EMAIL=noreply@jokko.co`

### Étape 2: Vérifier l'email dans SES
1. Aller sur [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Région: **eu-central-1** (Frankfurt)
3. Menu: **Verified identities**
4. Vérifier que `noreply@jokko.co` ou `jokko.co` est vérifié

### Étape 3: Mettre à jour la base de données
```bash
# Pousser le nouveau schéma (PasswordResetToken)
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate
```

### Étape 4: Tester l'envoi d'email
```bash
# Test AWS SES
pnpm tsx scripts/test-ses.ts votre-email@exemple.com

# Test AWS S3 (optionnel)
pnpm tsx scripts/test-s3.ts
```

### Étape 5: Tester le flux complet
```bash
# Démarrer le serveur
pnpm dev

# Puis ouvrir:
# http://localhost:3000/forgot-password
```

---

## 📂 Scripts de test disponibles

### `scripts/test-ses.ts`
Test rapide de l'envoi d'emails via AWS SES avec le template React Email.

**Usage**:
```bash
# Option 1: Passer l'email en argument
pnpm tsx scripts/test-ses.ts votre-email@exemple.com

# Option 2: Modifier TEST_EMAIL dans le fichier
```

**Vérifications**:
- ✅ Variables d'environnement AWS
- ✅ Connexion SES
- ✅ Envoi d'email de test
- ✅ Template React Email

---

### `scripts/test-s3.ts`
Test complet des opérations S3 (upload, download, delete).

**Usage**:
```bash
pnpm tsx scripts/test-s3.ts
```

**Tests effectués**:
- ✅ Upload d'un fichier texte
- ✅ Download et vérification du contenu
- ✅ Suppression du fichier
- ✅ Vérification des permissions

---

## 📖 Documentation connexe

- **[docs/AWS_SETUP.md](../docs/AWS_SETUP.md)**: Guide complet de configuration AWS S3 et SES
- **[docs/PASSWORD_RESET.md](../docs/PASSWORD_RESET.md)**: Architecture et documentation de la fonctionnalité
- **[docs/README.md](../docs/README.md)**: Hub principal de documentation

---

## ✅ Progression globale

### Configuration AWS
- [x] Variables d'environnement configurées dans `.env`
- [ ] Email vérifié dans AWS SES Console
- [ ] Mode Sandbox vérifié (ou demande de production soumise)
- [ ] Test d'envoi d'email réussi

### Base de données
- [ ] Schéma mis à jour avec `pnpm prisma db push`
- [ ] Client Prisma régénéré avec `pnpm prisma generate`
- [ ] Table `PasswordResetToken` vérifiée dans Prisma Studio

### Tests fonctionnels
- [ ] Test script `test-ses.ts` réussi
- [ ] Test script `test-s3.ts` réussi (optionnel)
- [ ] Flux complet testé (demande → email → reset → connexion)
- [ ] Design de l'email vérifié sur plusieurs clients

### Tests de sécurité
- [ ] Token expiré
- [ ] Token déjà utilisé
- [ ] Token invalide
- [ ] Email inexistant
- [ ] Validation mot de passe

---

## 🐛 Problèmes courants

### Email non reçu
**Causes**:
1. Email non vérifié dans SES (mode Sandbox)
2. Email dans le dossier spam
3. Credentials AWS invalides

**Solutions**:
- Consultez `AWS_VERIFICATION.md` section "Troubleshooting"
- Vérifiez les logs de l'application
- Vérifiez AWS SES Console → Reputation metrics

---

### Erreur "Token invalide"
**Causes**:
1. Client Prisma non régénéré
2. Schéma non poussé à la DB

**Solutions**:
```bash
pnpm prisma generate
pnpm prisma db push
```

---

### Erreur AWS "MessageRejected"
**Causes**:
1. Email non vérifié (mode Sandbox)
2. Email sur la suppression list

**Solutions**:
- Vérifiez l'identité dans SES Console
- Demandez la sortie du mode Sandbox

---

## 🔐 Sécurité

⚠️ **IMPORTANT**:
- Ne jamais commit les credentials AWS dans git
- Le fichier `.env` est dans `.gitignore`
- Utiliser des variables différentes en production
- Rotation des credentials régulière

---

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation dans `docs/`
2. Vérifiez les logs de l'application
3. Consultez AWS SES/S3 Console
4. Référez-vous aux sections Troubleshooting

---

**Dernière mise à jour**: {{DATE}}
**Projet**: Jokko - WhatsApp Business SaaS
**Stack**: Next.js 16 + AWS SES/S3 + Prisma
