const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const ItemStatusHistory = require('../models/ItemStatusHistory');

// GET all items - accessible by all authenticated users
router.get('/', auth, async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single item - accessible by all authenticated users
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new item - admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      model,
      serialNumber,
      status,
      location,
      description,
      purchaseDate,
      purchasePrice
    } = req.body;

    // Check if serial number already exists
    const existingItem = await Item.findOne({ serialNumber });
    if (existingItem) {
      return res.status(400).json({ error: 'Serial number already exists' });
    }

    const item = new Item({
      itemName,
      category,
      brand,
      model,
      serialNumber,
      status: status || 'Available',
      location,
      description,
      purchaseDate: purchaseDate || new Date(),
      purchasePrice: purchasePrice || 0,
      addedBy: req.user._id
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update item - admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if serial number is being changed and if it already exists
    if (req.body.serialNumber && req.body.serialNumber !== item.serialNumber) {
      const existingItem = await Item.findOne({ 
        serialNumber: req.body.serialNumber,
        _id: { $ne: req.params.id }
      });
      if (existingItem) {
        return res.status(400).json({ error: 'Serial number already exists' });
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE item - admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if item is currently assigned
    if (item.status === 'Assigned') {
      return res.status(400).json({ error: 'Cannot delete item that is currently assigned' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Change item status with history (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body || {};
    const allowed = ['Available', 'Assigned', 'Under Repair', 'Damaged', 'Disposed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const from = item.status;
    if (from === status) {
      return res.json(item); // no change
    }
    item.status = status;
    await item.save();
    await ItemStatusHistory.create({ item: item._id, changedBy: req.user._id, fromStatus: from, toStatus: status, note });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get status history for an item (admin only)
router.get('/:id/status/history', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const history = await ItemStatusHistory.find({ item: id })
      .populate('changedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});