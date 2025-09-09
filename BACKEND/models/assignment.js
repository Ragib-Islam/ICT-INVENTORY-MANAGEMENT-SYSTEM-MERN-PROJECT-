const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue'],
    default: 'Active'
  },
  notes: {
    type: String
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);