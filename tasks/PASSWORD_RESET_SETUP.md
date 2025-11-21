# Tâches : Configuration et vérification du mot de passe oublié

## ✅ À vérifier et configurer

### 1. Configuration AWS SES (Priorité HAUTE)

#### 1.1 Vérifier l'email d'envoi
- [ ] Aller sur [AWS SES Console](https://console.aws.amazon.com/ses/)
- [ ] Vérifier que l'email `SES_FROM_EMAIL` est vérifié dans SES
- [ ] Si en mode Sandbox, vérifier aussi les emails de destination pour les tests
- [ ] **Note** : En sandbox, vous ne pouvez envoyer qu'à des emails vérifiés

#### 1.2 Demander la sortie du mode Sandbox (Production)
- [ ] Dans SES Console → Account dashboard → Request production access
- [ ] Remplir le formulaire de demande
- [ ] Attendre l'approbation AWS (24-48h généralement)
- [ ] **Important** : Sans cela, vous ne pourrez pas envoyer à des emails non vérifiés

#### 1.3 Vérifier les credentials AWS
- [ ] S'assurer que `AWS_ACCESS_KEY_ID` est dans `.env.local`
- [ ] S'assurer que `AWS_SECRET_ACCESS_KEY` est dans `.env.local`
- [ ] S'assurer que `AWS_REGION` correspond à votre région SES
- [ ] Vérifier que l'utilisateur IAM a les permissions SES nécessaires

### 2. Variables d'environnement à configurer

Vérifier que votre fichier `.env.local` contient :

```bash
# AWS Configuration
AWS_REGION=eu-west-1  # ou votre région
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxx

# SES Configuration
SES_FROM_EMAIL=noreply@votredomaine.com
SES_FROM_NAME=Jokko

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou votre URL de production

# Database (déjà configuré normalement)
DATABASE_URL=postgresql://...

# Better Auth (déjà configuré normalement)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

**Action requise** :
- [ ] Copier `.env.local` en créant un backup si nécessaire
- [ ] Ajouter/vérifier toutes les variables AWS
- [ ] Redémarrer le serveur de développement après modification

### 3. Base de données

#### 3.1 Appliquer le schéma mis à jour
```bash
# Pousser le nouveau schéma avec le modèle PasswordResetToken
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate
```

**Actions** :
- [ ] Exécuter `pnpm prisma db push`
- [ ] Exécuter `pnpm prisma generate`
- [ ] Vérifier qu'il n'y a pas d'erreurs

#### 3.2 Vérifier le schéma dans la base
```bash
# Ouvrir Prisma Studio pour vérifier
npx prisma studio
```

- [ ] Vérifier que la table `password_reset_tokens` existe dans le schéma `auth`
- [ ] Vérifier les colonnes : id, token, userId, expires, used, createdAt

### 4. Tests fonctionnels

#### 4.1 Test en environnement de développement

**Pré-requis** :
- [ ] Serveur de dev lancé : `pnpm dev`
- [ ] Base de données accessible
- [ ] AWS SES configuré et email vérifié

**Test du flux complet** :

1. **Page de demande de reset** :
   - [ ] Aller sur http://localhost:3000/forgot-password
   - [ ] Entrer un email existant dans la DB
   - [ ] Cliquer sur "Envoyer le lien"
   - [ ] Vérifier le message de succès

2. **Vérifier l'email reçu** :
   - [ ] Ouvrir votre boîte mail
   - [ ] Vérifier la réception de l'email
   - [ ] Vérifier le design (header noir, bouton, infos de sécurité)
   - [ ] Vérifier que le lien fonctionne

3. **Page de réinitialisation** :
   - [ ] Cliquer sur le lien dans l'email
   - [ ] Vérifier l'affichage de la page `/reset-password?token=...`
   - [ ] Entrer un nouveau mot de passe (min 8 caractères)
   - [ ] Confirmer le mot de passe
   - [ ] Cliquer sur "Réinitialiser le mot de passe"
   - [ ] Vérifier le message de succès
   - [ ] Vérifier la redirection vers `/login`

4. **Test de connexion** :
   - [ ] Aller sur http://localhost:3000/login
   - [ ] Se connecter avec le nouveau mot de passe
   - [ ] Vérifier que la connexion fonctionne

#### 4.2 Tests de sécurité

**Token expiré** :
- [ ] Attendre 1 heure après avoir demandé un reset
- [ ] Essayer d'utiliser le lien
- [ ] Vérifier le message d'erreur "Token expiré"

**Token déjà utilisé** :
- [ ] Demander un nouveau reset
- [ ] Utiliser le lien une première fois
- [ ] Réessayer d'utiliser le même lien
- [ ] Vérifier le message d'erreur "Token déjà utilisé"

**Token invalide** :
- [ ] Modifier manuellement le token dans l'URL
- [ ] Vérifier le message d'erreur "Token invalide"

**Email inexistant** :
- [ ] Demander un reset pour un email qui n'existe pas
- [ ] Vérifier que le message de succès s'affiche quand même (sécurité anti-énumération)
- [ ] Vérifier qu'aucun email n'est envoyé

**Validation mot de passe** :
- [ ] Essayer un mot de passe < 8 caractères
- [ ] Vérifier le message d'erreur
- [ ] Essayer des mots de passe qui ne correspondent pas
- [ ] Vérifier le message d'erreur "Les mots de passe ne correspondent pas"

### 5. Logs et debugging

**En cas de problème, vérifier** :

#### 5.1 Logs de l'application
```bash
# Dans le terminal où tourne `pnpm dev`
# Vérifier les erreurs lors de l'envoi d'email
```

- [ ] Vérifier les logs de l'API `/api/auth/forgot-password`
- [ ] Vérifier les logs de l'API `/api/auth/reset-password`
- [ ] Noter les erreurs éventuelles

#### 5.2 Vérifier les tokens dans la DB
```bash
npx prisma studio
```

- [ ] Aller dans le modèle `PasswordResetToken`
- [ ] Vérifier qu'un token est créé après la demande
- [ ] Vérifier que `used` passe à `true` après utilisation
- [ ] Vérifier la valeur de `expires`

#### 5.3 Logs AWS SES (si email non reçu)
- [ ] Aller sur [SES Console](https://console.aws.amazon.com/ses/)
- [ ] Menu "Email sending" → "Configuration sets" (si configuré)
- [ ] Vérifier les métriques d'envoi
- [ ] Vérifier les bounces/complaints

### 6. Tests avec différents clients mail

Tester l'affichage de l'email sur :
- [ ] Gmail (web)
- [ ] Outlook (web)
- [ ] Apple Mail
- [ ] Clients mobiles (iOS/Android)

**Vérifier** :
- [ ] Le design s'affiche correctement
- [ ] Le bouton est cliquable
- [ ] Le lien de fallback fonctionne
- [ ] Les couleurs sont correctes

### 7. Documentation

- [ ] Lire `docs/AWS_SETUP.md` pour la configuration AWS détaillée
- [ ] Lire `docs/PASSWORD_RESET.md` pour comprendre l'architecture
- [ ] Noter les problèmes rencontrés pour améliorer la doc

---

## 🚨 Problèmes courants et solutions

### Email non reçu

**Vérifications** :
1. ✅ Email vérifié dans SES ?
2. ✅ En mode Sandbox → email de destination vérifié ?
3. ✅ Variables d'environnement correctes ?
4. ✅ Credentials AWS valides ?
5. ✅ Vérifier les logs de l'application
6. ✅ Vérifier le dossier spam/courrier indésirable

**Solution** : Consultez `docs/AWS_SETUP.md` section "Dépannage"

### Erreur "Token invalide" immédiatement

**Causes possibles** :
1. ❌ Le client Prisma n'a pas été régénéré après l'ajout du modèle
2. ❌ Le schéma n'a pas été poussé à la DB

**Solution** :
```bash
pnpm prisma generate
pnpm prisma db push
```

### Email s'affiche mal

**Causes** :
1. 📧 Client mail ancien (Outlook 2007/2010)
2. 🎨 CSS inline non supporté

**Solution** : Le template est optimisé pour les clients modernes, certains anciens clients peuvent avoir un rendu dégradé mais fonctionnel

---

## 📋 Checklist finale

Avant de considérer la fonctionnalité comme prête pour la production :

- [ ] AWS SES en mode production (hors sandbox)
- [ ] Domaine vérifié dans SES (pas juste un email)
- [ ] SPF, DKIM, DMARC configurés pour le domaine
- [ ] Variables d'environnement en production configurées
- [ ] Tests fonctionnels passés (demande + reset + connexion)
- [ ] Tests de sécurité passés (expiration, usage unique, etc.)
- [ ] Email testé sur plusieurs clients
- [ ] Rate limiting implémenté (TODO futur)
- [ ] Monitoring des emails configuré (bounces, complaints)
- [ ] Logs d'audit pour les resets de mot de passe (TODO futur)

---

## 📞 Support

Pour toute question :
1. Consultez `docs/PASSWORD_RESET.md`
2. Consultez `docs/AWS_SETUP.md`
3. Vérifiez les logs de l'application
4. Vérifiez AWS SES console

---

**Date de création** : {{DATE}}
**Statut** : ⚠️ Configuration et tests requis
**Priorité** : 🔴 HAUTE
