const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  offer: {
    type: String
  },
  offerPercent: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    required: false
  },
  timeSlots: [String]
}, { timestamps: true, collection: 'dishes' });

module.exports = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
