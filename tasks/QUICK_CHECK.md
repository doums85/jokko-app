# ⚡ Quick Check - Vérifications rapides AWS

Ce fichier contient les vérifications essentielles à faire **maintenant** pour valider la configuration AWS.

---

## 🎯 Actions immédiates (15-30 min)

### ✅ 1. Vérifier l'email dans AWS SES Console

**URL**: https://console.aws.amazon.com/ses/

**Actions**:
1. [ ] Se connecter à AWS Console
2. [ ] Sélectionner la région **eu-central-1** (Frankfurt)
3. [ ] Menu latéral → **Configuration** → **Verified identities**
4. [ ] Chercher `noreply@jokko.co` ou `jokko.co`

**Résultat attendu**:
- ✅ L'email/domaine apparaît avec le statut **"Verified"**
- ❌ Si absent ou "Pending" → Suivre les instructions dans `AWS_VERIFICATION.md`

---

### ✅ 2. Vérifier le mode SES

**Dans la même console SES**:
1. [ ] Aller sur **Account dashboard** (menu latéral)
2. [ ] Regarder en haut de page : "SES account status"

**Résultats possibles**:

**Option A : Sandbox** 🟡
```
⚠️ Mode Sandbox actif
→ Vous ne pouvez envoyer qu'à des emails vérifiés
→ Pour tester, vous devez AUSSI vérifier l'email destinataire
→ Actions:
   1. Vérifier votre email personnel dans SES
   2. Ou demander la sortie du Sandbox (voir AWS_VERIFICATION.md)
```

**Option B : Production** 🟢
```
✅ Mode Production actif
→ Vous pouvez envoyer à n'importe quel email
→ Prêt pour les tests !
```

---

### ✅ 3. Mettre à jour la base de données

```bash
cd /Users/admin/Desktop/jokko/.conductor/edinburgh

# Pousser le nouveau schéma (ajoute PasswordResetToken)
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate
```

**Résultat attendu**:
```
✓ Your database is now in sync with your schema.
✓ Generated Prisma Client
```

---

### ✅ 4. Test rapide d'envoi d'email

**Prérequis**:
- Email vérifié dans SES
- Si mode Sandbox : votre email personnel AUSSI vérifié

**Commande**:
```bash
# REMPLACER par VOTRE email (vérifié dans SES si mode Sandbox)
pnpm tsx scripts/test-ses.ts votre-email@exemple.com
```

**Résultat attendu**:
```
┌────────────────────────────────────────────────────────────┐
│                   ✅ SUCCÈS !                              │
└────────────────────────────────────────────────────────────┘

L'email a été envoyé avec succès !
```

**Si erreur**:
- Consultez le diagnostic affiché par le script
- Consultez `AWS_VERIFICATION.md` section "Troubleshooting"

---

### ✅ 5. Vérifier l'email reçu

**Checklist du design**:
- [ ] Header noir avec "JOKKO" en blanc
- [ ] Titre "Réinitialisation de mot de passe" centré
- [ ] Message personnalisé avec "Bonjour Test User"
- [ ] Bouton noir "Réinitialiser mon mot de passe"
- [ ] Info box grise avec:
  - [ ] ⏱️ "Ce lien est valide pendant 1 heure"
  - [ ] 🔒 "Pour votre sécurité, ce lien ne peut être utilisé qu'une seule fois"
- [ ] Texte d'avertissement en italique
- [ ] Footer gris avec:
  - [ ] Texte "Le bouton ne fonctionne pas..."
  - [ ] Lien de fallback souligné
  - [ ] Copyright "© 2024 Jokko. Tous droits réservés."

**Le bouton fonctionne**:
- [ ] Cliquer sur le bouton
- [ ] S'ouvre sur `http://localhost:3000/reset-password?token=...`

---

### ✅ 6. Test du flux complet (optionnel pour l'instant)

**Si vous voulez tester tout de suite**:

