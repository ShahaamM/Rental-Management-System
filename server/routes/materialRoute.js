// routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const verifyToken = require('../middleware/authMiddleware');

// GET all materials (public)
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch materials' });
  }
});

// GET one material by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch material' });
  }
});

// POST create new material (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newMaterial = new Material(req.body);
    const saved = await newMaterial.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error saving material' });
  }
});

// PUT update material by ID (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Material not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating material' });
  }
});

// DELETE material (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Material.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete material' });
  }
});

module.exports = router;
