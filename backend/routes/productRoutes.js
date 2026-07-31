const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Get all products (Everyone can view)
router.get('/', auth, async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { name, sku, category, buying_price, selling_price, current_quantity, min_stock_level } = req.body;
    try {
        await db.query(
            'INSERT INTO products (name, sku, category, buying_price, selling_price, current_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, sku, category, buying_price, selling_price, current_quantity, min_stock_level]
        );
        res.status(201).json({ message: 'Product added' });
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    const { name, sku, category, buying_price, selling_price, current_quantity, min_stock_level } = req.body;
    try {
        await db.query(
            'UPDATE products SET name = ?, sku = ?, category = ?, buying_price = ?, selling_price = ?, current_quantity = ?, min_stock_level = ? WHERE id = ?',
            [name, sku, category, buying_price, selling_price, current_quantity, min_stock_level, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;