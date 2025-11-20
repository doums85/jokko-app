# Tests - Résumé et Documentation

## Vue d'ensemble

Le projet inclut deux types de tests :
1. **Tests Unitaires** (Vitest) - Tests des fonctions utilitaires
2. **Tests E2E** (Playwright) - Tests d'intégration du flow complet

## Tests Unitaires (Vitest) ✅

**Statut : TOUS LES TESTS PASSENT (11/11)**

### Fichiers de test :
- `tests/unit/slugify.test.ts`

### Ce qui est testé :
- Génération de slugs à partir de noms d'organisation
- Conversion en minuscules
- Remplacement des espaces par des tirets
- Suppression des caractères spéciaux
- Génération de slugs uniques avec suffixes aléatoires

### Exécution :
```bash
npm run test          # Run en mode watch
npm run test -- --run # Run une seule fois
npm run test:ui       # Interface UI
```

### Résultats :
```
✓ tests/unit/slugify.test.ts (11 tests) 3ms

Test Files  1 passed (1)
     Tests  11 passed (11)
```

## Tests E2E (Playwright) ⚠️

**Statut : 2/5 PASSENT**

### Fichiers de test :
- `tests/e2e/signup-simple.spec.ts`
- `tests/e2e/auth-flow.spec.ts`

### Tests qui PASSENT ✅ :

1. **Validation d'erreurs de formulaire** (`signup-simple.spec.ts`)
   - Vérifie que les erreurs de validation s'affichent pour un formulaire vide
   - Teste les messages d'erreur pour nom, email, mot de passe, organisation

2. **Erreur de mot de passe invalide** (`auth-flow.spec.ts`)
   - Vérifie qu'un mauvais mot de passe affiche une erreur
   - Teste que l'utilisateur reste sur la page de login

### Tests qui ÉCHOUENT ❌ :

3. **Flow d'inscription complet** (`signup-simple.spec.ts`)
   - **Problème** : Better-auth n'arrive pas à créer l'utilisateur
   - **Cause** : Prisma Client ne s'initialise pas correctement dans le contexte du serveur Next.js
   - **Erreur** : `Cannot read properties of undefined (reading '__internal')`

4. **Login et logout** (`auth-flow.spec.ts`)
   - **Problème** : Dépend de la création d'utilisateur qui échoue
   - **Cause** : Même problème Prisma

5. **Redirection des utilisateurs authentifiés** (`auth-flow.spec.ts`)
   - **Problème** : Dépend de la création d'utilisateur qui échoue
   - **Cause** : Même problème Prisma

### Problème Principal : Prisma Client

L'erreur provient de `lib/auth.ts` qui importe Prisma dans un contexte où le client n'est pas correctement initialisé. Ceci est lié à l'architecture de Turbopack et Next.js 16.

### Solutions Potentielles :

1. **Utiliser un vrai PostgreSQL** au lieu de Prisma Postgres local
2. **Downgrade vers Next.js 15** où Prisma fonctionne mieux
3. **Utiliser un adaptateur différent** pour Better-auth
4. **Attendre un fix** de Prisma pour Next.js 16 + Turbopack

### Exécution :
```bash
npm run test:e2e        # Run tous les tests E2E
npm run test:e2e:ui     # Interface UI Playwright
```

## Structure des Tests

```
tests/
├── e2e/
│   ├── auth-flow.spec.ts       # Tests de login/logout/redirections
│   └── signup-simple.spec.ts    # Tests d'inscription
├── helpers/
│   └── cleanup.ts               # Helper pour nettoyer les données de test
└── unit/
    └── slugify.test.ts          # Tests des fonctions de slug

app/api/test/
└── cleanup/
    └── route.ts                 # API endpoint pour cleanup (dev only)
```

## Tests Manuels Recommandés

En attendant la résolution du problème Prisma, voici comment tester manuellement le flow complet :

1. **Inscription** :
   ```
   1. Aller sur http://localhost:3001/signup
   2. Remplir : Nom, Email, Nom d'organisation, Mot de passe
   3. Cliquer "Créer mon compte"
   4. Vérifier redirection vers /dashboard
   5. Vérifier que l'organisation apparaît avec rôle OWNER
   ```

2. **Login** :
   ```
   1. Se déconnecter
   2. Aller sur http://localhost:3001/login
   3. Entrer email et mot de passe
   4. Vérifier redirection vers /dashboard
   ```

3. **Middleware** :
   ```
   1. Sans être connecté, essayer d'accéder à /dashboard
   2. Vérifier redirection vers /login avec callbackUrl
   3. Connecté, essayer d'accéder à /login ou /signup
   4. Vérifier redirection vers /dashboard
   ```

## Commandes Utiles

```bash
# Tests unitaires
npm run test              # Vitest en mode watch
npm run test -- --run     # Vitest run unique
npm run test:ui           # Vitest UI

# Tests E2E
npm run test:e2e          # Playwright
npm run test:e2e:ui       # Playwright UI

# Tous les tests
npm run test:all          # Vitest + Playwright
```

## Métriques

- **Tests Unitaires** : 11/11 (100%) ✅
- **Tests E2E** : 2/5 (40%) ⚠️
- **Coverage Total** : ~60%

## Prochaines Étapes

1. ✅ Tests unitaires pour slugify - **FAIT**
2. ✅ Tests E2E pour validation de formulaires - **FAIT**
3. ⚠️ Résoudre le problème Prisma Client
4. ⏳ Tests E2E pour le flow complet d'inscription
5. ⏳ Tests E2E pour login/logout
6. ⏳ Tests pour la création d'organisation en database
7. ⏳ Tests pour les rôles OWNER/ADMIN/MEMBER
