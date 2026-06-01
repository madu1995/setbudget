const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');

const verifyToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'setbudget_super_secret_jwt_key_2024');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const canManageEvent = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  const eventId = req.params.eventId || req.params.id || req.body.eventId;
  
  if (!eventId) {
     return res.status(400).json({ message: 'Event ID missing for access check' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.moderators.includes(req.user._id)) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized to manage this event' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error in checking permissions' });
  }
};

module.exports = { verifyToken, isAdmin, canManageEvent };
