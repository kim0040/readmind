// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { setupDatabase, getDb } = require('./database');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Routes ---

// Signup endpoint
app.post('/api/signup', async (req, res) => {
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

        res.status(201).json({ message: 'User created successfully.', userId: result.lastID });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
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
