# Configuration AWS (S3 & SES)

Ce document explique comment configurer AWS S3 et AWS SES pour votre application.

## Prérequis

- Un compte AWS actif
- AWS CLI installé (optionnel mais recommandé)
- Accès à la console AWS

## Table des matières

1. [Configuration AWS S3](#configuration-aws-s3)
2. [Configuration AWS SES](#configuration-aws-ses)
3. [Configuration IAM](#configuration-iam)
4. [Variables d'environnement](#variables-denvironnement)

---

## Configuration AWS S3

### 1. Créer un bucket S3

1. Connectez-vous à la [Console AWS S3](https://console.aws.amazon.com/s3/)
2. Cliquez sur "Create bucket"
3. Configurez le bucket:
   - **Bucket name**: `jokko-uploads-{env}` (exemple: `jokko-uploads-production`)
   - **Region**: Choisissez votre région (ex: `eu-west-1` pour l'Europe)
   - **Block Public Access**: Gardez tous les blocs activés (recommandé)
4. Cliquez sur "Create bucket"

### 2. Configurer CORS (si nécessaire)

Si vous prévoyez d'uploader depuis le navigateur:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://votre-domaine.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Configuration du cycle de vie (optionnel)

Pour supprimer automatiquement les fichiers temporaires:

1. Allez dans l'onglet "Management" du bucket
2. Créez une règle de cycle de vie
3. Configurez selon vos besoins (ex: supprimer après 30 jours)

---

## Configuration AWS SES

### 1. Vérifier votre domaine

1. Connectez-vous à la [Console AWS SES](https://console.aws.amazon.com/ses/)
2. Allez dans "Verified identities"
3. Cliquez sur "Create identity"
4. Sélectionnez "Domain"
5. Entrez votre domaine (ex: `example.com`)
6. Activez "DKIM signatures"
7. Ajoutez les enregistrements DNS fournis à votre DNS

### 2. Vérifier une adresse email (pour le développement)

1. Dans "Verified identities", cliquez sur "Create identity"
2. Sélectionnez "Email address"
3. Entrez votre email de test
4. Confirmez via l'email reçu

### 3. Sortir du Sandbox (production uniquement)

Par défaut, SES est en mode "Sandbox" (envoi limité aux emails vérifiés).

Pour la production:
1. Allez dans "Account dashboard" de SES
2. Cliquez sur "Request production access"
3. Remplissez le formulaire avec:
   - Use case description
   - Website URL
   - Compliance info
4. Attendez l'approbation (généralement 24h)

### 4. Configurer les templates (optionnel)

```bash
# Créer un template via AWS CLI
aws ses create-template --cli-input-json file://email-template.json
```

Exemple de template (`email-template.json`):
```json
{
  "Template": {
    "TemplateName": "PasswordReset",
    "SubjectPart": "Réinitialisation de votre mot de passe",
    "HtmlPart": "<h1>Bonjour {{userName}}</h1><p>Cliquez ici: {{resetLink}}</p>",
    "TextPart": "Bonjour {{userName}}\n\nCliquez ici: {{resetLink}}"
  }
}
```

---

## Configuration IAM

### 1. Créer un utilisateur IAM

1. Allez dans [IAM Console](https://console.aws.amazon.com/iam/)
2. Cliquez sur "Users" > "Create user"
3. Nom d'utilisateur: `jokko-app-user`
4. Type d'accès: "Programmatic access"
5. Attachez les permissions (voir ci-dessous)

### 2. Créer une politique personnalisée

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::jokko-uploads-*",
        "arn:aws:s3:::jokko-uploads-*/*"
      ]
    },
    {
      "Sid": "SESAccess",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:SendTemplatedEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Créer les Access Keys

1. Sélectionnez l'utilisateur créé
2. Allez dans "Security credentials"
3. Cliquez sur "Create access key"
4. Choisissez "Application running outside AWS"
5. **IMPORTANT**: Sauvegardez les clés immédiatement (elles ne seront plus visibles)

---

## Variables d'environnement

Ajoutez ces variables à votre fichier `.env`:

```bash
# AWS Configuration
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# S3 Configuration
AWS_S3_BUCKET=jokko-uploads-production

# SES Configuration
SES_FROM_EMAIL=noreply@example.com
SES_FROM_NAME=Jokko

# Application URL (pour les liens dans les emails)
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Sécurité des variables

**Développement**:
- Stockez dans `.env.local` (exclu de Git)

**Production**:
- Utilisez les variables d'environnement de votre plateforme (Vercel, AWS, etc.)
- Ne committez JAMAIS les clés dans Git

---

## Test de la configuration

### Tester S3

```typescript
import { uploadToS3 } from "@/lib/aws/s3";

const testS3 = async () => {
  const result = await uploadToS3({
    key: "test/hello.txt",
    body: "Hello World",
    contentType: "text/plain",
  });
  console.log("Uploaded to:", result);
};
```

### Tester SES

```typescript
import { sendEmail } from "@/lib/aws/ses";

const testSES = async () => {
  await sendEmail({
    to: "test@example.com",
    subject: "Test Email",
    html: "<h1>Hello from SES</h1>",
  });
  console.log("Email sent!");
};
```

---

## Dépannage

### Erreur: "Access Denied" (S3)
- Vérifiez que le bucket existe
- Vérifiez les permissions IAM
- Vérifiez la région configurée

### Erreur: "MessageRejected" (SES)
- Vérifiez que l'email From est vérifié
- Si en Sandbox: vérifiez que l'email To est vérifié
- Vérifiez les quotas SES (50 emails/jour en Sandbox)

### Erreur: "InvalidClientTokenId"
- Vérifiez AWS_ACCESS_KEY_ID
- Vérifiez AWS_SECRET_ACCESS_KEY
- Assurez-vous que les clés sont valides

---

## Bonnes pratiques

1. **Utilisez des utilisateurs IAM séparés** par environnement (dev, staging, prod)
2. **Rotation des clés**: Changez les access keys tous les 90 jours
3. **Monitoring**: Activez CloudWatch pour surveiller les erreurs
4. **Quotas SES**: Demandez une augmentation si nécessaire
5. **S3 Lifecycle**: Configurez pour supprimer les fichiers temporaires
6. **Encryption**: Activez le chiffrement côté serveur pour S3

---

## Ressources

- [Documentation AWS S3](https://docs.aws.amazon.com/s3/)
- [Documentation AWS SES](https://docs.aws.amazon.com/ses/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
