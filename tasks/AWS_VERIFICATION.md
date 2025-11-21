# ✅ Tâches de vérification AWS - Configuration Jokko

## Configuration AWS actuelle

```env
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIAQOI5F3WOT6GF3KU6
AWS_S3_BUCKET=jokko-dev-media
AWS_SES_CONFIGURATION_SET=email-marketing
SES_FROM_EMAIL=noreply@jokko.co
SES_FROM_NAME=Jokko
```

---

## 🔐 1. Vérification des identités SES

### Vérifier l'email `noreply@jokko.co`

1. **Aller sur AWS SES Console** :
   - [ ] Se connecter à AWS Console
   - [ ] Aller dans **AWS SES** (Simple Email Service)
   - [ ] Région : **eu-central-1** (Frankfurt)

2. **Vérifier les identités** :
   - [ ] Menu latéral → **Configuration** → **Verified identities**
   - [ ] Chercher `jokko.co` (domaine) ou `noreply@jokko.co` (email)

3. **Options de vérification** :

   **Option A : Vérifier le domaine complet (RECOMMANDÉ)** ✅
   - [ ] Cliquer sur "Create identity"
   - [ ] Sélectionner "Domain"
   - [ ] Entrer : `jokko.co`
   - [ ] Cocher "Use a default configuration set" → Sélectionner `email-marketing`
   - [ ] Cliquer "Create identity"
   - [ ] **Ajouter les enregistrements DNS** fournis par AWS :
     - 3 enregistrements CNAME pour DKIM
     - 1 enregistrement TXT pour SPF (optionnel mais recommandé)
     - 1 enregistrement TXT pour DMARC (optionnel mais recommandé)
   - [ ] Attendre la vérification (15 min à 72h)
   - [ ] Vérifier le statut : "Verified" ✅

   **Option B : Vérifier uniquement l'email (RAPIDE pour tests)** ⚡
   - [ ] Cliquer sur "Create identity"
   - [ ] Sélectionner "Email address"
   - [ ] Entrer : `noreply@jokko.co`
   - [ ] Cliquer "Create identity"
   - [ ] Vérifier l'email reçu dans la boîte mail
   - [ ] Cliquer sur le lien de vérification
   - [ ] Vérifier le statut : "Verified" ✅

---

## 📮 2. Vérifier le mode SES (Sandbox vs Production)

1. **Vérifier le statut actuel** :
   - [ ] Dans SES Console → **Account dashboard**
   - [ ] Regarder en haut : "SES account status"

   **Si vous êtes en Sandbox** 🟡 :
   - Vous ne pouvez envoyer qu'à des emails vérifiés
   - Limite : 200 emails/jour, 1 email/seconde

   **Si vous êtes en Production** 🟢 :
   - Vous pouvez envoyer à n'importe quel email
   - Limites plus élevées

2. **Demander la sortie du Sandbox (si nécessaire)** :
   - [ ] Cliquer sur "Request production access"
   - [ ] Remplir le formulaire :
     - **Type** : Transactional
     - **Website URL** : https://jokko.co
     - **Use case** : "Sending password reset and transactional emails for our SaaS platform"
     - **Will you comply with AWS policies** : Yes
   - [ ] Soumettre la demande
   - [ ] Attendre l'approbation (24-48h généralement)

3. **En attendant l'approbation, vérifier des emails de test** :
   - [ ] Créer une identité pour votre email personnel
   - [ ] Tester l'envoi avec cet email

---

## 🧪 3. Test de l'envoi d'email SES

### Test manuel rapide

1. **Créer un fichier de test** : `scripts/test-ses.ts`

```typescript
import { sendReactEmail } from "@/lib/aws/ses";
import { PasswordResetEmail } from "@/emails/password-reset";

async function testSES() {
  try {
    console.log("🚀 Envoi d'un email de test...");

    await sendReactEmail({
      to: "votre-email@exemple.com", // REMPLACER PAR VOTRE EMAIL
      subject: "Test - Réinitialisation de mot de passe Jokko",
      react: PasswordResetEmail({
        userName: "Test User",
        resetLink: "http://localhost:3000/reset-password?token=test-token-123",
        expiresIn: 1,
      }),
    });

    console.log("✅ Email envoyé avec succès !");
    console.log("📧 Vérifiez votre boîte mail (et le dossier spam)");
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi :", error);
  }
}

testSES();
```

