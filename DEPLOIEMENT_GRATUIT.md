# Publication réelle gratuite — Bébé Moda Style

La combinaison conseillée est **GitHub Pages + Supabase** : sans carte bancaire pour commencer, HTTPS inclus et facile à maintenir. GitHub Pages publie le site statique ; Supabase héberge PostgreSQL, les comptes et les images. Vérifiez les limites des plans gratuits avant une forte croissance.

## 1. Créer la base Supabase

1. Créez un compte sur [Supabase](https://supabase.com), puis `New project` (région Europe proche de l’Algérie).
2. Dans **SQL Editor**, créez une requête, copiez entièrement `supabase/schema.sql`, puis cliquez `Run`.
3. Dans **Project settings > API Keys**, copiez uniquement `Project URL` et la clé **Publishable** dans `supabase-config.js`. La clé `anon` historique fonctionne encore mais la clé Publishable est désormais recommandée.
4. Dans **Authentication > Providers**, activez Email. Créez votre compte propriétaire dans **Authentication > Users**.
5. Dans **SQL Editor**, exécutez la dernière commande commentée du schéma en remplaçant l’UUID par celui de votre compte. Cela active votre accès propriétaire.
6. Pour remplir la boutique immédiatement, créez une nouvelle requête SQL, copiez `supabase/seed-demo.sql` entièrement puis cliquez `Run`. Les fournisseurs sont clairement marqués « à remplacer » : remplacez-les avec vos vrais contacts.
7. Dans **Table Editor**, vérifiez `products`, puis modifiez les prix, le stock, les informations et activez `published = true` pour chaque produit réel. Un produit publié apparaît automatiquement sur la boutique.
8. Exécutez ensuite, dans l'ordre, `supabase/002_product_images.sql`, `supabase/003_pos.sql`, `supabase/004_pos_returns.sql`, puis **`supabase/005_realtime.sql`**. Ce dernier fichier est nouveau : il active la synchronisation en temps réel (stock, commandes) utilisée par `realtime.js`. Sans lui, le site fonctionne mais les mises à jour n'apparaissent qu'après un rafraîchissement manuel.

### Importer beaucoup de produits

Préparez un fichier CSV avec le modèle `supabase/import-produits.csv`. Dans **Table Editor > products > Insert > Import data from CSV**, importez-le. Pour les colonnes `category_id` et `supplier_id`, importez d’abord les catégories/fournisseurs puis sélectionnez-les à la main, ou utilisez le fichier SQL pour une importation plus contrôlée. Faites toujours un export de sauvegarde avant un gros import.

## 2. Ajouter les médias

Dans **Storage**, créez un bucket `products` public. Téléversez les photos puis mettez leurs URL dans `products.image_url`. Utilisez des photos carrées, WebP/JPEG optimisées, idéalement 1200×1200 px et moins de 300 Ko.

## 3. Publier gratuitement avec GitHub Pages

Dans PowerShell, depuis le dossier du projet, utilisez `git` et votre dépôt GitHub vide :

```powershell
git init
git add .
git commit -m "feat: Bébé Moda Style"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/bebe-moda-style.git
git push -u origin main
```

Sur GitHub : **Settings > Pages > Build and deployment > Deploy from a branch**, choisissez `main` et `/ (root)`, puis `Save`. Votre URL sera :

```text
https://VOTRE-COMPTE.github.io/bebe-moda-style/
```

Toute mise à jour est publiée ainsi :

```powershell
git add .
git commit -m "feat: mise à jour catalogue"
git push
```

## 4. Domaine professionnel (facultatif mais recommandé)

Achetez `bebemodastyle.dz` ou `.com` chez un registrar. Dans GitHub Pages, ajoutez le domaine dans **Custom domain**, puis créez chez le registrar les entrées DNS demandées par GitHub. Activez `Enforce HTTPS` une fois le certificat émis.

## 5. Règles avant l’ouverture

- Testez une commande COD réelle, l’épuisement du stock, un retour et deux employés connectés en même temps.
- Ne partagez jamais la clé `service_role`, un mot de passe ou le compte Supabase.
- Ajoutez des pages légales : confidentialité, livraison, retours, conditions de vente.
- Pour les confirmations, connectez plus tard WhatsApp Business/SMS via un service officiel ; n’automatisez aucun envoi sans consentement.
- Exportez la base régulièrement : le gratuit n’est pas une stratégie de sauvegarde complète.

## Limite importante

GitHub Pages convient à la boutique statique + Supabase. Pour une caisse hors-ligne, impression thermique, intégrations transporteurs, facturation, recherche intelligente et tableaux financiers lourds, migrez ensuite le front vers Vercel/Cloudflare et ajoutez une API serveur. La base Supabase et le schéma restent les mêmes.
