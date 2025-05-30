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
  mobile: String,
  nicOrLicense: String,
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,           // ➕ auto-calculated
  grandTotal: Number,             // ➕ auto-calculated
  amountPaid: Number,             // ➕ user input
  remainingAmount: Number,        // ➕ auto-calculated
  items: [itemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rental', rentalSchema);
