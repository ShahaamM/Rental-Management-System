const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');

router.get('/', async (req, res) => {
  const { customerName, date, type } = req.query;
  const filter = {};

  if (customerName) {
    filter.customerName = { $regex: customerName, $options: 'i' };
  }

  if (date) {
    const d = new Date(date);
    if (type === 'daily') {
      filter.startDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt: new Date(d.setHours(23, 59, 59, 999)),
      };
    } else if (type === 'monthly') {
      filter.startDate = {
        $gte: new Date(d.getFullYear(), d.getMonth(), 1),
        $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    } else if (type === 'yearly') {
      filter.startDate = {
        $gte: new Date(d.getFullYear(), 0, 1),
        $lt: new Date(d.getFullYear() + 1, 0, 1),
      };
    }
  }

  try {
    const results = await Rental.find(filter);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error generating report' });
  }
});

module.exports = router;
