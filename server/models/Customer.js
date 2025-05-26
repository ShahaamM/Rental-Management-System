// backend/models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  nicOrLicense: { type: String, unique: true },
  address: String,
  photo: String, // path to uploaded image file
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);