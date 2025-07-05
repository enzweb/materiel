import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import materialRoutes from './routes/materials.js';
import movementRoutes from './routes/movements.js';
import userRoutes from './routes/users.js';
import qrRoutes from './routes/qr.js';
import { initializeDatabase } from './database/init.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
});

app.use('/api/', limiter);

// Configuration CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialiser la base de données
await initializeDatabase();

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/materials', authenticateToken, materialRoutes);
app.use('/api/movements', authenticateToken, movementRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/qr', authenticateToken, qrRoutes);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../dist')));

// Endpoint de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestionnaire catch-all pour le routage côté client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Une erreur est survenue !', 
    ...(process.env.NODE_ENV !== 'production' && { details: err.message })
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Serveur GestionMatos en cours d'exécution sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
});