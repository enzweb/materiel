import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Obtenir le profil de l'utilisateur actuel
router.get('/profile', (req, res) => {
  const userId = req.user.id;
  
  db.get(
    'SELECT id, username, email, first_name, last_name, role, qr_code, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json(user);
    }
  );
});

// Mettre à jour le profil utilisateur
router.put('/profile', (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName } = req.body;

  db.run(
    'UPDATE users SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [firstName, lastName, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Échec de la mise à jour du profil' });
      }

      res.json({ message: 'Profil mis à jour avec succès' });
    }
  );
});

// Obtenir tous les utilisateurs (pour les gestionnaires/admins)
router.get('/', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissions insuffisantes' });
  }

  db.all(
    'SELECT id, username, email, first_name, last_name, role, qr_code, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }
      res.json(users);
    }
  );
});

// Obtenir un utilisateur par ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  
  // Vérifier les permissions (utilisateur peut voir son propre profil, gestionnaires/admins peuvent voir tous)
  if (req.user.id != userId && req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissions insuffisantes' });
  }

  db.get(
    'SELECT id, username, email, first_name, last_name, role, qr_code, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json(user);
    }
  );
});

// Mettre à jour le rôle d'un utilisateur (admin seulement)
router.put('/:id/role', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent modifier les rôles' });
  }

  const userId = req.params.id;
  const { role } = req.body;

  if (!['user', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  db.run(
    'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [role, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Échec de la mise à jour du rôle' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Rôle mis à jour avec succès' });
    }
  );
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent supprimer des utilisateurs' });
  }

  const userId = req.params.id;

  // Empêcher la suppression de son propre compte
  if (req.user.id == userId) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  });
});

export default router;