const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';

/**
 * 보호된 라우트에 접근하기 전 유효한 Bearer 토큰이 있는지 확인한다.
 */
function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: '토큰이 없어 인증에 실패했습니다.' });
    }

    // "Bearer " 접두어를 확인하고 토큰을 추출
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7, authHeader.length) : null;

    if (!token) {
        return res.status(401).json({ message: '토큰 형식이 올바르지 않습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ message: '토큰이 유효하지 않습니다.' });
    }
}

module.exports = auth;
