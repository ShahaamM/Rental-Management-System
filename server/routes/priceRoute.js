// backend/routes/priceRoute.js
const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

router.get('/price', async (req, res) => {
  const { itemName, model } = req.query;
  if (!itemName || !model) return res.status(400).json({ message: 'Missing itemName or model' });

  try {
    const material = await Material.findOne({ itemName, model });
    if (!material) return res.status(404).json({ message: 'Material not found' });

    res.json({ price: material.price });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch price' });
  }
});

module.exports = router;
