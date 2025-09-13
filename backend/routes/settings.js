const express = require('express');
const { getDb } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes in this file are protected
router.use(authMiddleware);

// Get user settings
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
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

module.exports = router;
