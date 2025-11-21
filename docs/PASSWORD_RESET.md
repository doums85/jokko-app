# Fonctionnalité de Réinitialisation de Mot de Passe

Ce document explique comment fonctionne la réinitialisation de mot de passe avec AWS SES et React Email.

## Architecture

```
User -> Forgot Password Page -> API Route -> Generate Token -> Save to DB
                                                                      |
                                                                      v
                                                             Send Email (SES)
                                                                      |
                                                                      v
User <- Reset Password Page <- Click Link <- Receive Email <---------+
      |
      v
API Route -> Validate Token -> Update Password -> Mark Token as Used
```

## Composants

### 1. Base de données

**Table**: `password_reset_tokens`
- `id`: Identifiant unique
- `token`: Token unique (32 bytes en hexadécimal)
- `userId`: Référence à l'utilisateur
- `expires`: Date d'expiration (1h par défaut)
- `used`: Boolean indiquant si le token a été utilisé
- `createdAt`: Date de création

### 2. API Routes

#### `/api/auth/forgot-password`
**Méthode**: POST

**Body**:
```json
{
  "email": "user@example.com"
}
```

**Processus**:
1. Recherche l'utilisateur par email
2. Génère un token sécurisé (32 bytes random)
3. Sauvegarde le token en base avec une expiration d'1h
4. Envoie un email via SES avec le lien de réinitialisation
5. Retourne toujours un succès (protection contre l'énumération d'emails)

**Response**:
```json
{
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

#### `/api/auth/reset-password`
**Méthode**: POST

**Body**:
```json
{
  "token": "abc123...",
  "password": "nouveauMotDePasse123!"
}
```

**Processus**:
1. Valide le token (existe, pas expiré, pas utilisé)
2. Hash le nouveau mot de passe (bcrypt, 10 rounds)
3. Met à jour le mot de passe de l'utilisateur
4. Marque le token comme utilisé
5. Retourne le succès

**Response**:
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

### 3. Pages Frontend

#### `/forgot-password`
- Formulaire avec champ email
- Appelle l'API `/api/auth/forgot-password`
- Affiche un message de confirmation
- Lien de retour vers la page de connexion

#### `/reset-password?token=xxx`
- Formulaire avec deux champs: nouveau mot de passe et confirmation
- Valide que les mots de passe correspondent
- Valide la force du mot de passe (min 8 caractères)
- Appelle l'API `/api/auth/reset-password`
- Redirige vers `/login` après succès

### 4. Email Template

**Fichier**: `emails/password-reset.tsx`

**Props**:
- `userName`: Nom de l'utilisateur
- `resetLink`: Lien de réinitialisation complet
- `expiresIn`: Durée de validité en heures (défaut: 1)

**Style**:
- Responsive
- Compatible avec tous les clients email
- Design moderne et professionnel
- Lien cliquable et copié-collable

## Flux Utilisateur

1. **Demande de réinitialisation**:
   - L'utilisateur clique sur "Mot de passe oublié" sur la page de connexion
   - Entre son email
   - Soumet le formulaire

2. **Réception de l'email**:
   - L'utilisateur reçoit un email de réinitialisation
   - L'email contient un bouton et un lien de secours
   - L'email est valide pendant 1h

3. **Réinitialisation**:
   - L'utilisateur clique sur le lien
   - Est redirigé vers la page de réinitialisation
   - Entre son nouveau mot de passe (2 fois)
   - Soumet le formulaire

4. **Confirmation**:
   - Le mot de passe est mis à jour
   - L'utilisateur est redirigé vers la page de connexion
   - Peut se connecter avec son nouveau mot de passe

## Sécurité

### 1. Protection contre les attaques

**Énumération d'emails**:
- Même réponse que l'email existe ou non
- Évite de révéler quels emails sont dans le système

**Brute Force**:
- Les tokens sont générés avec `crypto.randomBytes(32)`
- 2^256 possibilités, impossible à deviner

**Replay Attacks**:
- Les tokens sont marqués comme "utilisés"
- Un token ne peut être utilisé qu'une seule fois

**Expiration**:
- Les tokens expirent après 1h
- Les tokens expirés ne peuvent pas être utilisés

### 2. Validation du mot de passe

**Côté client**:
- Minimum 8 caractères
- Les deux champs doivent correspondre

**Côté serveur**:
- Minimum 8 caractères
- Hash avec bcrypt (10 rounds)

**Recommandations futures**:
- Ajouter des exigences de complexité (majuscules, chiffres, caractères spéciaux)
- Vérifier contre les mots de passe communs
- Implémenter zxcvbn pour mesurer la force

### 3. Rate Limiting

**Recommandé** (à implémenter):
```typescript
// Limiter les demandes de réinitialisation par email
// Max 3 demandes par heure par email
// Max 10 demandes par heure par IP
```

## Configuration

### Variables d'environnement requises

```bash
# AWS SES
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SES_FROM_EMAIL=noreply@example.com
SES_FROM_NAME=Jokko

