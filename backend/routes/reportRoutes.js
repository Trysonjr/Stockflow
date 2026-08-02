const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Get Analytics Data
router.get('/', auth, async (req, res) => {
    try {
        // 1. 7-Day Sales Trend
        const [salesTrend] = await db.query(`
            SELECT DATE(created_at) as date, SUM(total_price) as revenue 
            FROM sales 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            GROUP BY DATE(created_at) 
            ORDER BY date ASC
        `);

        // 2. Revenue by Category
        const [categoryRevenue] = await db.query(`
            SELECT p.category, SUM(s.total_price) as revenue 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            GROUP BY p.category
        `);

        // 3. Best Sellers (Top 5)
        const [bestSellers] = await db.query(`
            SELECT p.name, SUM(s.quantity) as total_sold, SUM(s.total_price) as total_revenue 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            GROUP BY p.id 
            ORDER BY total_sold DESC 
            LIMIT 5
        `);

        // 4. Profit Margins per Product
        const [profitMargins] = await db.query(`
            SELECT p.name, p.buying_price, p.selling_price, 
            (p.selling_price - p.buying_price) as profit_per_unit,
            ((p.selling_price - p.buying_price) / p.buying_price * 100) as margin_percentage
            FROM products p
            WHERE p.buying_price > 0
            ORDER BY margin_percentage DESC
            LIMIT 5
        `);

        res.json({
            salesTrend,
            categoryRevenue,
            bestSellers,
            profitMargins
        });
    } catch (err) {
        console.error("REPORTS ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;