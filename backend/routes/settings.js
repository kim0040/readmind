const express = require('express');
const { getDb } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// SQLite에 저장되는 사용자별 읽기 환경 설정을 관리하는 라우터

// 이하 모든 라우트는 인증이 필요
router.use(authMiddleware);

// 사용자 설정 조회
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const user = await db.get('SELECT settings FROM users WHERE id = ?', req.user.id);
        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        res.status(200).json(JSON.parse(user.settings || '{}'));
    } catch (err) {
        console.error('설정 조회 중 오류:', err.message);
        res.status(500).json({ message: '설정을 불러오는 중 서버 오류가 발생했습니다.' });
    }
});

// 사용자 설정 수정
router.post('/', async (req, res) => {
    const { settings } = req.body;
    if (!settings) {
        return res.status(400).json({ message: '설정 객체가 필요합니다.' });
    }

    try {
        const db = getDb();
        await db.run(
            'UPDATE users SET settings = ? WHERE id = ?',
            [JSON.stringify(settings), req.user.id]
        );
        res.status(200).json({ message: '설정이 성공적으로 저장되었습니다.' });
    } catch (err) {
        console.error('설정 업데이트 중 오류:', err.message);
        res.status(500).json({ message: '설정을 저장하는 중 서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
