const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

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

// POST a new menu item (handles optional image upload)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    let menuData = req.body;
    
    // Handle timeSlots if sent via FormData (multer might put them in 'timeSlots[]' or as strings)
    if (req.body['timeSlots[]']) {
      menuData.timeSlots = Array.isArray(req.body['timeSlots[]']) ? req.body['timeSlots[]'] : [req.body['timeSlots[]']];
      delete menuData['timeSlots[]'];
    } else if (menuData.timeSlots && !Array.isArray(menuData.timeSlots)) {
      menuData.timeSlots = [menuData.timeSlots];
    }
    
    // If a file was uploaded, set the imageUrl
    if (req.file) {

      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      menuData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    const newMenu = new Menu(menuData);
    const savedMenu = await newMenu.save();
    
    // Emit Real-time Event
    socketIO.getIO().emit('menuUpdated', { action: 'create', data: savedMenu });
    
    res.status(201).json(savedMenu);
  } catch (error) {
    console.error('\u274c Error creating menu:', error);
    next(error);
  }
});

// PUT to update a menu item (handles optional image upload)
router.put('/:id', upload.single('image'), async (req, res, next) => {
  try {
    let updateData = req.body;
    
    // Handle timeSlots if sent via FormData (multer might put them in 'timeSlots[]' or as strings)
    if (req.body['timeSlots[]']) {
      updateData.timeSlots = Array.isArray(req.body['timeSlots[]']) ? req.body['timeSlots[]'] : [req.body['timeSlots[]']];
      delete updateData['timeSlots[]'];
    } else if (updateData.timeSlots && !Array.isArray(updateData.timeSlots)) {
      updateData.timeSlots = [updateData.timeSlots];
    }
    
    // If a new file was uploaded, set the imageUrl
    if (req.file) {

      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      updateData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
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
