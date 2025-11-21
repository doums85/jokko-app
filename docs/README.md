# Documentation Jokko

Bienvenue dans la documentation du projet Jokko. Ce dossier contient toutes les informations nécessaires pour initialiser, configurer et utiliser les différentes fonctionnalités de l'application.

## Table des matières

### Configuration

- [Configuration AWS (S3 & SES)](./AWS_SETUP.md) - Guide complet pour configurer AWS S3 et AWS SES
  - Configuration d'un bucket S3
  - Vérification de domaine SES
  - Configuration IAM et permissions
  - Variables d'environnement requises

### Fonctionnalités

- [Réinitialisation de mot de passe](./PASSWORD_RESET.md) - Implémentation complète du flux de reset
  - Architecture et flux utilisateur
  - API routes et validation
  - Emails avec React Email
  - Sécurité et bonnes pratiques

## Structure du projet

```
jokko/
├── app/                    # Application Next.js (App Router)
│   ├── api/               # API routes
│   │   └── auth/         # Routes d'authentification
│   ├── dashboard/        # Dashboard utilisateur
│   ├── login/            # Page de connexion
│   ├── signup/           # Page d'inscription
│   ├── forgot-password/  # Demande de reset
│   └── reset-password/   # Réinitialisation
├── lib/                   # Bibliothèques et utilitaires
│   ├── aws/              # Configuration AWS (S3, SES)
│   ├── auth.ts           # Configuration Better-auth
│   ├── auth-client.ts    # Client auth
│   └── prisma.ts         # Configuration Prisma
├── emails/                # Templates React Email
│   └── password-reset.tsx
├── prisma/                # Configuration base de données
│   ├── models/           # Schémas modulaires
│   │   ├── auth.prisma
│   │   └── organization.prisma
│   └── seed.ts           # Données de test
├── tests/                 # Tests
│   ├── e2e/              # Tests Playwright
│   └── unit/             # Tests Vitest
└── docs/                  # Documentation (vous êtes ici!)
```

## Technologies utilisées

### Frontend
- **Next.js 16**: Framework React
- **TailwindCSS 4**: Styling
- **React Hook Form**: Gestion des formulaires
- **Zod**: Validation de schémas

### Backend
- **Better-auth**: Authentification
- **Prisma**: ORM et gestion de la base de données
- **PostgreSQL**: Base de données (multi-schema)

### AWS Services
- **S3**: Stockage de fichiers
- **SES**: Envoi d'emails

### Testing
- **Vitest**: Tests unitaires
- **Playwright**: Tests E2E

### Package Manager
- **pnpm**: Gestionnaire de paquets

## Quick Start

### 1. Installation

```bash
# Cloner le repo
git clone <repo-url>
cd jokko

# Installer les dépendances
pnpm install
```

### 2. Configuration de l'environnement

Créez un fichier `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=jokko-uploads-dev
SES_FROM_EMAIL=noreply@example.com
SES_FROM_NAME=Jokko

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de données

```bash
# Push le schéma
pnpm prisma db push

# Générer le client
pnpm prisma generate

# Seed (optionnel)
pnpm db:seed
```

### 4. Démarrage

```bash
# Développement
pnpm dev

# Production
pnpm build
pnpm start
```

## Scripts disponibles

```bash
# Développement
pnpm dev                 # Démarrer le serveur de dev

# Build
pnpm build              # Build pour production
pnpm start              # Démarrer en production

# Tests
pnpm test               # Tests unitaires (Vitest)
pnpm test:e2e           # Tests E2E (Playwright)
pnpm test:all           # Tous les tests

# Database
pnpm db:seed            # Populate la DB avec des données de test
npx prisma studio       # Interface graphique pour la DB
npx prisma db push      # Push les changements de schéma

# Linting
pnpm lint               # ESLint
```

## Architecture

### Multi-tenancy

L'application utilise une architecture multi-tenant avec:
- **Organizations**: Entités principales (tenants)
- **Memberships**: Relation User <-> Organization avec rôles
- **Rôles**: OWNER, ADMIN, MANAGER, MEMBER

### Authentification

- **Better-auth** avec provider credential
- Signup automatique d'organisation
- Sessions gérées par Better-auth
- Reset de mot de passe via email

### Base de données

Schémas PostgreSQL séparés:
- `auth`: Users, Accounts, Sessions, Tokens
- `organization`: Organizations, Memberships

## Guides de configuration

Pour configurer des fonctionnalités spécifiques, consultez:

1. **AWS S3 et SES**: [AWS_SETUP.md](./AWS_SETUP.md)
   - Indispensable pour l'envoi d'emails et le stockage de fichiers

2. **Reset de mot de passe**: [PASSWORD_RESET.md](./PASSWORD_RESET.md)
   - Fonctionnalité complète avec emails

## Sécurité

### Bonnes pratiques implémentées

- Mots de passe hashés avec bcrypt (10 rounds)
- Tokens sécurisés avec crypto.randomBytes
- Protection contre l'énumération d'emails
- Tokens à usage unique et expirables
- Validation côté client ET serveur
- Variables d'environnement jamais committées

### À implémenter

- Rate limiting sur les API routes
- 2FA (Two-Factor Authentication)
- CSRF protection
- Security headers
- Audit logs

## Support et contribution

### Problèmes courants

1. **Erreurs de compilation TypeScript**
   ```bash
   pnpm prisma generate
   ```

2. **Problèmes de connexion DB**
   - Vérifiez `DATABASE_URL` dans `.env.local`
   - Testez avec `npx prisma studio`

3. **Emails non reçus**
   - Consultez [AWS_SETUP.md](./AWS_SETUP.md#dépannage)
   - Vérifiez les logs de l'application

### Contribuer

1. Créez une branche feature
2. Implémentez vos changements
3. Ajoutez des tests
4. Mettez à jour la documentation
5. Créez une Pull Request

## Ressources externes

- [Next.js Documentation](https://nextjs.org/docs)
- [Better-auth Documentation](https://better-auth.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [React Email](https://react.email)

## Changelog

### Version 1.1.0 (En cours)
- AWS S3 integration
- AWS SES integration
- Password reset feature
- React Email templates
- Documentation complète

### Version 1.0.0
- Multi-tenant authentication
- Organization management
- Better-auth integration
- Prisma multi-schema
- Tests E2E et unitaires
- Migration vers pnpm
