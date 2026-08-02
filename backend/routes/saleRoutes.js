const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Auto-create sales table with teller_id
router.use(async (req, res, next) => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            teller_id INT NOT NULL,
            quantity INT NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database init error' });
    }
});

// Get all sales (Include Teller Name)
router.get('/', auth, async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT s.*, p.name as product_name, u.name as teller_name 
            FROM sales s 
            JOIN products p ON s.product_id = p.id 
            JOIN users u ON s.teller_id = u.id 
            ORDER BY s.created_at DESC
        `);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new sale (Supports MULTIPLE items)
router.post('/', auth, async (req, res) => {
    const { items } = req.body; // items: [{ product_id, quantity }]
    const tellerId = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    try {
        const receiptItems = [];
        let grandTotal = 0;
        let firstSaleId = 0;

        // Loop through each item in the cart
        for (const item of items) {
            const [products] = await db.query('SELECT * FROM products WHERE id = ?', [item.product_id]);
            if (products.length === 0) continue; // Skip if product doesn't exist
            
            const product = products[0];
            if (product.current_quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.current_quantity} left.` });
            }

            const totalPrice = product.selling_price * item.quantity;
            grandTotal += totalPrice;

            // Record sale
            const [saleResult] = await db.query(
                'INSERT INTO sales (product_id, teller_id, quantity, total_price) VALUES (?, ?, ?, ?)', 
                [item.product_id, tellerId, item.quantity, totalPrice]
            );
            
            if (firstSaleId === 0) firstSaleId = saleResult.insertId;

            // Deduct stock and log movement
            await db.query('UPDATE products SET current_quantity = current_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
            await db.query('INSERT INTO stock_movements (product_id, user_id, type, quantity, reason) VALUES (?, ?, "OUT", ?, ?)', [item.product_id, tellerId, item.quantity, 'POS Sale']);

            // Add to receipt array
            receiptItems.push({
                sale_id: saleResult.insertId,
                product_name: product.name,
                quantity: item.quantity,
                total_price: totalPrice
            });
        }

        // Return the grouped receipt data
        res.status(201).json({ 
            message: 'Sale recorded successfully!',
            receipt: {
                receipt_id: firstSaleId, // Use the first ID as the receipt number
                items: receiptItems,
                grand_total: grandTotal,
                teller_name: req.user.name,
                timestamp: new Date().toLocaleString()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;