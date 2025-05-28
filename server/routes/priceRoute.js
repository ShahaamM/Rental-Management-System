const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  const { itemName, model } = req.query;
  try {
    const material = await Material.findOne({ itemName, model });
    if (!material) return res.status(404).json({ price: '' });
    res.json({ price: material.price }); // Make sure Material schema has `price`
  } catch {
    res.status(500).json({ price: '' });
  }
});

module.exports = router;
