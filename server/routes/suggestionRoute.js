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
      const results = await Customer.find().select('name -_id');
      data = results.map(r => r.name);
    } else if (field === 'itemName') {
      const results = await Material.find().select('itemName -_id');
      data = [...new Set(results.map(r => r.itemName))]; // remove duplicates
    } else if (field === 'model') {
      const results = await Material.find().select('model -_id');
      data = [...new Set(results.map(r => r.model))]; // remove duplicates
    } else {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.4, // lower = stricter, higher = looser match
    });

    const fuzzyResults = fuse.search(query).map(result => result.item);
    res.json(fuzzyResults.slice(0, 5)); // return top 5 matches
  } catch (err) {
    console.error('Fuse.js suggestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
