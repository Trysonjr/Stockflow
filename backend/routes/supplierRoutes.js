const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Get all suppliers
router.get('/', auth, async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name ASC');
        res.json(suppliers);
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add supplier (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { name, contact_info } = req.body;
    try {
        await db.query('INSERT INTO suppliers (name, contact_info) VALUES (?, ?)', [name, contact_info]);
        res.status(201).json({ message: 'Supplier added' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete supplier (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Supplier deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;