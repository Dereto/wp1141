import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';

export const db = new sqlite3.Database(dbPath);

export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Commute routes table
      db.run(`
        CREATE TABLE IF NOT EXISTS commute_routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          start_address TEXT NOT NULL,
          end_address TEXT NOT NULL,
          start_lat REAL NOT NULL,
          start_lng REAL NOT NULL,
          end_lat REAL NOT NULL,
          end_lng REAL NOT NULL,
          transport_mode TEXT NOT NULL DEFAULT 'driving',
          duration_seconds INTEGER,
          distance_meters INTEGER,
          is_favorite BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Commute history table (for tracking actual commute times)
      db.run(`
        CREATE TABLE IF NOT EXISTS commute_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          route_id INTEGER NOT NULL,
          actual_duration_seconds INTEGER NOT NULL,
          actual_distance_meters INTEGER,
          notes TEXT,
          weather_condition TEXT,
          traffic_level TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (route_id) REFERENCES commute_routes (id) ON DELETE CASCADE
        )
      `);

      console.log('Database tables created successfully');
      resolve();
    });
  });
};
