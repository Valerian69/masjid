const bcrypt = require('bcryptjs');
const { dbHelpers } = require('../database');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const router = require('express').Router();
const JWT_SECRET = process.env.JWT_SECRET || 'masjid-dashboard-secret-key-2026';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await dbHelpers.findAll('users');
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await dbHelpers.findById('users', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...rest } = user;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user', detail: err.message });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await dbHelpers.findAll('users');
    res.json(users.map(({ password, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users', detail: err.message });
  }
});

router.post('/users', auth, async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    const users = await dbHelpers.findAll('users');
    const existing = users.find(u => u.username === username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await dbHelpers.insert('users', { username, password: hashedPassword, full_name, role });
    const { password: _, ...rest } = user;
    res.json(rest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', detail: err.message });
  }
});

router.put('/users/:id', auth, async (req, res) => {
  try {
    const { full_name, role, password } = req.body;
    const id = req.params.id;
    const updateData = { full_name, role };
    if (password) updateData.password = bcrypt.hashSync(password, 10);
    await dbHelpers.update('users', id, updateData);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', detail: err.message });
  }
});

router.delete('/users/:id', auth, async (req, res) => {
  try {
    await dbHelpers.remove('users', req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', detail: err.message });
  }
});

module.exports = router;
