// models/Rental.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: String,
  model: String,
  quantity: Number,
  price: Number,
  total: Number
});

const rentalSchema = new mongoose.Schema({
  customerName: String,
  items: [itemSchema],
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rental', rentalSchema);
