// backend/routes/rentalRoutes.js
const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Material = require('../models/Material'); // Needed for price lookup
const verifyToken = require('../middleware/authMiddleware');

// Helper functions
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
};

const calculateGrandTotal = (items) => {
  return items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
};

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
    const { customerName, mobile, nicOrLicense, startDate, endDate, items, amountPaid } = req.body;
    
    // Auto-fill prices from Material if missing
    const updatedItems = await Promise.all(items.map(async item => {
      if (!item.price && item.itemName && item.model) {
        const material = await Material.findOne({ itemName: item.itemName, model: item.model });
        item.price = material?.price || 0;
      }
      item.total = (parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2);
      return item;
    }));

    const numberOfDays = calculateDays(startDate, endDate);
    const grandTotal = calculateGrandTotal(items);
    const remainingAmount = grandTotal - parseFloat(amountPaid || 0);

    const rental = new Rental({
      customerName,
      mobile,
      nicOrLicense,
      startDate,
      endDate,
      items: updatedItems,
      amountPaid,
      numberOfDays,
      grandTotal,
      remainingAmount
    });

    const saved = await rental.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error saving rental', error: err.message });
  }
});

// UPDATE rental
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { customerName, mobile, nicOrLicense, startDate, endDate, items, amountPaid } = req.body;
    
    // Auto-fill prices from Material if missing
    const updatedItems = await Promise.all(items.map(async item => {
      if (!item.price && item.itemName && item.model) {
        const material = await Material.findOne({ itemName: item.itemName, model: item.model });
        item.price = material?.price || 0;
      }
      item.total = (parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2);
      return item;
    }));
    
    const numberOfDays = calculateDays(startDate, endDate);
    const grandTotal = calculateGrandTotal(items);
    const remainingAmount = grandTotal - parseFloat(amountPaid || 0);

    const updated = await Rental.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        mobile,
        nicOrLicense,
        startDate,
        endDate,
        items: updatedItems,
        amountPaid,
        numberOfDays,
        grandTotal,
        remainingAmount
      },
      { new: true }
    );

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

// Price lookup
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
