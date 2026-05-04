const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { verifyToken, isAdmin, canManageEvent } = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
const Participant = require("../models/Participant");
const Expense = require("../models/Expense");

// Get all events
router.get("/", verifyToken, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
router.post("/add", verifyToken, isAdmin, upload.single('coverImage'), async (req, res) => {
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
      name: eventName,
      category: category || 'Uncategorized',
      mode: mode || 'quick',
      ...(mode === 'detailed' && {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalBudget: estimatedBudget ? parseFloat(estimatedBudget) : 0,
        splitMethod: splitMethod || 'Equal Split',
        location,
        description,
        coverImage: coverImagePath,
        participantsList: participantsArray
      })
    });

    const newEvent = await event.save();

    res.status(201).json({ event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new event
router.post("/", verifyToken, isAdmin, async (req, res) => {
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
router.patch("/:id/close", verifyToken, canManageEvent, async (req, res) => {
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

// Add moderator to event
router.post("/:id/moderators", verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.moderators.includes(userId)) {
      event.moderators.push(userId);
      await event.save();
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove moderator from event
router.delete("/:id/moderators/:userId", verifyToken, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.moderators = event.moderators.filter(m => m.toString() !== req.params.userId);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Settlement Report
router.get("/:id/settlement-report", verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const participants = await Participant.find({ eventId });
    const expenses = await Expense.find({ eventId });

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const participantCount = participants.length;
    const share = participantCount > 0 ? totalSpent / participantCount : 0;

    const participantBalances = participants.map(p => {
      const paid = expenses
        .filter(e => e.paidBy.toString() === p._id.toString())
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        _id: p._id,
        name: p.name,
        totalPaid: paid,
        share: share,
        balance: paid - share
      };
    });

    let debtors = participantBalances.filter(p => p.balance <= -0.01).map(p => ({ ...p, owe: Math.abs(p.balance) }));
    let creditors = participantBalances.filter(p => p.balance >= 0.01).map(p => ({ ...p, owed: p.balance }));

    debtors.sort((a, b) => b.owe - a.owe);
    creditors.sort((a, b) => b.owed - a.owed);

    const transactions = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.owe, creditor.owed);

      if (amount >= 0.01) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount
        });
      }

      debtor.owe -= amount;
      creditor.owed -= amount;

      if (debtor.owe < 0.01) i++;
      if (creditor.owed < 0.01) j++;
    }

    res.json({
      totalSpent,
      participantCount,
      share,
      balances: participantBalances,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
