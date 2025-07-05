# Installation de GestionMatos sur Debian

## Prérequis système

Votre système Debian doit avoir :
- Node.js 18+ et npm
- SQLite3
- Git (optionnel)

## Étape 1 : Préparation du système

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js et npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de SQLite3
sudo apt install sqlite3 -y

# Vérification des versions
node --version
npm --version
sqlite3 --version
```

## Étape 2 : Installation depuis le fichier sur le bureau

```bash
# Aller sur le bureau
cd ~/Desktop

# Si vous avez un fichier ZIP, l'extraire
unzip gestion-matos.zip
cd gestion-matos

# OU si vous avez un dossier directement
cd gestion-matos

# Installation des dépendances
npm install

# Création du fichier d'environnement
cp .env.example .env

# Éditer le fichier .env si nécessaire
nano .env
```

## Étape 3 : Configuration de l'environnement

Créez le fichier `.env` avec le contenu suivant :

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=votre_secret_jwt_tres_securise_ici
DB_PATH=./server/database/material.db
```

## Étape 4 : Initialisation de la base de données

```bash
# La base de données sera créée automatiquement au premier démarrage
# Vous pouvez vérifier que tout fonctionne avec :
npm run dev
```

## Étape 5 : Construction pour la production

```bash
# Construction de l'application
npm run build

# Test du serveur de production
npm start
```

## Étape 6 : Configuration en tant que service système (optionnel)

Pour que l'application démarre automatiquement :

```bash
# Créer le fichier de service
sudo nano /etc/systemd/system/gestion-matos.service
```

Contenu du fichier service :

```ini
[Unit]
Description=GestionMatos - Gestion de matériel
After=network.target

[Service]
Type=simple
User=votre_utilisateur
WorkingDirectory=/home/votre_utilisateur/Desktop/gestion-matos
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Puis :

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer le service
sudo systemctl enable gestion-matos

# Démarrer le service
sudo systemctl start gestion-matos

# Vérifier le statut
sudo systemctl status gestion-matos
```

## Étape 7 : Configuration du pare-feu (si nécessaire)

```bash
# Autoriser le port 5000
sudo ufw allow 5000

# Ou pour un accès local uniquement
sudo ufw allow from 127.0.0.1 to any port 5000
```

## Accès à l'application

Une fois installée, l'application sera accessible à :
- **Local** : http://localhost:5000
- **Réseau local** : http://IP_DE_VOTRE_MACHINE:5000

## Première utilisation

1. Ouvrez votre navigateur et allez sur http://localhost:5000
2. Cliquez sur "Inscrivez-vous ici"
3. Créez votre premier compte administrateur
4. Connectez-vous et commencez à ajouter du matériel

## Commandes utiles

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en production
npm start

# Voir les logs du service
sudo journalctl -u gestion-matos -f

# Arrêter le service
sudo systemctl stop gestion-matos

# Redémarrer le service
sudo systemctl restart gestion-matos
```

## Sauvegarde

La base de données SQLite se trouve dans `server/database/material.db`. 
Sauvegardez régulièrement ce fichier :

```bash
# Créer une sauvegarde
cp server/database/material.db backup_$(date +%Y%m%d_%H%M%S).db

# Ou automatiser avec cron
echo "0 2 * * * cp /home/votre_utilisateur/Desktop/gestion-matos/server/database/material.db /home/votre_utilisateur/backups/material_$(date +\%Y\%m\%d_\%H\%M\%S).db" | crontab -
```

## Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
npm run dev
# ou
sudo journalctl -u gestion-matos -f
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 5000
sudo lsof -i :5000

# Tuer le processus si nécessaire
sudo kill -9 PID_DU_PROCESSUS
```

### Problèmes de permissions
```bash
# Donner les bonnes permissions
chmod +x server/index.js
chown -R votre_utilisateur:votre_utilisateur .
```