// routes/suggestions.js
const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Customer = require('../models/Customer');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/suggestions?field=customerName&query=abc
router.get('/', verifyToken, async (req, res) => {
  const { field, query } = req.query;
  try {
    if (field === 'customerName') {
      const results = await Customer.find({ name: { $regex: query, $options: 'i' } }).limit(10);
      return res.json(results.map(c => c.name));
    }

    if (field === 'itemName') {
      const results = await Material.find({ itemName: { $regex: query, $options: 'i' } }).limit(10);
      return res.json([...new Set(results.map(m => m.itemName))]);
    }

    if (field === 'model') {
      const results = await Material.find({ model: { $regex: query, $options: 'i' } }).limit(10);
      return res.json([...new Set(results.map(m => m.model))]);
    }

    res.status(400).json({ message: 'Invalid field' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;