// backend/server.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { setupDatabase } = require('./database');

// --- Route Imports ---
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const settingsRoutes = require('./routes/settings');


// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;


// --- Core Middleware ---
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // Default to all for development if not set
};
app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON bodies


// --- Security Middleware ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Increased slightly to accommodate captcha retries etc.
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
});


// --- API Route Setup ---
app.use('/api', apiLimiter); // Apply general rate limiting to all API routes

app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter limiting to auth routes
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);


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
