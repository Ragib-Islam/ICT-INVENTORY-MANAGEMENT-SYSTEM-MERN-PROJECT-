const mongoose = require('mongoose');

const itemStatusHistorySchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.ItemStatusHistory || mongoose.model('ItemStatusHistory', itemStatusHistorySchema);


