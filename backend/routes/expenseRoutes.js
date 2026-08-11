const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Auto-create expenses table
router.use(async (req, res, next) => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database init error' });
    }
});

// Get all expenses
router.get('/', auth, async (req, res) => {
    try {
        const [expenses] = await db.query('SELECT * FROM expenses ORDER BY created_at DESC');
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add expense (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { description, category, amount } = req.body;
    try {
        await db.query('INSERT INTO expenses (description, category, amount) VALUES (?, ?, ?)', [description, category, amount]);
        res.status(201).json({ message: 'Expense recorded' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete expense (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;