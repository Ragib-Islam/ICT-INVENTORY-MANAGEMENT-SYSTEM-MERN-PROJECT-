const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all assignments (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('item')
      .populate('employee', 'fullName department')
      .populate('assignedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get assignments for a specific user (authenticated)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const assignments = await Assignment.find({ employee: userId })
      .populate('item')
      .populate('employee', 'fullName department')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create assignment (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { item, employee, assignmentDate, expectedReturnDate, condition, notes, status } = req.body;

    const existingItem = await Item.findById(item);
    if (!existingItem) return res.status(404).json({ error: 'Item not found' });
    if (existingItem.status === 'Assigned') return res.status(400).json({ error: 'Item already assigned' });

    const assignment = await Assignment.create({
      item,
      employee,
      assignedBy: req.user._id,
      assignmentDate: assignmentDate || new Date(),
      expectedReturnDate: expectedReturnDate || null,
      condition: condition || 'Good',
      notes: notes || '',
      status: status || 'Active'
    });

    existingItem.status = 'Assigned';
    await existingItem.save();

    // Populate created assignment safely
    const populated = await Assignment.findById(assignment._id)
      .populate('item')
      .populate('employee', 'fullName department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update assignment (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Assignment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('item')
      .populate('employee', 'fullName department');
    if (!updated) return res.status(404).json({ error: 'Assignment not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete assignment (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    // Mark item as Available again
    const existingItem = await Item.findById(assignment.item);
    if (existingItem) {
      existingItem.status = 'Available';
      await existingItem.save();
    }
    await Assignment.findByIdAndDelete(id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Return assignment (admin only) - set actualReturnDate, condition, and mark item accordingly
router.put('/:id/return', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, actualReturnDate, notes } = req.body || {};
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.actualReturnDate = actualReturnDate || new Date();
    assignment.condition = condition || assignment.condition || 'Good';
    assignment.status = 'Returned';
    if (notes) assignment.notes = notes;
    await assignment.save();

    // Update item status based on condition
    const item = await Item.findById(assignment.item);
    if (item) {
      if (assignment.condition === 'Fair' || assignment.condition === 'Poor') {
        item.status = 'Under Repair';
      } else {
        item.status = 'Available';
      }
      await item.save();
    }

    const populated = await Assignment.findById(id)
      .populate('item')
      .populate('employee', 'fullName department');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});