import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Obtenir tous les mouvements
router.get('/', (req, res) => {
  const { materialId, userId, type, limit = 50 } = req.query;
  
  let query = `
    SELECT m.*, 
           mat.name as material_name, mat.qr_code as material_qr,
           u.username as user_username, u.first_name, u.last_name,
           p.username as processed_by_username
    FROM movements m
    JOIN materials mat ON m.material_id = mat.id
    JOIN users u ON m.user_id = u.id
    LEFT JOIN users p ON m.processed_by = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (materialId) {
    query += ' AND m.material_id = ?';
    params.push(materialId);
  }
  
  if (userId) {
    query += ' AND m.user_id = ?';
    params.push(userId);
  }
  
  if (type) {
    query += ' AND m.movement_type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY m.movement_date DESC LIMIT ?';
  params.push(parseInt(limit));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    res.json(rows);
  });
});

// Créer un nouveau mouvement (sortie de matériel)
router.post('/checkout', (req, res) => {
  const { materialId, userId, expectedReturnDate, notes } = req.body;

  if (!materialId || !userId) {
    return res.status(400).json({ error: 'ID du matériel et de l\'utilisateur requis' });
  }

  // Vérifier que le matériel est disponible
  db.get('SELECT * FROM materials WHERE id = ? AND status = "available"', [materialId], (err, material) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (!material) {
      return res.status(400).json({ error: 'Matériel non disponible ou inexistant' });
    }

    // Commencer une transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Créer le mouvement de sortie
      db.run(
        `INSERT INTO movements (material_id, user_id, movement_type, expected_return_date, notes, processed_by)
         VALUES (?, ?, 'out', ?, ?, ?)`,
        [materialId, userId, expectedReturnDate, notes, req.user.id],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Échec de la création du mouvement' });
          }

          // Mettre à jour le statut du matériel
          db.run(
            'UPDATE materials SET status = "borrowed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [materialId],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Échec de la mise à jour du matériel' });
              }

              db.run('COMMIT');
              res.status(201).json({
                message: 'Sortie de matériel enregistrée avec succès',
                movementId: this.lastID
              });
            }
          );
        }
      );
    });
  });
});

// Retour de matériel
router.post('/checkin', (req, res) => {
  const { materialId, userId, notes } = req.body;

  if (!materialId || !userId) {
    return res.status(400).json({ error: 'ID du matériel et de l\'utilisateur requis' });
  }

  // Vérifier qu'il y a un mouvement de sortie non retourné
  db.get(
    `SELECT * FROM movements 
     WHERE material_id = ? AND user_id = ? AND movement_type = 'out' 
     AND actual_return_date IS NULL
     ORDER BY movement_date DESC LIMIT 1`,
    [materialId, userId],
    (err, outMovement) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!outMovement) {
        return res.status(400).json({ error: 'Aucune sortie en cours trouvée pour ce matériel et cet utilisateur' });
      }

      // Commencer une transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Créer le mouvement de retour
        db.run(
          `INSERT INTO movements (material_id, user_id, movement_type, notes, processed_by)
           VALUES (?, ?, 'in', ?, ?)`,
          [materialId, userId, notes, req.user.id],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Échec de la création du mouvement de retour' });
            }

            // Mettre à jour le mouvement de sortie avec la date de retour
            db.run(
              'UPDATE movements SET actual_return_date = CURRENT_TIMESTAMP WHERE id = ?',
              [outMovement.id],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Échec de la mise à jour du mouvement de sortie' });
                }

                // Mettre à jour le statut du matériel
                db.run(
                  'UPDATE materials SET status = "available", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                  [materialId],
                  function(err) {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: 'Échec de la mise à jour du matériel' });
                    }

                    db.run('COMMIT');
                    res.status(201).json({
                      message: 'Retour de matériel enregistré avec succès',
                      movementId: this.lastID
                    });
                  }
                );
              }
            );
          }
        );
      });
    }
  );
});

// Obtenir l'historique d'un matériel
router.get('/material/:id/history', (req, res) => {
  const materialId = req.params.id;
  
  db.all(
    `SELECT m.*, 
            u.username as user_username, u.first_name, u.last_name,
            p.username as processed_by_username
     FROM movements m
     JOIN users u ON m.user_id = u.id
     LEFT JOIN users p ON m.processed_by = p.id
     WHERE m.material_id = ?
     ORDER BY m.movement_date DESC`,
    [materialId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }
      res.json(rows);
    }
  );
});

// Obtenir les mouvements d'un utilisateur
router.get('/user/:id/history', (req, res) => {
  const userId = req.params.id;
  
  db.all(
    `SELECT m.*, 
            mat.name as material_name, mat.qr_code as material_qr,
            p.username as processed_by_username
     FROM movements m
     JOIN materials mat ON m.material_id = mat.id
     LEFT JOIN users p ON m.processed_by = p.id
     WHERE m.user_id = ?
     ORDER BY m.movement_date DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }
      res.json(rows);
    }
  );
});

// Obtenir les statistiques des mouvements
router.get('/stats/overview', (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = '';
  const params = [];
  
  if (startDate && endDate) {
    dateFilter = 'WHERE movement_date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  
  db.all(`
    SELECT 
      movement_type,
      COUNT(*) as count,
      DATE(movement_date) as date
    FROM movements 
    ${dateFilter}
    GROUP BY movement_type, DATE(movement_date)
    ORDER BY date DESC
    LIMIT 30
  `, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    res.json(rows);
  });
});

export default router;