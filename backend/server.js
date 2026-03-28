const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected successfully to Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Backend Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message,
    path: req.path 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