2. **Exécuter le test** :
```bash
# Installer ts-node si ce n'est pas déjà fait
pnpm add -D ts-node

# Exécuter le test
pnpm tsx scripts/test-ses.ts
```

3. **Vérifier** :
   - [ ] La commande s'exécute sans erreur
   - [ ] L'email est reçu (vérifier spam/courrier indésirable)
   - [ ] Le design de l'email est correct
   - [ ] Le bouton fonctionne
   - [ ] Le lien de fallback fonctionne

---

## 🗄️ 4. Vérifier la configuration S3

1. **Accéder au bucket S3** :
   - [ ] AWS Console → **S3**
   - [ ] Chercher le bucket : `jokko-dev-media`

2. **Vérifier les permissions** :
   - [ ] Cliquer sur le bucket
   - [ ] Onglet **Permissions**
   - [ ] Vérifier que l'utilisateur IAM `AKIAQOI5F3WOT6GF3KU6` a les droits :
     - `s3:PutObject` (upload)
     - `s3:GetObject` (download)
     - `s3:DeleteObject` (suppression)
     - `s3:ListBucket` (lister les fichiers)

3. **Tester l'upload S3** (optionnel pour mot de passe oublié) :
```bash
# Créer scripts/test-s3.ts
pnpm tsx scripts/test-s3.ts
```

---

## 🔄 5. Test du flux complet de mot de passe oublié

### Pré-requis

- [ ] Base de données à jour : `pnpm prisma db push`
- [ ] Client Prisma généré : `pnpm prisma generate`
- [ ] Email vérifié dans SES
- [ ] Variables d'environnement configurées
- [ ] Serveur de dev démarré : `pnpm dev`

### Test étape par étape

#### Étape 1 : Créer un utilisateur de test
```bash
# Utiliser le seed existant
pnpm prisma db seed

# Ou créer un utilisateur manuellement via Prisma Studio
npx prisma studio
```

- [ ] Noter l'email d'un utilisateur existant (ex: `alice.owner@acme.com`)

#### Étape 2 : Demander la réinitialisation
- [ ] Ouvrir : http://localhost:3000/forgot-password
- [ ] Entrer l'email de test
- [ ] Cliquer sur "Envoyer le lien"
- [ ] Vérifier le message de succès

#### Étape 3 : Vérifier l'email
- [ ] Ouvrir votre boîte mail
- [ ] Vérifier la réception de l'email (spam/courrier indésirable aussi)
- [ ] Vérifier le design :
   - [ ] Header noir avec "JOKKO"
   - [ ] Titre "Réinitialisation de mot de passe"
   - [ ] Message personnalisé avec le nom
   - [ ] Bouton noir "Réinitialiser mon mot de passe"
   - [ ] Info box avec ⏱️ et 🔒
   - [ ] Footer avec lien de fallback
   - [ ] Copyright

#### Étape 4 : Réinitialiser le mot de passe
- [ ] Cliquer sur le bouton dans l'email
- [ ] Vérifier l'ouverture de `/reset-password?token=...`
- [ ] Entrer un nouveau mot de passe (min 8 caractères)
- [ ] Confirmer le mot de passe
- [ ] Cliquer sur "Réinitialiser le mot de passe"
- [ ] Vérifier le message de succès
- [ ] Vérifier la redirection vers `/login`

#### Étape 5 : Connexion avec le nouveau mot de passe
- [ ] Sur la page de connexion
- [ ] Entrer l'email de test
- [ ] Entrer le **nouveau** mot de passe
- [ ] Cliquer sur "Se connecter"
- [ ] Vérifier que la connexion fonctionne ✅

---

## 🔒 6. Tests de sécurité

### Test 1 : Token expiré
1. **Forcer l'expiration** :
   - [ ] Dans Prisma Studio, ouvrir `PasswordResetToken`
   - [ ] Modifier `expires` pour une date passée
   - [ ] Essayer d'utiliser le lien
   - [ ] Vérifier l'erreur : "Token expiré ou invalide"

### Test 2 : Token déjà utilisé
- [ ] Réinitialiser un mot de passe avec succès
- [ ] Réessayer d'utiliser le même lien
- [ ] Vérifier l'erreur : "Token expiré ou invalide"
- [ ] Dans Prisma Studio, vérifier que `used = true`

### Test 3 : Token invalide
- [ ] Modifier manuellement le token dans l'URL
- [ ] Ex: `?token=invalid-token-xxx`
- [ ] Vérifier l'erreur : "Token expiré ou invalide"

