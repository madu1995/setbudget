const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed.'));
    }
  }
});

// Create new event (Detailed & Quick)
router.post("/add", upload.single('coverImage'), async (req, res) => {
  try {
    const {
      eventName,
      category,
      mode,
      startDate,
      endDate,
      estimatedBudget,
      splitMethod,
      location,
      description,
      initialParticipants
    } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'Event name is required.' });
    }

    let coverImagePath = null;
    if (req.file) {
      coverImagePath = req.file.path; 
    }

    let participantsArray = [];
    if (initialParticipants) {
      participantsArray = initialParticipants.split(',').map(email => email.trim()).filter(email => email);
    }

    const event = new Event({
      name: eventName, // using 'name' as per Event schema
      category: category || 'Uncategorized',
      mode: mode || 'quick',
      ...(mode === 'detailed' && {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalBudget: estimatedBudget ? parseFloat(estimatedBudget) : 0, // mapping estimatedBudget to totalBudget
        splitMethod: splitMethod || 'Equal Split',
        location,
        description,
        coverImage: coverImagePath,
        participantsList: participantsArray
      })
    });

    const newEvent = await event.save();

    // Also create Participant records for initialParticipants if needed
    // Assuming Participant model is available, but leaving as array in Event for now
    // the current app logic uses separate Participant model

    res.status(201).json({ event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: err.message });
  }
});


// Create new event
router.post("/", async (req, res) => {
  const event = new Event({
    name: req.body.name,
    description: req.body.description,
    totalBudget: req.body.totalBudget,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Close event
router.patch("/:id/close", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.isActive = false;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
