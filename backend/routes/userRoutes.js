const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// Auto-add permissions column if it doesn't exist
router.use(async (req, res, next) => {
    try {
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS (permissions TEXT NULL)`);
        next();
    } catch (err) { next(); }
});

// Get all team members
router.get('/', [auth, admin], async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, permissions, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Add a new team member
router.post('/', [auth, admin], async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // DEFAULT PERMISSIONS: Only Dashboard and Sales
        const defaultPerms = JSON.stringify({ 
            Dashboard: true, Products: false, Sales: true, Orders: false, 
            Expenses: false, Suppliers: false, Categories: false, Reports: false, 
            Team: false, History: false, Assistant: false, Restock: false 
        });

        await db.query('INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hashedPassword, role || 'Staff', defaultPerms]);
        
        res.status(201).json({ message: 'Team member added successfully' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Update user role or permissions
router.put('/:id', [auth, admin], async (req, res) => {
    const { role, permissions } = req.body;
    try {
        if (role) await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        if (permissions) await db.query('UPDATE users SET permissions = ? WHERE id = ?', [JSON.stringify(permissions), req.params.id]);
        res.json({ message: 'User updated successfully' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// Delete a team member
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;