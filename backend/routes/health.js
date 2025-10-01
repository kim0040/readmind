const express = require('express');
const router = express.Router();

// 로드 밸런서 및 상태 점검을 위한 헬스 체크 엔드포인트
router.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: '백엔드가 정상적으로 동작 중입니다.' });
});

module.exports = router;
