// backend/routes/customerRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Customer = require('../models/Customer');

const router = express.Router();

// Storage configuration for customer photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/customer-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

// Create new customer with image
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const newCustomer = new Customer({
      ...req.body,
      photo: req.file ? `/uploads/customer-photos/${req.file.filename}` : '',
    });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ message: 'Error saving customer', error: err });
  }
});

// Update existing customer
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };
    if (req.file) {
      updateData.photo = `/uploads/customer-photos/${req.file.filename}`;
    }
    const updated = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating customer', error: err });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Customer not found' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

module.exports = router;
