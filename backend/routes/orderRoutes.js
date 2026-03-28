const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');

// Middleware to log all incoming requests to this router
router.use((req, res, next) => {
  console.log(`📡 Order Route hit: ${req.method} ${req.url}`);
  next();
});

// GET all orders (For admin)
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    next(error);
  }
});

// POST to create a new order
router.post('/', async (req, res, next) => {
  try {
    console.log('📦 Received order request...');
    
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('⚠️ Validation Error: No items provided or invalid format');
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Manual mapping to ensure data cleaniless
    const processedItems = items.map(item => ({
      menuItemId: String(item.menuItemId),
      name: String(item.name || 'Unknown Item'),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      preference: String(item.preference || 'Standard'),
      customDescription: String(item.customDescription || '')
    }));

    console.log(`📝 Processed ${processedItems.length} items. Total: ₹${totalAmount}`);

    // Direct write to the 'orders' collection to bypass Mongoose internal crashes
    const OrderModel = mongoose.models.Order || mongoose.model('Order');
    const result = await OrderModel.collection.insertOne({
      orderId: `ORD-${Date.now()}`, // Generate unique ID to satisfy Atlas index
      items: processedItems,
      totalAmount: Number(totalAmount),
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Order successfully saved to Atlas:', result.insertedId);
    res.status(201).json({ _id: result.insertedId });
  } catch (error) {
    console.error('❌ CRITICAL ERROR during order processing:');
    console.error('Error Details:', error.message);
    next(error);
  }
});

module.exports = router;
