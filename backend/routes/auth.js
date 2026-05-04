const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for: ${username}`);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`Password match for ${username}: ${isMatch}`);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        requiresPasswordChange: user.requiresPasswordChange,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password (especially for initial admin login)
router.post('/update-password', verifyToken, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.password = newPassword;
      user.requiresPasswordChange = false;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        role: updatedUser.role,
        requiresPasswordChange: updatedUser.requiresPasswordChange,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
