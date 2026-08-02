const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Auto-create tables if they don't exist
router.use(async (req, res, next) => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            supplier_id INT,
            status ENUM('Pending', 'Received', 'Cancelled') DEFAULT 'Pending',
            total_cost DECIMAL(10, 2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await db.query(`CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL
        )`);
        next();
    } catch (err) {
        console.error("DB Init Error:", err);
        res.status(500).json({ message: 'Database init error' });
    }
});

// Get all orders
router.get('/', auth, async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, s.name as supplier_name 
            FROM orders o 
            LEFT JOIN suppliers s ON o.supplier_id = s.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new order
router.post('/', [auth, admin], async (req, res) => {
    const { supplier_id, items } = req.body; // items: [{ product_id, quantity, unit_price }]
    
    if (!items || items.length === 0) return res.status(400).json({ message: 'Cannot create an empty order' });

    try {
        // Calculate total cost
        let totalCost = 0;
        items.forEach(item => {
            totalCost += (item.quantity * item.unit_price);
        });

        // Create the Order
        const [orderResult] = await db.query(
            'INSERT INTO orders (supplier_id, total_cost, status) VALUES (?, ?, "Pending")',
            [supplier_id || null, totalCost]
        );
        const orderId = orderResult.insertId;

        // Add items to order_items
        const itemValues = items.map(item => [orderId, item.product_id, item.quantity, item.unit_price]);
        await db.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?', [itemValues]);

        res.status(201).json({ message: 'Order created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark order as received (Updates inventory automatically!)
router.put('/:id/receive', [auth, admin], async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Get all items in the order
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

        // 2. Update product quantities and log stock movements
        for (const item of items) {
            await db.query('UPDATE products SET current_quantity = current_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
            
            await db.query(
                'INSERT INTO stock_movements (product_id, user_id, type, quantity, reason) VALUES (?, ?, "IN", ?, ?)',
                [item.product_id, userId, item.quantity, `Received from PO #${orderId}`]
            );
        }

        // 3. Update order status
        await db.query('UPDATE orders SET status = "Received" WHERE id = ?', [orderId]);

        res.json({ message: 'Order received and inventory updated!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete order (if pending)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const [order] = await db.query('SELECT status FROM orders WHERE id = ?', [req.params.id]);
        if (order.length > 0 && order[0].status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot delete an order that is already received or cancelled' });
        }
        await db.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;