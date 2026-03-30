const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const http = require('http');
const socketIO = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketIO.init(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/dishes', menuRoutes); // Alias for MenuMagic Dashboard compatibility
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);


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

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
