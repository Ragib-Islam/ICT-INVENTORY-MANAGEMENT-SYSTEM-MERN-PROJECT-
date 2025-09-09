const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Under Repair', 'Damaged', 'Disposed'],
    default: 'Available'
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  purchasePrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ✅ Fix: Check if model exists before creating
module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);