const express = require('express');
const Customer = require('../models/Customer');
const Material = require('../models/Material');
const router = express.Router();

router.get('/', async (req, res) => {
  const { field, query } = req.query;

  if (!field || !query) {
    return res.status(400).json({ message: 'Missing field or query' });
  }

  try {
    let results = [];

    if (field === 'customerName') {
      results = await Customer.find({ name: { $regex: query, $options: 'i' } }).limit(10).distinct('name');
    } else if (field === 'itemName') {
      results = await Material.find({ itemName: { $regex: query, $options: 'i' } }).limit(10).distinct('itemName');
    } else if (field === 'model') {
      results = await Material.find({ model: { $regex: query, $options: 'i' } }).limit(10).distinct('model');
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch suggestions', error: err.message });
  }
});

module.exports = router;
