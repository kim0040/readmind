// backend/server.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
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
    origin: process.env.CORS_ORIGIN || '*', // 설정이 없으면 개발 편의를 위해 전체 허용
};
app.use(cors(corsOptions));
app.use(express.json()); // JSON 본문 파싱용 미들웨어

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
    windowMs: 15 * 60 * 1000, // 15분
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: '요청이 너무 많습니다. 15분 후 다시 시도해주세요.',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 20, // CAPTCHA 재시도 등을 고려해 약간 여유를 둠
    standardHeaders: true,
    legacyHeaders: false,
    message: '인증 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
});


// --- Static File Serving ---
const publicDir = path.join(__dirname, '..', 'public');
// 작업 디렉터리에 관계없이 번들된 SPA 정적 파일을 제공
app.use(express.static(publicDir));

// --- API 라우트 설정 ---
app.use('/api', apiLimiter); // 모든 API 요청에 대한 기본 Rate Limit 적용

app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes); // 인증 라우트에는 더 강한 제한 적용
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);


// --- Server Initialization ---
async function startServer() {
    try {
        await setupDatabase();
        app.listen(PORT, () => {
            console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
        });
    } catch (err) {
        console.error('서버 시작 중 오류가 발생했습니다:', err);
        process.exit(1);
    }
}

startServer();
