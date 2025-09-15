const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    // Check for "Bearer " prefix and extract token
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7, authHeader.length) : null;

    if (!token) {
        return res.status(401).json({ message: 'Token format is invalid.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid.' });
    }
}

module.exports = auth;
