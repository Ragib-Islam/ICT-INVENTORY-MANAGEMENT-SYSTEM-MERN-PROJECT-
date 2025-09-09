const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Test route (remove this after debugging)
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Users route is working', timestamp: new Date() });
});

// Add this route to handle GET /api/users
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/users called by user:', req.user?.fullName, 'Role:', req.user?.role);
    
    // Only allow admins to see all users
    if (req.user.role !== 'Admin') {
      console.log('Access denied - user is not admin');
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const users = await User.find({}, 'fullName email department employeeId role createdAt')
      .sort({ fullName: 1 });
    
    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Your existing employees route
router.get('/employees', auth, async (req, res) => {
  try {
    console.log('GET /api/users/employees called');
    const employees = await User.find({}, 'fullName email department employeeId role')
      .sort({ fullName: 1 });
    console.log('Found employees:', employees.length);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    const { id } = req.params;
    const { fullName, email, role, department, employeeId } = req.body;
    const updated = await User.findByIdAndUpdate(
      id,
      { fullName, email, role: role === 'Admin' ? 'Admin' : role || 'User', department, employeeId },
      { new: true, runValidators: true, select: 'fullName email department employeeId role createdAt' }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    const { id } = req.params;
    const existing = await User.findById(id);
    if (!existing) return res.status(404).json({ error: 'User not found' });
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
 
// TEMP: Self-promotion endpoint for development only. Remove in production.
// Requires authentication AND a secret code (env ADMIN_PROMOTE_CODE or default).
router.post('/promote', auth, async (req, res) => {
  try {
    const provided = req.body?.code;
    const expected = process.env.ADMIN_PROMOTE_CODE || 'PROMOTE_ME_ONCE';
    if (!provided || provided !== expected) {
      return res.status(403).json({ error: 'Invalid promotion code.' });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'Admin' },
      { new: true, select: 'fullName email department employeeId role createdAt' }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ message: 'Promoted to Admin', user: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});