# Application
NEXT_PUBLIC_APP_URL=https://app.example.com

# Database
DATABASE_URL=...
```

### Personnalisation

**Durée d'expiration du token**:
```typescript
// Dans /api/auth/forgot-password/route.ts
const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
// Modifier selon vos besoins (ex: 30 min = 30 * 60 * 1000)
```

**Template d'email**:
```typescript
// Dans emails/password-reset.tsx
// Personnalisez les styles et le contenu
```

## Tests

### Test manuel

1. **Demander un reset**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Vérifier la base de données**:
   ```sql
   SELECT * FROM auth.password_reset_tokens
   WHERE "userId" = 'user_id'
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```

3. **Tester le reset**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token":"token_from_db",
       "password":"NewPassword123!"
     }'
   ```

### Test automatisé

Créer un test E2E avec Playwright:
```typescript
test("password reset flow", async ({ page }) => {
  // 1. Demander le reset
  await page.goto("/forgot-password");
  await page.fill('input[name="email"]', "test@example.com");
  await page.click('button[type="submit"]');

  // 2. Récupérer le token en DB (test only)
  const token = await getLatestResetToken("test@example.com");

  // 3. Utiliser le lien de reset
  await page.goto(`/reset-password?token=${token}`);
  await page.fill('input[name="password"]', "NewPass123!");
  await page.fill('input[name="confirmPassword"]', "NewPass123!");
  await page.click('button[type="submit"]');

  // 4. Vérifier la redirection
  await expect(page).toHaveURL("/login");
});
```

## Dépannage

### L'email n'est pas reçu

1. **Vérifiez SES**:
   - L'email From est vérifié
   - Si en Sandbox: l'email To est vérifié
   - Pas de quota dépassé

2. **Vérifiez les logs**:
   ```bash
   # Logs de l'application
   pnpm dev
   # Cherchez les erreurs SES
   ```

3. **Vérifiez le spam**:
   - L'email peut être dans les spams
   - Ajoutez SPF/DKIM/DMARC pour améliorer la délivrabilité

### Le token est invalide

1. **Vérifiez l'expiration**:
   ```sql
   SELECT expires, used, NOW()
   FROM auth.password_reset_tokens
   WHERE token = 'xxx';
   ```

2. **Vérifiez le token**:
   - Le token dans l'URL correspond au token en DB
   - Le token n'a pas été modifié

### Le mot de passe n'est pas mis à jour

1. **Vérifiez le compte**:
   ```sql
   SELECT * FROM auth.accounts
   WHERE "userId" = 'xxx'
   AND "providerId" = 'credential';
   ```

2. **Vérifiez le hash**:
   - Le mot de passe doit être hashé avec bcrypt
   - Longueur du hash: 60 caractères

## Améliorations futures

1. **Rate Limiting**: Limiter les demandes par IP/email
2. **Notification de changement**: Email quand le mot de passe change
3. **Historique**: Garder un historique des changements de mot de passe
4. **2FA**: Ajouter une vérification 2FA avant le reset
5. **Questions de sécurité**: Option alternative au reset par email
6. **Analytics**: Tracker les tentatives de reset (succès/échecs)
7. **Blocage temporaire**: Bloquer après X tentatives échouées
8. **Nettoyage automatique**: Supprimer les tokens expirés (cron job)

## Ressources

- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [React Email Documentation](https://react.email)
- [AWS SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
