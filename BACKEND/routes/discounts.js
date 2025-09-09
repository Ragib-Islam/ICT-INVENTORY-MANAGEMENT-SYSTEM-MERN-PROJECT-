const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Helper to compute percent from date (1-15 allowed)
const percentFromDate = (date) => {
  const day = new Date(date).getDate();
  if (day < 1 || day > 15) return null;
  return day; // e.g. 11 => 11%
};

// Create discount (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { itemId, userId, date } = req.body || {};
    if (!itemId || !userId || !date) return res.status(400).json({ error: 'itemId, userId and date are required' });
    const percent = percentFromDate(date);
    if (percent === null) return res.status(400).json({ error: 'Discount allowed only from 1st to 15th day of month' });

    const item = await Item.findById(itemId);
    const user = await User.findById(userId);
    if (!item || !user) return res.status(404).json({ error: 'Item or user not found' });

    if (item.status !== 'Available') {
      return res.status(400).json({ error: 'Only Available items can be discounted' });
    }
    const originalPrice = Number(item.purchasePrice || 0);
    const discountedPrice = Math.max(0, Math.round(originalPrice * (1 - percent / 100)));

    const discount = await Discount.create({
      item: item._id,
      assignedTo: user._id,
      assignedBy: req.user._id,
      date: new Date(date),
      percent,
      originalPrice,
      discountedPrice
    });

    const populated = await Discount.findById(discount._id)
      .populate('item')
      .populate('assignedTo', 'fullName department');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// List discounts (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const list = await Discount.find()
      .populate('item')
      .populate('assignedTo', 'fullName department')
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// My discounts (user)
router.get('/my', auth, async (req, res) => {
  try {
    const list = await Discount.find({ assignedTo: req.user._id })
      .populate('item')
      .sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;


