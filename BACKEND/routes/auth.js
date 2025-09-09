const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { fullName, username, email, password, role, department, employeeId } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, ...(username ? [{ username }] : [])] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Create new user
    // Derive a username if not provided
    let finalUsername = username;
    if (!finalUsername) {
      finalUsername = email.toLowerCase();
    }

    const isFirstUser = (await User.countDocuments()) === 0;
    // Respect requested role when provided; default to User (first user becomes Admin)
    let userRole = 'User';
    if (typeof role === 'string') {
      const lower = role.toLowerCase();
      if (lower === 'admin') userRole = 'Admin';
      else if (lower === 'user') userRole = 'User';
    } else if (isFirstUser) {
      userRole = 'Admin';
    }

    const user = new User({
      fullName,
      username: finalUsername,
      email,
      password, // Will be hashed by the pre-save middleware
      role: userRole,
      department: department || 'General',
      employeeId
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
});

module.exports = router;