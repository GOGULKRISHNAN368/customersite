const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Middleware to log all incoming requests to this router
router.use((req, res, next) => {
  console.log(`📡 Menu Route hit: ${req.method} ${req.url}`);
  next();
});

const socketIO = require('../socket');

// GET all available menu items
router.get('/', async (req, res, next) => {
  try {
    const menus = await Menu.find({});
    res.json(menus);
  } catch (error) {
    console.error('\u274c Error fetching menus:', error);
    next(error);
  }
});

// POST a new menu item
router.post('/', async (req, res, next) => {
  try {
    const newMenu = new Menu(req.body);
    const savedMenu = await newMenu.save();
    
    // Emit Real-time Event
    socketIO.getIO().emit('menuUpdated', { action: 'create', data: savedMenu });
    
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error('\u274c Error creating menu:', error);
    next(error);
  }
});

// PUT to update a menu item
router.put('/:id', async (req, res, next) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Emit Real-time Event
    socketIO.getIO().emit('menuUpdated', { action: 'update', data: updatedMenu });
    
    res.json(updatedMenu);
  } catch (error) {
    console.error('\u274c Error updating menu:', error);
    next(error);
  }
});

// DELETE a menu item
router.delete('/:id', async (req, res, next) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    
    // Emit Real-time Event
    socketIO.getIO().emit('menuUpdated', { action: 'delete', id: req.params.id });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('\u274c Error deleting menu:', error);
    next(error);
  }
});

module.exports = router;
