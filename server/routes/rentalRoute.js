// routes/rentalRoute.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');

// Create Rental
router.post('/', async (req, res) => {
  try {
    const rental = new Rental(req.body);
    await rental.save();
    res.status(201).json(rental);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get All Rentals
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Suggestions for Customer, Item Name, or Model
router.get('/suggestions', async (req, res) => {
  const { field, query } = req.query;
  if (!['customerName', 'itemName', 'model'].includes(field)) {
    return res.status(400).json({ message: 'Invalid field' });
  }
  try {
    const suggestions = await Rental.find({
      [field]: { $regex: `^${query}`, $options: 'i' }
    }).limit(10).distinct(field);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Rental
router.put('/:id', async (req, res) => {
  try {
    const rental = await Rental.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rental);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Rental
router.delete('/:id', async (req, res) => {
  try {
    await Rental.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rental deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET rental by ID
router.get('/:id', async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rental' });
  }
});


module.exports = router;