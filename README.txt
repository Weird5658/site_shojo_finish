Shojo Anim

Shojo Anim est une plateforme dédiée aux amateurs d’animation japonaise. Le site permet de découvrir de nouveaux animes, de suivre les séries en cours et de gérer facilement ses listes de visionnage dans une interface moderne et intuitive.

Présentation

Shojo Anim centralise les informations essentielles sur les animes et offre aux utilisateurs un espace personnel pour organiser leurs contenus préférés.

Fonctionnalités principales

- Consultation d’un catalogue d’animes
- Recherche rapide par titre, genre ou studio
- Gestion de listes personnalisées
  - À regarder
  - En cours
  - Terminé
  - Favoris
- Système de notation et d’avis
- Suivi de progression des épisodes
- Profils utilisateurs personnalisés
- Interface responsive adaptée aux ordinateurs, tablettes et smartphones

Technologies utilisées

Frontend

- HTML5
- CSS3
- JavaScript
- React

Backend

- Node.js
- Express.js

Base de données

- MongoDB

Authentification

- JSON Web Token (JWT)

Installation

Prérequis

- Node.js 18 ou supérieur
- MongoDB
- npm ou yarn

Cloner le projet

```bash
git clone https://github.com/votre-utilisateur/shojo-anim.git
cd shojo-anim
```

Installer les dépendances

```bash
npm install
```

Configuration

Créer un fichier `.env` à la racine du projet :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shojoanim
JWT_SECRET=votre_cle_secrete
```

Lancement du projet

Mode développement :

```bash
npm run dev
```

Mode production :

```bash
npm start
```

Structure du projet

```text
shojo-anim/
├── client/
│   ├── public/
│   ├── src/
│   └── components/
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── .env
├── package.json
└── README.md
```

Utilisation

1. Créer un compte utilisateur.
2. Se connecter à son espace personnel.
3. Rechercher un anime dans le catalogue.
4. L’ajouter à une liste personnalisée.
5. Suivre sa progression épisode après épisode.
6. Noter et commenter les séries visionnées.

Sécurité

- Chiffrement des mots de passe avec bcrypt
- Authentification sécurisée par JWT
- Validation des données côté serveur
- Protection des routes privées

Contribution

Les contributions sont les bienvenues.

1. Forker le projet.
2. Créer une branche dédiée :

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

3. Effectuer les modifications.
4. Créer un commit :

```bash
git commit -m "Ajout d'une nouvelle fonctionnalité"
```

5. Envoyer les changements :

```bash
git push origin feature/nouvelle-fonctionnalite
```

6. Ouvrir une Pull Request.

Licence

Ce projet est distribué sous licence MIT.

Auteur

Projet développé pour la communauté des passionnés d’animation japonaise.