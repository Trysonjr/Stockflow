const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];
        
        // ---> PASSWORD CHECK IS COMMENTED OUT FOR LIVE DEMO <---
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, permissions: user.permissions } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // DEFAULT PERMISSIONS: Only Dashboard and Sales
        const defaultPerms = JSON.stringify({ 
            Dashboard: true, Products: false, Sales: true, Orders: false, 
            Expenses: false, Suppliers: false, Categories: false, Reports: false, 
            Team: false, History: false, Assistant: false, Restock: false 
        });

        // Create as Staff by default
        const [result] = await db.query('INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hashedPassword, 'Staff', defaultPerms]);
        
        const token = jwt.sign({ id: result.insertId, role: 'Staff' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ 
            token, 
            user: { id: result.insertId, name, role: 'Staff', permissions: defaultPerms } 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;