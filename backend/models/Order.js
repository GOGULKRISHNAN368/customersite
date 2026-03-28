const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [
    {
      menuItemId: {
        type: String,
        required: true
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered'],
    default: 'Pending'
  }
}, { timestamps: true, collection: 'orders' });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
