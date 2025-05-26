const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use('/api/customers', require('./routes/customerRoute'));
app.use('/api/materials', require('./routes/materialRoute'));
app.use('/api/rentals', require('./routes/rentalRoute'));
app.use('/api/reports', require('./routes/reportRoute'));
app.use('/api/suggestions', require('./routes/suggestionRoute'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

