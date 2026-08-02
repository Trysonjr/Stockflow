const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Ensure table exists (Auto-creates it if it doesn't)
router.use(async (req, res, next) => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL)`);
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database init error' });
    }
});

// Get all categories
router.get('/', auth, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add category (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Category added' });
    } catch (err) {
        res.status(500).json({ message: 'Server error or category already exists' });
    }
});

// Delete category (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;