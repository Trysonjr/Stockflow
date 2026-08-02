const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid User' });

        const user = users[0];
        
        // --->  PASSWORD CHECK  <---
         //const isMatch = await bcrypt.compare(password, user.password);
         //if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        // Create and send JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) return res.status(400).json({ message: 'User already exists' });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to database (Default role: Admin so they can see all features)
        const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'Admin']);
        
        // Create and send JWT
        const token = jwt.sign({ id: result.insertId, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: result.insertId, name, role: 'Admin' } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;