import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';
import { generateQRCode } from '../utils/qrGenerator.js';

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'user' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur, email et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
      }

      // Hacher le mot de passe
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Générer un QR code unique pour l'utilisateur
      const userQRCode = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Créer l'utilisateur
      db.run(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, role, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, firstName, lastName, role, userQRCode],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Échec de la création de l\'utilisateur' });
          }

          // Générer le token JWT
          const token = jwt.sign(
            { id: this.lastID, username, email, role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
              id: this.lastID,
              username,
              email,
              firstName,
              lastName,
              role,
              qrCode: userQRCode
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    // Trouver l'utilisateur
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Vérifier le mot de passe
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          qrCode: user.qr_code
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;