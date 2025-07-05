import express from 'express';
import QRCode from 'qrcode';
import { db } from '../database/init.js';

const router = express.Router();

// Générer un QR code pour un matériel
router.get('/material/:id', async (req, res) => {
  const materialId = req.params.id;
  
  try {
    // Récupérer les informations du matériel
    db.get('SELECT * FROM materials WHERE id = ?', [materialId], async (err, material) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!material) {
        return res.status(404).json({ error: 'Matériel non trouvé' });
      }

      try {
        // Générer le QR code
        const qrCodeData = JSON.stringify({
          type: 'material',
          id: material.id,
          qrCode: material.qr_code,
          name: material.name
        });

        const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        res.json({
          qrCode: qrCodeImage,
          data: qrCodeData,
          material: material
        });
      } catch (qrError) {
        res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer un QR code pour un utilisateur
router.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  
  // Vérifier les permissions
  if (req.user.id != userId && req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permissions insuffisantes' });
  }

  try {
    // Récupérer les informations de l'utilisateur
    db.get('SELECT id, username, first_name, last_name, qr_code FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de base de données' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      try {
        // Générer le QR code
        const qrCodeData = JSON.stringify({
          type: 'user',
          id: user.id,
          qrCode: user.qr_code,
          username: user.username
        });

        const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        res.json({
          qrCode: qrCodeImage,
          data: qrCodeData,
          user: user
        });
      } catch (qrError) {
        res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Scanner et décoder un QR code
router.post('/scan', (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    return res.status(400).json({ error: 'Données QR requises' });
  }

  try {
    const parsedData = JSON.parse(qrData);
    
    if (parsedData.type === 'material') {
      // Vérifier que le matériel existe
      db.get('SELECT * FROM materials WHERE qr_code = ?', [parsedData.qrCode], (err, material) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        if (!material) {
          return res.status(404).json({ error: 'Matériel non trouvé' });
        }

        res.json({
          type: 'material',
          data: material
        });
      });
    } else if (parsedData.type === 'user') {
      // Vérifier que l'utilisateur existe
      db.get('SELECT id, username, first_name, last_name, qr_code FROM users WHERE qr_code = ?', [parsedData.qrCode], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur de base de données' });
        }

        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
          type: 'user',
          data: user
        });
      });
    } else {
      res.status(400).json({ error: 'Type de QR code non reconnu' });
    }
  } catch (parseError) {
    res.status(400).json({ error: 'Format de QR code invalide' });
  }
});

export default router;