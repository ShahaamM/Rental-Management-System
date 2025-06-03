const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const Material = require('../models/Material');
const Customer = require('../models/Customer');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/suggestions?field=customerName&query=abc
router.get('/', verifyToken, async (req, res) => {
  const { field, query } = req.query;
  if (!field || !query) return res.status(400).json([]);

  try {
    let data = [];

    if (field === 'customerName') {
      const results = await Customer.find({}, 'name mobile nicOrLicense');
      const fuse = new Fuse(results, {
        keys: ['name'],
        includeScore: true,
        threshold: 0.4
      });
      const fuzzyResults = fuse.search(query).map(result => result.item);
      return res.json(fuzzyResults.slice(0, 5));
    }

    if (field === 'itemName') {
      const results = await Material.find().select('itemName -_id');
      data = [...new Set(results.map(r => r.itemName))];
    } else if (field === 'model') {
      const results = await Material.find().select('model -_id');
      data = [...new Set(results.map(r => r.model))];
    } else {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.4
    });

    const fuzzyResults = fuse.search(query).map(result => result.item);
    res.json(fuzzyResults.slice(0, 5));
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ NEW: GET price by itemName and model
router.get('/price', verifyToken, async (req, res) => {
  const { itemName, model } = req.query;

  try {
    const material = await Material.findOne({ itemName, model });
    if (!material) return res.status(404).json({ price: '' });
    res.json({ price: material.price });
  } catch (err) {
    console.error('Price lookup error:', err);
    res.status(500).json({ message: 'Failed to fetch price' });
  }
});

module.exports = router;
