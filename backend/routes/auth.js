const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const captchaVerification = require('../middleware/captcha_verification');

const router = express.Router();

// Signup endpoint
router.post('/signup', captchaVerification, async (req, res) => {
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
            user: { id: newUserId, email: email },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

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
router.post('/login', captchaVerification, async (req, res) => {
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
            user: { id: user.id, email: user.email },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful.',
            token,
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
