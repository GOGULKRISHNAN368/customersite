const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');

const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

// Middleware to log all incoming requests to this router
router.use((req, res, next) => {
  console.log(`\ud83d\udce1 Order Route hit: ${req.method} ${req.url}`);
  next();
});

const socketIO = require('../socket');

// GET all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('\u274c Error fetching orders:', error);
    next(error);
  }
});

// GET active orders (Alias for compatibility)
router.get('/active', async (req, res, next) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['waiting', 'pending', 'preparing'] } 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('\u274c Error fetching active orders:', error);
    next(error);
  }
});

// GET order details by Order ID
router.get('/:orderId', async (req, res, next) => {
  try {
    const orderIdToFind = req.params.orderId.trim();
    const order = await Order.findOne({ orderId: { $regex: new RegExp(`^${orderIdToFind}$`, 'i') } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('\u274c Error fetching order:', error);
    next(error);
  }
});

// POST to create a new order
router.post('/create', async (req, res, next) => {
  try {
    console.log('\ud83d\udce6 Received create order request...');
    const { items, totalAmount, tableNumber, customerName } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const processedItems = items.map(item => ({
      menuItemId: String(item.menuItemId || item.dishId),
      name: String(item.name || item.dishName),
      dishName: String(item.name || item.dishName), // Duplicate for compatibility
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      preference: String(item.preference || 'Standard'),
      customDescription: String(item.customDescription || '')
    }));

    const orderId = uuidv4().split('-')[0].toUpperCase();

    const newOrder = new Order({
      orderId: orderId,
      tableNumber: tableNumber || 0,
      customerName: customerName || "Guest",
      items: processedItems,
      totalAmount: Number(totalAmount),
      totalPrice: Number(totalAmount), // for MenuMagic compatibility
      status: 'pending' // Default to pending so it appears in kitchen
    });

    await newOrder.save();
    
    // Emit Real-time Event
    socketIO.getIO().emit('orderCreated', newOrder);

    console.log('\u2705 Order successfully saved with ID:', orderId);
    res.status(201).json({ orderId: orderId });
  } catch (error) {
    console.error('\u274c Error creating order:', error.message);
    next(error);
  }
});

// POST to add items to an existing order
router.post('/add-items/:orderId', async (req, res, next) => {
  try {
    console.log(`\u2795 Adding items to order ${req.params.orderId}`);
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Must provide items to add.' });
    }

    const orderIdToFind = req.params.orderId.trim();
    const order = await Order.findOne({ orderId: { $regex: new RegExp(`^${orderIdToFind}$`, 'i') } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Re-open if completed (case-insensitive check)
    if (order.status?.toLowerCase() === 'completed') {
      order.status = 'pending';
      console.log(`\u21ba Re-opening completed order: ${orderIdToFind}`);
    }

    const processedItems = items.map(item => ({
      menuItemId: String(item.menuItemId),
      name: String(item.name || 'Unknown Item'),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      preference: String(item.preference || 'Standard'),
      customDescription: String(item.customDescription || '')
    }));

    order.items.push(...processedItems);
    order.totalAmount += Number(totalAmount);
    order.totalPrice = order.totalAmount; // sync alias
    await order.save();

    // Emit Real-time Event
    socketIO.getIO().emit('orderUpdated', order);

    console.log('\u2705 Items added successfully to order:', order.orderId);
    res.status(200).json({ orderId: order.orderId, message: 'Items added successfully' });
  } catch (error) {
    console.error('\u274c Error adding items:', error.message);
    next(error);
  }
});

// PUT to update status (Admin panel uses this)
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    socketIO.getIO().emit('orderUpdated', order);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// PUT to complete an order (Kitchen Ready)
router.put('/complete/:id', async (req, res, next) => {
  try {
    const idToFind = req.params.id.trim();
    // Try to find by orderId OR _id (if it's a valid ObjectId)
    const query = {
      $or: [
        { orderId: { $regex: new RegExp(`^${idToFind}$`, 'i') } }
      ]
    };
    
    if (mongoose.Types.ObjectId.isValid(idToFind)) {
      query.$or.push({ _id: idToFind });
    }

    const order = await Order.findOneAndUpdate(
      query,
      { status: 'completed', updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit Real-time Event
    socketIO.getIO().emit('orderCompleted', order);

    console.log('\u2705 Order marked as completed:', order.orderId);
    res.json({ message: 'Order completed successfully', order });
  } catch (error) {
    console.error('\u274c Error completing order:', error);
    next(error);
  }
});

// POST to generate receipt
router.post('/receipt/:orderId', async (req, res, next) => {
  try {
    const orderIdInput = req.params.orderId.trim();
    const order = await Order.findOne({ orderId: { $regex: new RegExp(`^${orderIdInput}$`, 'i') } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderId}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Dine Elite Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    doc.text('Items ordered:');
    doc.moveDown(0.5);
    
    order.items.forEach(item => {
      doc.text(`${item.quantity}x ${item.name} - \u20b9${item.price * item.quantity}`);
      if (item.preference && item.preference !== 'Standard') {
        doc.fontSize(10).text(`   Preference: ${item.preference}`, { color: 'gray' });
      }
      doc.fontSize(12).fillColor('black');
    });

    doc.moveDown();
    doc.fontSize(14).text(`Grand Total: \u20b9${order.totalAmount}`, { bold: true });
    doc.end();

    order.status = 'completed';
    await order.save();
    socketIO.getIO().emit('orderCompleted', order);
  } catch (error) {
    console.error('\u274c Error generating receipt:', error.message);
    next(error);
  }
});

module.exports = router;
