const express = require('express');
const { getDb } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const MAX_DOCUMENTS_PER_USER = 50;

// All routes in this file are protected
router.use(authMiddleware);

// Create a new document
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Title is required.' });
    }

    try {
        const db = getDb();
        const count = await db.get('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', req.user.id);
        if (count.count >= MAX_DOCUMENTS_PER_USER) {
            return res.status(403).json({ message: `Document limit of ${MAX_DOCUMENTS_PER_USER} reached.` });
        }

        const result = await db.run(
            'INSERT INTO documents (user_id, title, content) VALUES (?, ?, ?)',
            [req.user.id, title, content || '']
        );
        res.status(201).json({ id: result.lastID, title, content: content || '' });
    } catch (err) {
        console.error('Create document error:', err.message);
        res.status(500).json({ message: 'Server error creating document.' });
    }
});

// Get all documents for a user
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const documents = await db.all(
            'SELECT id, title, updated_at FROM documents WHERE user_id = ? ORDER BY updated_at DESC',
            req.user.id
        );
        res.status(200).json(documents);
    } catch (err) {
        console.error('Get documents error:', err.message);
        res.status(500).json({ message: 'Server error retrieving documents.' });
    }
});

// Get a single document
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const document = await db.get(
            'SELECT id, title, content, created_at, updated_at FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (!document) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }
        res.status(200).json(document);
    } catch (err) {
        console.error('Get single document error:', err.message);
        res.status(500).json({ message: 'Server error retrieving document.' });
    }
});

// Update a document
router.put('/:id', async (req, res) => {
    const { title, content } = req.body;
    if (!title && content === undefined) {
        return res.status(400).json({ message: 'Title or content is required.' });
    }

    try {
        const db = getDb();
        const doc = await db.get('SELECT id FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }

        await db.run(
            'UPDATE documents SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, req.params.id]
        );
        res.status(200).json({ message: 'Document updated successfully.' });
    } catch (err) {
        console.error('Update document error:', err.message);
        res.status(500).json({ message: 'Server error updating document.' });
    }
});

// Delete a document
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();
        const result = await db.run(
            'DELETE FROM documents WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Document not found or access denied.' });
        }
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (err) {
        console.error('Delete document error:', err.message);
        res.status(500).json({ message: 'Server error deleting document.' });
    }
});

module.exports = router;