1. **Démarrer le serveur**:
```bash
pnpm dev
```

2. **Créer un seed avec des utilisateurs**:
```bash
pnpm prisma db seed
```

3. **Tester le flux**:
   - [ ] Aller sur http://localhost:3000/forgot-password
   - [ ] Entrer un email du seed (ex: `alice.owner@acme.com`)
   - [ ] Cliquer "Envoyer le lien"
   - [ ] Vérifier l'email reçu
   - [ ] Cliquer sur le lien
   - [ ] Réinitialiser le mot de passe
   - [ ] Se connecter avec le nouveau mot de passe

**Note**: Ce test complet peut être fait plus tard. L'essentiel est que le test SES (#4) fonctionne.

---

## 🚨 Problèmes courants

### ❌ "Email non reçu"

**1. Mode Sandbox + email non vérifié**
```bash
Solution:
1. Dans SES Console → Verified identities
2. Cliquer "Create identity"
3. Sélectionner "Email address"
4. Entrer votre email personnel
5. Vérifier l'email reçu
6. Relancer le test
```

**2. Email dans le spam**
```bash
Solution:
- Vérifier le dossier Spam/Courrier indésirable
- Marquer "Non spam" si trouvé
```

**3. Credentials AWS invalides**
```bash
Solution:
1. Vérifier .env contient AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY
2. Vérifier qu'il n'y a pas d'espaces
3. Redémarrer le terminal
4. Relancer le test
```

---

### ❌ "MessageRejected"

**Cause**: Email non vérifié en mode Sandbox

**Solution**:
1. Vérifier que SES est en mode Sandbox
2. Vérifier l'email destinataire dans SES Console
3. Ou demander la sortie du Sandbox

---

### ❌ "Unable to locate credentials"

**Solution**:
```bash
# Vérifier les variables
cat .env | grep AWS

# Vous devez voir:
# AWS_REGION=eu-central-1
# AWS_ACCESS_KEY_ID=AKIAQOI5F3WOT6GF3KU6
# AWS_SECRET_ACCESS_KEY=...

# Si manquant, elles sont dans ce fichier (copier dans .env)
```

---

## 📊 Statut de votre configuration

**Remplissez au fur et à mesure** :

```
┌─────────────────────────────────────────────────────┐
│              STATUT CONFIGURATION AWS               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [?] Email vérifié dans SES                        │
│  [?] Mode SES vérifié (Sandbox/Production)         │
│  [?] Base de données mise à jour                   │
│  [?] Test SES réussi                               │
│  [?] Email reçu et design validé                   │
│  [?] Flux complet testé                            │
│                                                     │
│  Légende: [✓] OK  [✗] KO  [?] À faire             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Prochaines étapes

Une fois les 5 premières vérifications ✅ :

1. **Tests de sécurité** → Voir `PASSWORD_RESET_SETUP.md`
2. **Tests multi-clients email** → Gmail, Outlook, etc.
3. **Sortie du mode Sandbox** → Si pas encore fait
4. **Configuration production** → Variables d'env production
5. **Monitoring SES** → Configuration des alertes

---

## 📚 Documentation complète

Pour plus de détails:
- **Configuration détaillée**: `AWS_VERIFICATION.md`
- **Tests approfondis**: `PASSWORD_RESET_SETUP.md`
- **Architecture**: `../docs/PASSWORD_RESET.md`
- **Setup AWS complet**: `../docs/AWS_SETUP.md`

---

**Temps estimé pour ces vérifications**: 15-30 minutes
**Bloquant pour**: Fonctionnalité de mot de passe oublié
**Priorité**: 🔴 HAUTE

---

## ✨ Une fois terminé

Quand tout est ✅, vous pouvez :
1. Marquer cette tâche comme terminée
2. Commiter les changements
3. Passer aux tests de sécurité complets
4. Déployer en production

**Bon courage ! 🚀**
