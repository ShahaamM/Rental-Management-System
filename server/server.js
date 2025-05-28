const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();

// ✅ Proper middleware order
app.use(cors());
app.use(express.json()); // must come BEFORE routes

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes (auth route should come before protected ones)
app.use('/api/auth', require('./routes/authRoute'));

// ✅ Protected routes using authMiddleware
const authMiddleware = require('./middleware/authMiddleware');
app.use('/api/customers', authMiddleware, require('./routes/customerRoute'));
app.use('/api/materials', authMiddleware, require('./routes/materialRoute'));
app.use('/api/rentals', authMiddleware, require('./routes/rentalRoute'));
app.use('/api/reports', authMiddleware, require('./routes/reportRoute'));
app.use('/api/suggestions', authMiddleware, require('./routes/suggestionRoute'));
app.use('/api/prices', authMiddleware, require('./routes/priceRoute'));


// ✅ Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
