# GestionMatos - Application de Gestion de Matériel avec QR Codes

Une application complète de gestion des entrées et sorties de matériel avec système de QR codes pour le suivi en temps réel. Parfaite pour les entreprises, associations et organisations qui ont besoin de tracer leur matériel.

## Fonctionnalités

- **Gestion des utilisateurs** : Système sécurisé d'inscription et de connexion
- **Gestion du matériel** : Ajout, modification et suppression d'équipements
- **QR Codes** : Génération automatique de QR codes pour chaque matériel et utilisateur
- **Entrées/Sorties** : Suivi en temps réel des mouvements de matériel
- **Scanner QR** : Interface de scan pour les entrées/sorties rapides
- **Historique** : Traçabilité complète des mouvements
- **Tableau de bord** : Vue d'ensemble des statistiques
- **Système de droits** : Accès différenciés selon les rôles utilisateur
- **Design responsive** : Fonctionne parfaitement sur ordinateur et mobile

## Rôles utilisateur

- **Utilisateur** : Peut emprunter et rendre du matériel
- **Gestionnaire** : Peut gérer le matériel et voir les statistiques
- **Administrateur** : Accès complet à toutes les fonctionnalités

## Stack technique

- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend** : Node.js, Express.js
- **Base de données** : SQLite (migration PostgreSQL facile)
- **QR Codes** : qrcode (génération), qr-scanner (lecture)
- **Authentification** : Tokens JWT avec hachage bcrypt
- **Déploiement** : Architecture serveur unique (prêt VPS)

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/enzweb/Dive.git
cd Dive
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env
```

4. Démarrez le serveur de développement :
```bash
npm run dev
```

## Déploiement en production

1. Construisez l'application :
```bash
npm run build
```

2. Démarrez le serveur de production :
```bash
npm start
```

L'application sera disponible sur `http://localhost:5000`

## Utilisation

1. **Inscription/Connexion** : Créez un compte ou connectez-vous
2. **Ajout de matériel** : Les gestionnaires peuvent ajouter du nouveau matériel
3. **Génération QR** : Chaque matériel et utilisateur a son QR code unique
4. **Scan** : Utilisez le scanner pour les entrées/sorties rapides
5. **Suivi** : Consultez l'historique et les statistiques

## Licence

Ce projet est sous licence MIT.