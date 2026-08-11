const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Stock Movement & Auto Update
router.post('/movement', auth, async (req, res) => {
    const { product_id, type, quantity, reason } = req.body;
    const user_id = req.user.id;

    try {
        await db.query('INSERT INTO stock_movements (product_id, user_id, type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
            [product_id, user_id, type, quantity, reason]);

        if (type === 'IN') {
            await db.query('UPDATE products SET current_quantity = current_quantity + ? WHERE id = ?', [quantity, product_id]);
        } else {
            await db.query('UPDATE products SET current_quantity = current_quantity - ? WHERE id = ?', [quantity, product_id]);
        }
        res.status(201).json({ message: 'Stock updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const [[total]] = await db.query('SELECT COUNT(*) as count FROM products');
        const [[lowStock]] = await db.query('SELECT COUNT(*) as count FROM products WHERE current_quantity <= min_stock_level AND current_quantity > 0');
        const [[outStock]] = await db.query('SELECT COUNT(*) as count FROM products WHERE current_quantity = 0');
        
        const [recent] = await db.query(`
            SELECT sm.*, p.name as product_name, u.name as user_name 
            FROM stock_movements sm 
            JOIN products p ON sm.product_id = p.id 
            LEFT JOIN users u ON sm.user_id = u.id 
            ORDER BY sm.created_at DESC LIMIT 5
        `);

        // Inventory Valuation
        const [[finance]] = await db.query('SELECT SUM(current_quantity * buying_price) as asset_value, SUM(current_quantity * selling_price) as potential_revenue FROM products');
        const assetValue = finance.asset_value || 0;
        const potentialRevenue = finance.potential_revenue || 0;
        const potentialProfit = potentialRevenue - assetValue;

        // NEW: Actual Business Financials (Revenue vs Expenses)
        const [[salesData]] = await db.query('SELECT SUM(total_price) as total_revenue FROM sales');
        const [[expenseData]] = await db.query('SELECT SUM(amount) as total_expenses FROM expenses');
        
        const totalRevenue = salesData.total_revenue || 0;
        const totalExpenses = expenseData.total_expenses || 0;
        const netProfit = totalRevenue - totalExpenses;
        
        res.json({ 
            total: total.count, 
            lowStock: lowStock.count, 
            outStock: outStock.count, 
            recent,
            assetValue,
            potentialRevenue,
            potentialProfit,
            totalRevenue,
            totalExpenses,
            netProfit
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all stock movements
router.get('/movements', auth, async (req, res) => {
    try {
        const [movements] = await db.query(`
            SELECT sm.*, p.name as product_name, u.name as user_name 
            FROM stock_movements sm 
            JOIN products p ON sm.product_id = p.id 
            LEFT JOIN users u ON sm.user_id = u.id 
            ORDER BY sm.created_at DESC
        `);
        res.json(movements);
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;