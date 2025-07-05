import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'material.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite');
  }
});

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          role TEXT DEFAULT 'user' CHECK(role IN ('user', 'manager', 'admin')),
          qr_code TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table du matériel
      db.run(`
        CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          serial_number TEXT UNIQUE,
          qr_code TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'available' CHECK(status IN ('available', 'borrowed', 'maintenance', 'lost')),
          location TEXT,
          purchase_date DATE,
          purchase_price DECIMAL(10,2),
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Table des mouvements (entrées/sorties)
      db.run(`
        CREATE TABLE IF NOT EXISTS movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          material_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          movement_type TEXT NOT NULL CHECK(movement_type IN ('out', 'in')),
          movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expected_return_date DATE,
          actual_return_date DATE,
          notes TEXT,
          processed_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (processed_by) REFERENCES users (id)
        )
      `);

      // Table des catégories
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Créer les index pour de meilleures performances
      db.run(`CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_movements_material_id ON movements(material_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_movements_user_id ON movements(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(movement_date)`);

      // Insérer des catégories par défaut
      db.run(`
        INSERT OR IGNORE INTO categories (name, description, color) VALUES 
        ('Informatique', 'Ordinateurs, tablettes, accessoires', '#3B82F6'),
        ('Audiovisuel', 'Caméras, micros, éclairage', '#10B981'),
        ('Mobilier', 'Tables, chaises, rangements', '#F59E0B'),
        ('Outils', 'Outillage divers', '#EF4444'),
        ('Véhicules', 'Voitures, vélos, trottinettes', '#8B5CF6'),
        ('Sport', 'Équipements sportifs', '#06B6D4'),
        ('Autre', 'Matériel non catégorisé', '#6B7280')
      `);

      resolve();
    });
  });
}