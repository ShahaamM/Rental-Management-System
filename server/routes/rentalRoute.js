// backend/routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const verifyToken = require('../middleware/authMiddleware');

// GET all rentals
router.get('/', verifyToken, async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rentals' });
  }
});

// GET single rental
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rental' });
  }
});

// CREATE rental
router.post('/', verifyToken, async (req, res) => {
  try {
    const rental = new Rental(req.body);
    const saved = await rental.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error saving rental', error: err.message });
  }
});

// UPDATE rental
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Rental.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Rental not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating rental', error: err.message });
  }
});

// DELETE rental
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Rental.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Rental not found' });
    res.json({ message: 'Rental deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete rental' });
  }
});

// routes/rentals.js (part of it for price lookup)
router.get('/price', verifyToken, async (req, res) => {
  const { itemName, model } = req.query;
  try {
    const material = await Material.findOne({ itemName, model });
    if (!material) return res.json({ price: '' });
    res.json({ price: material.price });
  } catch {
    res.status(500).json({ message: 'Error fetching price' });
  }
});

module.exports = router;