const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const router = express.Router();

// @route   GET /api/users
// @desc    Get all team members (Admin only)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users
// @desc    Add a new team member (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'User with this email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role || 'Staff']);
        res.status(201).json({ message: 'Team member added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user role (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    const { role } = req.body;
    try {
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a team member (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;