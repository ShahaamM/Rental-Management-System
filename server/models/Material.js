const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  model: String,
  price: Number,
  notes: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
