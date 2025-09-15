// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

async function setupDatabase() {
    if (db) {
        return db;
    }

    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('Connected to the SQLite database.');

        // Create the users table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                settings TEXT DEFAULT '{}'
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // 인덱스 추가
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);
        `);
        
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at);
        `);
        
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
        `);

        console.log('Users and Documents tables are ready.');
        return db;
    } catch (err) {
        console.error('Error setting up database:', err.message);
        throw err;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call setupDatabase() first.');
    }
    return db;
}

module.exports = { setupDatabase, getDb };
