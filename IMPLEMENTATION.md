# Implémentation Multi-Tenant avec Création Automatique d'Organisation

## Vue d'ensemble

Cette application Next.js implémente un système d'authentification multi-tenant où chaque utilisateur qui s'inscrit crée automatiquement sa propre organisation avec le rôle de **propriétaire/administrateur (OWNER)**.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Base de données**: PostgreSQL avec Prisma 7
- **Authentification**: Better-auth
- **Validation**: Zod + React Hook Form
- **Styling**: Tailwind CSS

## Architecture de la Base de Données

### Modèles Principaux

1. **User** - Les utilisateurs de la plateforme
   - id, name, email, emailVerified, image
   - Relations: accounts, sessions, memberships

2. **Organization** - Les organisations/tenants
   - id, name, slug (unique), description, logo
   - Relations: memberships

3. **Membership** - Table de jonction User ↔ Organization
   - id, role (OWNER/ADMIN/MEMBER), userId, organizationId
   - Contrainte unique: un utilisateur ne peut avoir qu'un seul rôle par organisation

4. **Account** & **Session** - Gestion d'authentification Better-auth

### Énumérations

- **MemberRole**: OWNER, ADMIN, MEMBER

## Workflow d'Inscription

### 1. Formulaire d'Inscription (`/signup`)

L'utilisateur remplit 4 champs :
- Nom complet
- Email
- **Nom de l'organisation** (champ unique pour multi-tenant)
- Mot de passe

### 2. Processus Backend (Hook Better-auth)

Quand Better-auth crée un utilisateur via `/sign-up/email`, un hook `after` est déclenché dans `lib/auth.ts` qui :

1. Récupère le nom d'organisation depuis le corps de la requête
2. Génère un slug unique à partir du nom (ex: "Acme Inc" → "acme-inc")
3. Vérifie l'unicité du slug (ajoute un suffixe aléatoire si collision)
4. Crée l'organisation et le membership en **transaction atomique** :
   ```typescript
   await prisma.$transaction(async (tx) => {
     const organization = await tx.organization.create({...});
     await tx.membership.create({
       userId: user.id,
       organizationId: organization.id,
       role: "OWNER", // Propriétaire automatique
     });
   });
   ```

### 3. Connexion Automatique

Après inscription réussie, l'utilisateur est automatiquement connecté et redirigé vers `/dashboard`.

## Fichiers Clés

### Configuration Auth & DB
- `lib/auth.ts` - Configuration Better-auth avec hook de création d'organisation
- `lib/prisma.ts` - Client Prisma singleton
- `lib/auth-client.ts` - Client Better-auth côté client
- `lib/utils/slugify.ts` - Utilitaires de génération de slug

### API Routes
- `app/api/auth/[...all]/route.ts` - Routes d'authentification Better-auth
- `app/api/organizations/route.ts` - Récupération des organisations de l'utilisateur

### Pages
- `app/page.tsx` - Page d'accueil (landing)
- `app/signup/page.tsx` - Formulaire d'inscription
- `app/login/page.tsx` - Formulaire de connexion
- `app/dashboard/page.tsx` - Dashboard utilisateur avec liste des organisations

### Middleware
- `middleware.ts` - Protection des routes et redirections

## Sécurité

### Protection des Routes
Le middleware protège les routes sensibles :
- `/dashboard` → Accessible uniquement si authentifié
- `/login`, `/signup` → Redirige vers `/dashboard` si déjà connecté

### Transactions Atomiques
La création d'organisation utilise des transactions Prisma pour garantir la cohérence :
- Si la création d'organisation échoue, le membership n'est pas créé
- Pas d'état incohérent dans la base de données

### Validation
- Validation côté client avec Zod
- Validation des emails
- Mots de passe minimum 8 caractères
- Noms d'organisation minimum 2 caractères

## Variables d'Environnement

```bash
# Base de données
DATABASE_URL="prisma+postgres://..."

# Better-auth
BETTER_AUTH_SECRET="your-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3001"
```

## Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer la base de données locale
npx prisma dev

# Générer le client Prisma
npx prisma generate

# Lancer le serveur de développement
npm run dev
```

Accédez à l'application sur http://localhost:3001

## Améliorations Futures

1. **Vérification d'email** - Activer `requireEmailVerification: true`
2. **Invitation de membres** - Permettre aux OWNER d'inviter d'autres utilisateurs
3. **Gestion des rôles** - Interface pour promouvoir/rétrograder les membres
4. **Multi-organisations** - Permettre à un utilisateur de rejoindre plusieurs organisations
5. **Slug personnalisé** - Permettre à l'utilisateur de personnaliser le slug
6. **Logo d'organisation** - Upload et gestion des logos
7. **Paramètres d'organisation** - Page de configuration complète

## Notes Techniques

- Le slug est automatiquement généré et géré par le système
- Un utilisateur peut être OWNER de plusieurs organisations
- La transaction atomique garantit qu'aucun utilisateur ne reste sans organisation
- Better-auth gère automatiquement le hachage des mots de passe et les sessions
