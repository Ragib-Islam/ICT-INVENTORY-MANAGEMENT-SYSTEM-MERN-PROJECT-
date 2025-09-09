const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  percent: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Discount || mongoose.model('Discount', discountSchema);


