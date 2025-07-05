import express from 'express';
import { db } from '../database/init.js';

const router = express.Router();

// Générer un QR code unique pour le matériel
const generateMaterialQRCode = () => {
  return `MAT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Obtenir tout le matériel
router.get('/', (req, res) => {
  const { status, category, search } = req.query;
  
  let query = `
    SELECT m.*, c.name as category_name, c.color as category_color,
           u.username as created_by_username
    FROM materials m
    LEFT JOIN categories c ON m.category = c.name
    LEFT JOIN users u ON m.created_by = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND m.status = ?';
    params.push(status);
  }
  
  if (category) {
    query += ' AND m.category = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND (m.name LIKE ? OR m.description LIKE ? OR m.serial_number LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY m.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    res.json(rows);
  });
});

// Obtenir un matériel par ID
router.get('/:id', (req, res) => {
  const materialId = req.params.id;
  
  db.get(
    `SELECT m.*, c.name as category_name, c.color as category_color,
            u.username as created_by_username
     FROM materials m
     LEFT JOIN categories c ON m.category = c.name
     LEFT JOIN users u ON m.created_by = u.id
     WHERE m.id = ?`,
    [materialId],
    (err, material) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!material) {
        return res.status(404).json({ error: 'Matériel non trouvé' });
      }

      res.json(material);
    }
  );
});

// Créer un nouveau matériel
router.post('/', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissions insuffisantes' });
  }

  const {
    name,
    description,
    category,
    serialNumber,
    location,
    purchaseDate,
    purchasePrice
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom du matériel est requis' });
  }

  const qrCode = generateMaterialQRCode();

  db.run(
    `INSERT INTO materials (
      name, description, category, serial_number, qr_code, location,
      purchase_date, purchase_price, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, description, category, serialNumber, qrCode, location,
      purchaseDate, purchasePrice, req.user.id
    ],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Numéro de série déjà utilisé' });
        }
        return res.status(500).json({ error: 'Échec de la création du matériel' });
      }

      res.status(201).json({
        message: 'Matériel créé avec succès',
        material: {
          id: this.lastID,
          name,
          description,
          category,
          serialNumber,
          qrCode,
          location,
          purchaseDate,
          purchasePrice,
          status: 'available',
          createdBy: req.user.id
        }
      });
    }
  );
});

// Mettre à jour un matériel
router.put('/:id', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissions insuffisantes' });
  }

  const materialId = req.params.id;
  const {
    name,
    description,
    category,
    serialNumber,
    status,
    location,
    purchaseDate,
    purchasePrice
  } = req.body;

  db.run(
    `UPDATE materials SET 
      name = ?, description = ?, category = ?, serial_number = ?,
      status = ?, location = ?, purchase_date = ?, purchase_price = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      name, description, category, serialNumber, status, location,
      purchaseDate, purchasePrice, materialId
    ],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Numéro de série déjà utilisé' });
        }
        return res.status(500).json({ error: 'Échec de la mise à jour du matériel' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Matériel non trouvé' });
      }

      res.json({ message: 'Matériel mis à jour avec succès' });
    }
  );
});

// Supprimer un matériel
router.delete('/:id', (req, res) => {
  // Vérifier les permissions
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent supprimer du matériel' });
  }

  const materialId = req.params.id;

  db.run('DELETE FROM materials WHERE id = ?', [materialId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Matériel non trouvé' });
    }

    res.json({ message: 'Matériel supprimé avec succès' });
  });
});

// Obtenir les catégories
router.get('/categories/list', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    res.json(rows);
  });
});

// Obtenir les statistiques du matériel
router.get('/stats/overview', (req, res) => {
  db.all(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost,
      category,
      COUNT(*) as count
    FROM materials 
    GROUP BY category
    UNION ALL
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost,
      'TOTAL' as category,
      COUNT(*) as count
    FROM materials
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur de base de données' });
    }
    res.json(rows);
  });
});

export default router;