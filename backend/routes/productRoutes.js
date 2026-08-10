const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Lookup product by barcode (Global Database)
router.get('/barcode/:code', auth, async (req, res) => {
    const barcode = req.params.code;
    try {
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
        const data = await response.json();
        
        if (data.code === "OK" && data.items && data.items.length > 0) {
            const item = data.items[0];
            res.json({
                name: item.title || 'Unknown Product',
                category: item.category || 'General'
            });
        } else {
            res.status(404).json({ message: 'Product not found in global database' });
        }
    } catch (err) {
        console.error("Barcode API Error:", err.message);
        res.status(500).json({ message: 'Failed to lookup barcode' });
    }
});

// Get all products
router.get('/', auth, async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        console.error("DATABASE ERROR:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product
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

// Update product
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

// Delete product
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Import products from Excel
router.post('/import', [auth, admin, upload.single('file')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const values = data.map(row => [
            row.name, row.sku, row.category, 
            Number(row.buying_price), Number(row.selling_price), 
            Number(row.current_quantity), Number(row.min_stock_level)
        ]).filter(v => v[0] && v[1]);

        if (values.length === 0) return res.status(400).json({ message: 'No valid products found in Excel file.' });

        await db.query('INSERT IGNORE INTO products (name, sku, category, buying_price, selling_price, current_quantity, min_stock_level) VALUES ?', [values]);
        res.status(201).json({ message: `Successfully imported ${values.length} products!` });
    } catch (err) {
        console.error("IMPORT ERROR:", err);
        res.status(500).json({ message: 'Server error during import.' });
    }
});

module.exports = router;