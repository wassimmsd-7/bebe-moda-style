# Bébé Moda Style — prototype web complet

Ce livrable est une démonstration fonctionnelle responsive de l’écosystème Bébé Moda Style. Il couvre la boutique client, le panier/COD, les conseils, le suivi et un espace propriétaire avec stock, commandes, fournisseurs, finance, promotions et super-admin.

## Démarrage local

Le projet est volontairement sans installation : ouvrez `index.html` dans un navigateur. Pour une expérience locale plus réaliste (et éviter les restrictions éventuelles du navigateur), depuis ce dossier :

```powershell
npx --yes serve .
```

Puis ouvrez l’URL indiquée, généralement `http://localhost:3000`.

## Ce qui est déjà utilisable

- Boutique responsive : recherche, filtres d’âge, produits, panier persistant (navigateur), thème sombre, aperçu multilingue.
- Commande COD, suivi de commande, conseils parents.
- Back-office : tableau de bord, alertes stock, bon de commande fournisseur suggéré, commandes, clients, finances, promotions et réglages.
- Interface caisse prévue dans le domaine fonctionnel : le meilleur choix de production est un écran POS distinct, relié à la même API et au même stock.

## Architecture recommandée pour la version production

Construire la vraie version en monorepo TypeScript :

```text
apps/
  storefront/       Next.js (site client, SEO, PWA)
  admin/            Next.js (propriétaire + super-admin)
  pos/              Next.js PWA (caisse, scanner, mode réseau faible)
  api/              NestJS ou Next.js API
packages/
  ui/               composants partagés
  i18n/             FR / AR / EN / Darija
  database/         Prisma + schéma partagé
```

Technologies recommandées : Next.js, TypeScript, PostgreSQL (Supabase ou Neon), Prisma, Auth.js/Clerk, Cloudinary ou S3 pour images, Resend/WhatsApp Business pour confirmations, et intégration transporteur locale par API ou export CSV. Prévoir une base de données unique, des rôles RBAC (owner, caissier, préparateur, livreur, admin), historique/audit, sauvegardes quotidiennes et journal de caisse. Pour l’Algérie, mettre COD par défaut et ne proposer la carte/virement que comme méthodes optionnelles.

## Étapes concrètes de production

1. Valider le catalogue, les catégories, les wilayas/livraisons, les règles COD et les rôles employés.
2. Créer le monorepo et PostgreSQL ; modéliser produits, variantes, inventaires, mouvements de stock, commandes, paiements, fournisseurs, clients, dépenses et livraisons.
3. Mettre en place authentification, permissions, import d’images, génération SKU/code-barres et audit de chaque action.
4. Brancher la boutique à l’API, avec traductions réelles, SEO, pages produits, checkout COD et notifications WhatsApp/SMS.
5. Développer le POS : scan caméra/douchette, paiement total/partiel/crédit, retours, impression ticket et clôture de caisse. Garder un mode hors-ligne avec synchronisation contrôlée.
6. Ajouter rapports de marge nette (coût d’achat, ventes, charges, personnel), alertes réapprovisionnement, bons fournisseurs et export comptable.
7. Tester sur mobile, tablette, PC, arabe RTL, cas de stock concurrent, retours et droits utilisateurs ; effectuer une sauvegarde/restauration de test.
8. Déployer : Vercel pour front, Supabase/Neon pour DB, domaine `bebemodastyle.dz`, Cloudinary pour médias, Sentry pour erreurs et sauvegardes automatisées.

## Commandes Git

Depuis ce dossier :

```powershell
git init
git add .
git commit -m "feat: initial Bébé Moda Style prototype"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/bebe-moda-style.git
git push -u origin main
```

Pour une évolution :

```powershell
git checkout -b codex/nom-de-la-fonctionnalite
git add .
git commit -m "feat: description courte"
git push -u origin codex/nom-de-la-fonctionnalite
```

## Sécurité et conformité à ne pas repousser

- Ne jamais conserver les mots de passe, numéros de carte ou secrets dans le navigateur.
- Limiter le contact marketing aux clients consentants ; protéger numéros/adresses ; créer les accès employés nominativement.
- Le crédit client doit exiger plafond, échéance, responsable validant et relance tracée.
- Les retours/annulations doivent créer un mouvement de stock et une trace comptable, jamais seulement modifier une commande.

## Prochaine décision utile

Avant la version connectée, il faut fixer les données réelles : liste produits/variantes/prix, fournisseurs, tarifs par wilaya, transporteur, politiques retour, employés et méthode de confirmation COD. Le prototype présent est la base visuelle et fonctionnelle pour cette phase.

## Corrections et ajouts (dernière révision)

- **Menu mobile corrigé** : la navigation disparaissait complètement sous 900px sans aucun moyen de l'ouvrir. Un bouton ☰ ouvre désormais un panneau latéral responsive.
- **Temps réel activé** : `realtime.js` s'abonne aux changements Supabase (`products`, `orders`). Le stock, le catalogue boutique, l'inventaire admin, la caisse et les commandes se mettent à jour automatiquement, sans rechargement. Nécessite d'exécuter `supabase/005_realtime.sql`.
- **Doublon corrigé** : `inventory-admin.js` et `media-manager.js` chargeaient tous les deux la liste des produits sur le même clic d'onglet, ce qui pouvait écraser les photos/statuts de publication selon l'ordre des réponses réseau. `inventory-admin.js` ne gère plus que l'ouverture du formulaire d'ajout.
- **Commandes connectées** : le panneau « Commandes » affichait une liste figée de 3 exemples. `orders-admin.js` charge désormais les vraies commandes en ligne depuis Supabase, avec changement de statut en direct.
- **Clients connectés** : même correction pour le panneau « Clients » via `customers-admin.js` (nom, wilaya, nombre de commandes, total dépensé, calculés depuis la base réelle).

## Panneaux encore en démonstration

Les panneaux **Fournisseurs**, **Finance**, **Offres & saisons** et **Super admin** affichent toujours des exemples statiques : ils ne sont pas encore branchés à Supabase. Le schéma contient déjà les tables nécessaires (`suppliers`, `expenses`, `promotions`, `purchase_orders`), donc le travail restant est côté interface (mêmes patrons que `orders-admin.js`/`customers-admin.js`), pas côté base de données.

## Base de données et publication

Le projet contient maintenant `supabase/schema.sql`, `supabase-config.js` et `DEPLOIEMENT_GRATUIT.md`. Suivez ce dernier document dans l’ordre : créer le projet Supabase, exécuter le schéma, renseigner l’URL et la clé `anon`, puis publier le dépôt via GitHub Pages. Avec cette configuration, le catalogue se lit depuis Supabase et les commandes COD sont envoyées à la base, avec contrôle du stock côté serveur.
