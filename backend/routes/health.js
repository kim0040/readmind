const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running.' });
});

module.exports = router;
