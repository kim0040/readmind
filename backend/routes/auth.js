const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const captchaVerification = require('../middleware/captcha_verification');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

/**
 * README에 명시된 강력한 비밀번호 정책을 검증한다.
 */
const validatePassword = (password) => {
    // 최소 8자, 대문자/소문자/숫자/특수문자 각 1자 이상 포함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordRegex.test(password);
};

// 회원가입 엔드포인트
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

        // 회원가입 완료와 동시에 JWT를 발급하여 로그인 처리
        const payload = {
            user: { id: newUserId, email: email },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            token,
        });
    } catch (err) {
        console.error('회원가입 처리 중 오류:', err.message);
        res.status(500).json({ error_code: 'SERVER_ERROR_SIGNUP' });
    }
});

// 로그인 엔드포인트
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

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            message: '로그인에 성공했습니다.',
            token,
        });
    } catch (err) {
        console.error('로그인 처리 중 오류:', err.message);
        res.status(500).json({ error_code: 'SERVER_ERROR_LOGIN' });
    }
});

// 토큰 갱신 엔드포인트
router.post('/refresh', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error_code: 'TOKEN_REQUIRED' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDb();
        const user = await db.get('SELECT id, email FROM users WHERE id = ?', decoded.user.id);
        
        if (!user) {
            return res.status(401).json({ error_code: 'USER_NOT_FOUND' });
        }
        
        // Generate new token
        const payload = {
            user: { id: user.id, email: user.email },
        };
        
        const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        
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
            console.error('토큰 갱신 중 오류:', err.message);
            return res.status(500).json({ error_code: 'SERVER_ERROR_REFRESH' });
        }
    }
});

module.exports = router;
