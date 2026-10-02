# Échappée — Présentation orale

**Tom Roussely et Morgan Adolphe-Supiot**

## Présentation du projet

# Échappée

**Projet réalisé par Tom Roussely et Morgan Adolphe-Supiot**

Échappée est une application web de réservation pour un parc de loisirs, développée dans le cadre du projet Next.js. Elle permet aux visiteurs de découvrir les activités du parc, de réserver une place et de retrouver leurs réservations. Un espace d’administration permet de gérer les activités proposées.

## Fonctionnalités

### Visiteur

Le catalogue est accessible sans compte. Il présente notamment des activités d’accrobranche, de kayak, d’escalade, de yoga, de VTT et de paddle. Chaque fiche indique les informations utiles avant de réserver : description, date, durée, niveau, prix et places restantes.

Il est possible de rechercher une activité par son nom, de filtrer le catalogue par catégorie ou disponibilité, et de trier les résultats par date ou par prix.

### Utilisateur connecté

Après avoir créé un compte et s’être connecté, l’utilisateur peut réserver une place pour une activité, consulter ses réservations et les annuler. Il peut également modifier son profil, supprimer son compte et se déconnecter.

Une réservation annulée reste visible dans l’historique, mais libère sa place. Par exemple, une activité de huit places avec trois réservations actives affiche cinq places restantes ; après une annulation, elle en affiche six.

### Administrateur

L’administrateur peut créer, modifier et supprimer des activités. Il peut renseigner leur catégorie, leur description, leur date, leur durée, leur capacité, leur prix, leur niveau et leur photo. Un tableau de bord lui donne également accès à des statistiques sur le parc.

Les comptes créés depuis le site ont le rôle utilisateur. Le rôle administrateur est attribué séparément à l’aide d’une commande locale. Les pages et les actions d’administration vérifient les droits côté serveur.

## Fonctionnement d’une réservation

Lorsqu’un utilisateur réserve une activité, le serveur vérifie sa connexion, la date de l’activité, les places restantes et l’absence d’une réservation active déjà effectuée par ce compte.

Les places restantes sont calculées à partir de la capacité de l’activité, en retirant ses réservations actives. La vérification et l’enregistrement sont regroupés dans une transaction SQLite afin que deux demandes simultanées ne puissent pas prendre la même dernière place.

Un utilisateur ne peut annuler que ses propres réservations.

## Organisation technique

Le projet utilise **Next.js avec l’App Router**, **React**, **TypeScript** et **SQLite**.

- `app/` contient les pages et les actions exécutées côté serveur.
- `components/` regroupe les éléments d’interface réutilisables.
- `lib/` contient notamment l’accès à la base de données et la gestion de l’authentification.

Les principaux ensembles de données sont les utilisateurs, les catégories, les activités et les réservations. Les formulaires sont validés côté serveur avec Zod. Les mots de passe sont hachés avec scrypt et un sel aléatoire ; les sessions utilisent un cookie HttpOnly.

L’interface est en français et s’adapte aux écrans mobiles et aux ordinateurs. Les URL inexistantes disposent d’une page 404 dédiée.

## Vérifications

Des tests automatisés couvrent notamment les règles de réservation : activité complète ou passée, doublon, annulation, restitution d’une place et suppression d’un compte. Ils vérifient aussi le hachage des mots de passe. Une base temporaire est utilisée pour ne pas modifier les données de l’application.

Des parcours Playwright vérifient certaines actions depuis le navigateur, dont l’affichage mobile du catalogue et les restrictions d’accès à l’administration.

## Limites et évolutions possibles

Le prix est indiqué sur le site, mais le paiement s’effectue sur place. L’application ne propose pas encore le paiement en ligne, les emails de confirmation ni la réservation de plusieurs places en une seule opération.

La version actuelle utilise un fichier SQLite local. Son déploiement nécessite donc un hébergement qui conserve ce fichier entre les redémarrages.