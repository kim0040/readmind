const express = require('express');
const { getDb } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
// 문서 관련 CRUD를 인증된 사용자 범위에서 제공하는 라우터
const MAX_DOCUMENTS_PER_USER = 50;

// 이하 모든 라우트는 인증이 필요
router.use(authMiddleware);

// 새 문서 생성
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({ message: '제목을 입력해야 합니다.' });
    }

    try {
        const db = getDb();
        const count = await db.get('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', req.user.id);
        if (count.count >= MAX_DOCUMENTS_PER_USER) {
            return res.status(403).json({ message: `문서는 최대 ${MAX_DOCUMENTS_PER_USER}개까지 생성할 수 있습니다.` });
        }

        const result = await db.run(
            'INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)',
            [req.user.id, title, content || '']
        );
        res.status(201).json({ id: result.lastID, title, content: content || '' });
    } catch (err) {
        console.error('문서 생성 중 오류:', err.message);
        res.status(500).json({ message: '문서를 생성하는 중 서버 오류가 발생했습니다.' });
    }
});

// 사용자 문서 목록 조회
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const documents = await db.all(
            'SELECT id, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
            req.user.id
        );
        res.status(200).json(documents);
    } catch (err) {
        console.error('문서 목록 조회 중 오류:', err.message);
        res.status(500).json({ message: '문서 목록을 불러오는 중 서버 오류가 발생했습니다.' });
    }
});

// 단일 문서 조회
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const document = await db.get(
            'SELECT id, title, content, created_at, updated_at FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (!document) {
            return res.status(404).json({ message: '문서를 찾을 수 없거나 권한이 없습니다.' });
        }
        res.status(200).json(document);
    } catch (err) {
        console.error('문서 조회 중 오류:', err.message);
        res.status(500).json({ message: '문서를 불러오는 중 서버 오류가 발생했습니다.' });
    }
});

// 문서 수정
router.put('/:id', async (req, res) => {
    const { title, content } = req.body;
    if (!title && content === undefined) {
        return res.status(400).json({ message: '제목 또는 내용을 입력해야 합니다.' });
    }

    try {
        const db = getDb();
        const doc = await db.get('SELECT id FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!doc) {
            return res.status(404).json({ message: '문서를 찾을 수 없거나 권한이 없습니다.' });
        }

        await db.run(
            'UPDATE documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, req.params.id]
        );
        res.status(200).json({ message: '문서가 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error('문서 수정 중 오류:', err.message);
        res.status(500).json({ message: '문서를 수정하는 중 서버 오류가 발생했습니다.' });
    }
});

// 문서 삭제
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.run(
            'DELETE FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: '문서를 찾을 수 없거나 권한이 없습니다.' });
        }
        res.status(200).json({ message: '문서가 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error('문서 삭제 중 오류:', err.message);
        res.status(500).json({ message: '문서를 삭제하는 중 서버 오류가 발생했습니다.' });
    }
});

module.exports = router;
