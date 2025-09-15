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

// --- Security Headers ---
app.use((req, res, next) => {
    // HTTPS 강제 리디렉션 (프로덕션 환경에서만)
    if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    
    // 보안 헤더 설정
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // CSP 헤더 (개발 환경에서는 완화)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://esm.run https://www.google.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data:; " +
            "connect-src 'self'; " +
            "frame-src https://www.google.com;"
        );
    }
    
    next();
});


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


// --- Static File Serving ---
app.use(express.static('../public'));

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
