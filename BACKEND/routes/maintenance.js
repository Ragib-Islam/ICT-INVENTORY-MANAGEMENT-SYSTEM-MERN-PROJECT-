const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Create a maintenance request (user)
router.post('/', auth, async (req, res) => {
  try {
    const { item, notes, priority } = req.body || {};
    if (!item) return res.status(400).json({ error: 'Item is required' });
    const exists = await Item.findById(item);
    if (!exists) return res.status(404).json({ error: 'Item not found' });
    const mr = await MaintenanceRequest.create({ item, notes, priority: priority || 'Low', requestedBy: req.user._id });
    const populated = await MaintenanceRequest.findById(mr._id).populate('item').populate('requestedBy', 'fullName department');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// List my maintenance requests (user)
router.get('/my', auth, async (req, res) => {
  try {
    const list = await MaintenanceRequest.find({ requestedBy: req.user._id })
      .populate('item')
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// List all (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const list = await MaintenanceRequest.find()
      .populate('item')
      .populate('requestedBy', 'fullName department')
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update status or set due date (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dueDate } = req.body || {};
    const allowed = ['Open', 'In Progress', 'Resolved'];
    if (status && !allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const mr = await MaintenanceRequest.findById(id);
    if (!mr) return res.status(404).json({ error: 'Request not found' });
    if (status) mr.status = status;
    if (dueDate) mr.dueDate = new Date(dueDate);
    if (status === 'Resolved') {
      mr.resolvedAt = new Date();
      mr.resolvedBy = req.user._id;
      // Optionally free item if in repair
      const item = await Item.findById(mr.item);
      if (item && item.status === 'Under Repair') {
        item.status = 'Available';
        await item.save();
      }
    }
    await mr.save();
    const populated = await MaintenanceRequest.findById(id)
      .populate('item')
      .populate('requestedBy', 'fullName department');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;


