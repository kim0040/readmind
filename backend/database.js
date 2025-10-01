// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let db;

/**
 * SQLite 데이터베이스를 열고 필요한 테이블/인덱스를 준비한다.
 */
async function setupDatabase() {
    if (db) {
        return db;
    }

    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        console.log('SQLite 데이터베이스 연결 완료');

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

console.log('사용자/문서 테이블 준비 완료');
        return db;
    } catch (err) {
        console.error('데이터베이스 초기화 중 오류:', err.message);
        throw err;
    }
}

/**
 * setupDatabase() 호출 이후 초기화된 SQLite 커넥션을 반환한다.
 */
function getDb() {
    if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다. setupDatabase()를 먼저 호출하세요.');
    }
    return db;
}

module.exports = { setupDatabase, getDb };