### Test 4 : Email inexistant
- [ ] Demander un reset pour `nonexistent@example.com`
- [ ] Vérifier que le message de succès s'affiche quand même
- [ ] Vérifier qu'aucun email n'est envoyé
- [ ] Dans Prisma Studio, vérifier qu'aucun token n'est créé

### Test 5 : Validation mot de passe
- [ ] Essayer un mot de passe < 8 caractères
- [ ] Vérifier l'erreur de validation
- [ ] Essayer des mots de passe non identiques
- [ ] Vérifier l'erreur "Les mots de passe ne correspondent pas"

---

## 📊 7. Monitoring SES

### Vérifier les statistiques d'envoi
1. **Dans SES Console** :
   - [ ] Menu **Reputation** → **Reputation metrics**
   - [ ] Vérifier :
     - Bounce rate (taux de rebond) < 5%
     - Complaint rate (taux de plainte) < 0.1%

2. **Vérifier les envois récents** :
   - [ ] Menu **Email sending** → **Configuration sets**
   - [ ] Cliquer sur `email-marketing`
   - [ ] Voir les métriques et événements SNS

---

## 🐛 8. Troubleshooting

### Problème : Email non reçu

**Diagnostics** :
1. [ ] Vérifier les logs de l'application :
   ```bash
   # Dans le terminal où tourne pnpm dev
   # Chercher les erreurs SES
   ```

2. [ ] Vérifier l'identité SES :
   - [ ] Email ou domaine vérifié ?
   - [ ] En mode Sandbox → email destinataire vérifié ?

3. [ ] Vérifier le dossier spam

4. [ ] Vérifier les bounces dans SES Console :
   - [ ] Menu **Suppression list**
   - [ ] Chercher l'email destinataire

### Problème : Erreur d'authentification AWS

**Erreur** : `Unable to locate credentials`

**Solutions** :
- [ ] Vérifier que les variables sont dans `.env`
- [ ] Vérifier qu'il n'y a pas d'espaces dans les credentials
- [ ] Redémarrer le serveur de dev après modification `.env`
- [ ] Vérifier que les credentials IAM sont valides dans AWS Console

### Problème : Erreur "MessageRejected"

**Causes possibles** :
1. [ ] Email non vérifié en mode Sandbox
2. [ ] Email sur la suppression list (bounce/complaint)
3. [ ] Format d'email invalide

**Solutions** :
- [ ] Vérifier l'identité SES
- [ ] Demander la sortie du Sandbox
- [ ] Vérifier la suppression list SES

---

## ✅ Checklist finale

Avant de marquer cette tâche comme terminée :

- [ ] ✅ Email `noreply@jokko.co` ou domaine `jokko.co` vérifié dans SES
- [ ] ✅ Variables d'environnement AWS configurées dans `.env`
- [ ] ✅ Base de données mise à jour avec le modèle `PasswordResetToken`
- [ ] ✅ Test d'envoi d'email réussi
- [ ] ✅ Flux complet testé (demande → email → reset → connexion)
- [ ] ✅ Tests de sécurité passés (expiration, réutilisation, etc.)
- [ ] ✅ Design de l'email vérifié sur plusieurs clients
- [ ] ✅ Documentation lue (`docs/PASSWORD_RESET.md` et `docs/AWS_SETUP.md`)

---

## 📝 Notes importantes

### Environnement de développement
- Utilise le bucket S3 : `jokko-dev-media`
- Région : `eu-central-1` (Frankfurt)
- Configuration set : `email-marketing`

### Pour la production
- [ ] Créer un bucket S3 de production
- [ ] Créer un configuration set de production
- [ ] Vérifier le domaine (pas juste un email)
- [ ] Configurer SPF, DKIM, DMARC
- [ ] Sortir du mode Sandbox SES
- [ ] Configurer le monitoring SNS
- [ ] Augmenter les limites SES si nécessaire

### Sécurité
- ⚠️ **Ne jamais commit les credentials AWS** dans git
- ⚠️ Le fichier `.env` est dans `.gitignore`
- ⚠️ Utiliser des variables d'environnement différentes en production
- ⚠️ Rotation des credentials AWS régulièrement

---

**Créé le** : {{DATE}}
**Statut** : ⚠️ À vérifier et tester
**Priorité** : 🔴 HAUTE
**Assigné à** : Vous
