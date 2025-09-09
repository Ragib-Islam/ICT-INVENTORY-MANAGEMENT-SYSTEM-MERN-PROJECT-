const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get overview statistics
router.get('/overview', auth, async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const availableItems = await Item.countDocuments({ status: 'Available' });
    const assignedItems = await Item.countDocuments({ status: 'Assigned' });
    const underRepairItems = await Item.countDocuments({ status: 'Under Repair' });
    const totalUsers = await User.countDocuments();
    const activeAssignments = await Assignment.countDocuments({ status: 'Active' });

    res.json({
      totalItems,
      availableItems,
      assignedItems,
      underRepairItems,
      totalUsers,
      activeAssignments
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview statistics' });
  }
});

module.exports = router;