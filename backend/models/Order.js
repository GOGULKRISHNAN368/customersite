const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  tableNumber: { type: Number, default: 0 },
  customerName: { type: String, default: "Guest" },
  items: [
    {
      menuItemId: {
        type: String,
        required: true
      },
      name: String,
      dishName: String, // Alias for MenuMagic compatibility
      price: Number,
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      preference: {
        type: String,
        default: 'Standard'
      },
      customDescription: {
        type: String,
        default: ''
      }
    }
  ],
  totalAmount: { type: Number, required: true },
  // Adding totalPrice as an alias for MenuMagic Dashboard compatibility
  totalPrice: { type: Number }, 
  status: { 
    type: String, 
    enum: ['waiting', 'pending', 'preparing', 'served', 'completed', 'Pending', 'Completed'], 
    default: 'waiting' 
  },
}, { timestamps: true, collection: 'orders' });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
