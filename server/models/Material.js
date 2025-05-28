const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  itemName: { type : String, required: true },
  quantity: Number,
  model: String,
  price: { type: Number, required: true },
  notes: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);
