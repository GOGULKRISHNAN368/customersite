const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Middleware to log all incoming requests to this router
router.use((req, res, next) => {
  console.log(`📡 Menu Route hit: ${req.method} ${req.url}`);
  next();
});

// GET all available menu items
router.get('/', async (req, res, next) => {
  try {
    console.log('🔍 Fetching all available menus from Atlas...');
    const menus = await Menu.find({});
    console.log(`✅ Found ${menus.length} dishes.`);
    res.json(menus);
  } catch (error) {
    console.error('❌ Error fetching menus:', error);
    next(error); // Pass to global error handler in server.js
  }
});

// GET menu items by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    console.log(`🔍 Fetching menus for category: ${category}`);
    const menus = await Menu.find({ category });
    res.json(menus);
  } catch (error) {
    console.error(`❌ Error fetching menus for ${category}:`, error);
    next(error);
  }
});

// POST a new menu item
router.post('/', async (req, res, next) => {
  try {
    console.log('📝 Creating new menu item:', req.body.name);
    const newMenu = new Menu(req.body);
    const savedMenu = await newMenu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error('❌ Error creating menu:', error);
    next(error);
  }
});

module.exports = router;
