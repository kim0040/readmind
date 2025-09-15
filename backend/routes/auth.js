const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const captchaVerification = require('../middleware/captcha_verification');

const router = express.Router();

const validatePassword = (password) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordRegex.test(password);
};

// Signup endpoint
router.post('/signup', captchaVerification, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error_code: 'EMAIL_PASSWORD_REQUIRED' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error_code: 'WEAK_PASSWORD' });
    }

    try {
        const db = getDb();
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ error_code: 'EMAIL_IN_USE' });
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

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully.',
            token,
        });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ error_code: 'SERVER_ERROR_SIGNUP' });
    }
});

// Login endpoint
router.post('/login', captchaVerification, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error_code: 'EMAIL_PASSWORD_REQUIRED' });
    }

    try {
        const db = getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            return res.status(401).json({ error_code: 'INVALID_CREDENTIALS' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error_code: 'INVALID_CREDENTIALS' });
        }

        // Generate JWT
        const payload = {
            user: { id: user.id, email: user.email },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            message: 'Login successful.',
            token,
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error_code: 'SERVER_ERROR_LOGIN' });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error_code: 'TOKEN_REQUIRED' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = getDb();
        const user = await db.get('SELECT id, email FROM users WHERE id = ?', decoded.user.id);
        
        if (!user) {
            return res.status(401).json({ error_code: 'USER_NOT_FOUND' });
        }
        
        // Generate new token
        const payload = {
            user: { id: user.id, email: user.email },
        };
        
        const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(200).json({
            message: 'Token refreshed successfully.',
            token: newToken,
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error_code: 'TOKEN_EXPIRED' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error_code: 'INVALID_TOKEN' });
        } else {
            console.error('Token refresh error:', err.message);
            return res.status(500).json({ error_code: 'SERVER_ERROR_REFRESH' });
        }
    }
});

module.exports = router;
