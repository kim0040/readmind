// backend/server.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setupDatabase, getDb } = require('./database');
const authMiddleware = require('./middleware/auth');
const captchaVerification = require('./middleware/captcha_verification');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- Security Middleware ---

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth-related requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login or signup attempts from this IP, please try again after 15 minutes',
});

app.use('/api/', apiLimiter);
app.use('/api/signup', authLimiter);
app.use('/api/login', authLimiter);


// --- API Routes ---

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running.' });
});

// Signup endpoint
app.post('/api/signup', captchaVerification, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const db = getDb();
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.run(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [email, passwordHash]
        );
        const newUserId = result.lastID;

        // Also log the user in by returning a JWT
        const payload = {
            user: {
                id: newUserId,
                email: email,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({
            message: 'User created successfully.',
            token,
        });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// Login endpoint
app.post('/api/login', captchaVerification, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const db = getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const payload = {
            user: {
                id: user.id,
                email: user.email,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d', // Token expires in 7 days
        });

        res.status(200).json({
            message: 'Login successful.',
            token,
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Settings Routes (Protected) ---

// Get user settings
app.get('/api/settings', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.get('SELECT settings FROM users WHERE id = ?', req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(JSON.parse(user.settings || '{}'));
    } catch (err) {
        console.error('Get settings error:', err.message);
        res.status(500).json({ message: 'Server error retrieving settings.' });
    }
});

// Update user settings
app.post('/api/settings', authMiddleware, async (req, res) => {
    const { settings } = req.body;
    if (!settings) {
        return res.status(400).json({ message: 'Settings object is required.' });
    }

    try {
        const db = getDb();
        await db.run(
            'UPDATE users SET settings = ? WHERE id = ?',
            [JSON.stringify(settings), req.user.id]
        );
        res.status(200).json({ message: 'Settings updated successfully.' });
    } catch (err) {
        console.error('Update settings error:', err.message);
        res.status(500).json({ message: 'Server error updating settings.' });
    }
});

// --- Document CRUD Routes (Protected) ---

const MAX_DOCUMENTS_PER_USER = 50;

// Create a new document
app.post('/api/documents', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    try {
        const db = getDb();

        // Check document count limit
        const count = await db.get('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', req.user.id);
        if (count.count >= MAX_DOCUMENTS_PER_USER) {
            return res.status(403).json({ message: `Document limit of ${MAX_DOCUMENTS_PER_USER} reached.` });
        }

        const result = await db.run(
            'INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)',
            [req.user.id, title, content || '']
        );
        res.status(201).json({ id: result.lastID, title, content: content || '' });
    } catch (err) {
        console.error('Create document error:', err.message);
        res.status(500).json({ message: 'Server error creating document.' });
    }
});

// Get all documents for a user
app.get('/api/documents', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const documents = await db.all(
            'SELECT id, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
            req.user.id
        );
        res.status(200).json(documents);
    } catch (err) {
        console.error('Get documents error:', err.message);
        res.status(500).json({ message: 'Server error retrieving documents.' });
    }
});

// Get a single document
app.get('/api/documents/:id', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const document = await db.get(
            'SELECT id, title, content, created_at, updated_at FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (!document) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }
        res.status(200).json(document);
    } catch (err) {
        console.error('Get single document error:', err.message);
        res.status(500).json({ message: 'Server error retrieving document.' });
    }
});

// Update a document
app.put('/api/documents/:id', authMiddleware, async (req, res) => {
    const { title, content } = req.body;
    if (!title && content === undefined) {
        return res.status(400).json({ message: 'Title or content is required.' });
    }

    try {
        const db = getDb();
        // First, verify the document belongs to the user
        const doc = await db.get('SELECT id FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }

        await db.run(
            'UPDATE documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, req.params.id]
        );
        res.status(200).json({ message: 'Document updated successfully.' });
    } catch (err) {
        console.error('Update document error:', err.message);
        res.status(500).json({ message: 'Server error updating document.' });
    }
});

// Delete a document
app.delete('/api/documents/:id', authMiddleware, async (req, res) => {
    try {
        const db = getDb();
        const result = await db.run(
            'DELETE FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (err) {
        console.error('Delete document error:', err.message);
        res.status(500).json({ message: 'Server error deleting document.' });
    }
});


// --- Server Initialization ---
async function startServer() {
    try {
        await setupDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
