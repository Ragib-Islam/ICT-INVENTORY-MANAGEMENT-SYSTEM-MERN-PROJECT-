const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  dueDate: { type: Date },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.MaintenanceRequest || mongoose.model('MaintenanceRequest', maintenanceRequestSchema);


