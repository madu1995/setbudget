const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const upload = require("../middleware/upload");
const { verifyToken, isAdmin, canManageEvent } = require("../middleware/auth");
const Participant = require("../models/Participant");
const Expense = require("../models/Expense");

// Get all events
router.get("/", verifyToken, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    
    // Enrich events with extra info
    const enrichedEvents = await Promise.all(events.map(async (event) => {
      const participantCount = await Participant.countDocuments({ eventId: event._id });
      
      const expenses = await Expense.find({ eventId: event._id });
      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      
      return {
        ...event.toObject(),
        participantCount,
        totalSpent
      };
    }));

    res.json(enrichedEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Shared upload middleware is used instead

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

    const eventExists = await Event.findOne({ name: eventName });
    if (eventExists) {
      return res.status(400).json({ message: 'An event with this name already exists' });
    }

    let coverImagePath = null;
    if (req.file) {
      // Since we use memory storage on Vercel, we can't save to a local path.
      // In a real production app, you would upload the buffer to Cloudinary/S3 here.
      // For now, we set a placeholder to indicate an image was received but not saved locally.
      coverImagePath = "uploaded_via_memory"; 
    }

    let participantsArray = [];
    if (initialParticipants) {
      try {
        participantsArray = JSON.parse(initialParticipants);
      } catch (e) {
        console.error("Failed to parse initialParticipants:", e);
      }
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

    // Also create Participant records for each
    if (participantsArray.length > 0) {
      const participantDocs = participantsArray.map(p => ({
        name: p.name,
        phone: p.phone,
        eventId: newEvent._id
      }));
      await Participant.insertMany(participantDocs);
    }

    res.status(201).json({ event: newEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create new event
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;

  try {
    const eventExists = await Event.findOne({ name });
    if (eventExists) {
      return res.status(400).json({ message: 'An event with this name already exists' });
    }

    const event = new Event({
      name: name,
      description: req.body.description,
      totalBudget: req.body.totalBudget,
    });

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

    // --- 1. Total Financials ---
    // Total Expense = Sum of all expenses
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Total Expected = Sum of all participants' baseFees
    const totalExpected = participants.reduce((acc, p) => acc + (p.baseFee || p.fixedAmount || 0), 0);
    
    // Deficit / Overrun
    const deficit = totalSpent - totalExpected;
    
    // Deficit Share per participant
    const participantCount = participants.length;
    const deficitShare = participantCount > 0 ? deficit / participantCount : 0;

    // --- 2. Participant Balances ---
    const participantBalances = participants.map(p => {
      const baseFee = p.baseFee || p.fixedAmount || 0;
      
      // Liability = baseFee + deficitShare
      const liability = baseFee + deficitShare;
      
      // Personal Expenses paid by this participant (out-of-pocket)
      const personalPaid = expenses
        .filter(e => e.paidBy !== "FUND" && e.paidBy.toString() === p._id.toString())
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      // Total Paid = initialDeposit + personalPaid
      const totalPaid = (p.initialDeposit || 0) + personalPaid;
      
      // Final Balance = Liability - TotalPaid
      // If > 0, owes money. If < 0, receive refund.
      const balance = liability - totalPaid;

      return {
        _id: p._id,
        name: p.name,
        baseFee,
        initialDeposit: p.initialDeposit || 0,
        personalPaid,
        totalPaid,
        liability,
        balance
      };
    });

    // --- 3. Debt Balancing (Transactions) ---
    // Debtors: Balance > 0 (owes money)
    let debtors = participantBalances
      .filter(p => p.balance >= 0.01)
      .map(p => ({ ...p, owe: p.balance }));
    
    // Creditors: Balance < 0 (receive refund)
    let creditors = participantBalances
      .filter(p => p.balance <= -0.01)
      .map(p => ({ ...p, owed: Math.abs(p.balance) }));

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
        transactions.push({ from: debtor.name, to: creditor.name, amount });
      }

      debtor.owe -= amount;
      creditor.owed -= amount;

      if (debtor.owe < 0.01) i++;
      if (creditor.owed < 0.01) j++;
    }

    // Fund Accounting (for informational purposes)
    const totalFundCollected = participants.reduce((acc, p) => acc + (p.initialDeposit || 0), 0);
    const totalFundSpent = expenses
      .filter(e => e.paidBy === "FUND")
      .reduce((acc, e) => acc + e.amount, 0);
    const fundRemaining = totalFundCollected - totalFundSpent;

    res.json({
      totalSpent,
      totalExpected,
      deficit,
      deficitShare,
      participantCount,
      fundSummary: {
        totalCollected: totalFundCollected,
        totalSpentFromFund: totalFundSpent,
        remainingBalance: fundRemaining,
      },
      balances: participantBalances,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Update event
router.put("/:id", verifyToken, isAdmin, upload.single('coverImage'), async (req, res) => {
  try {
    const { id } = req.params;
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

    let participantsArray = [];
    if (initialParticipants) {
      try {
        participantsArray = JSON.parse(initialParticipants);
      } catch (e) {
        console.error("Failed to parse initialParticipants:", e);
      }
    }

    const updateData = {
      name: eventName,
      category: category || 'Uncategorized',
      mode: mode || 'quick',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      totalBudget: estimatedBudget ? parseFloat(estimatedBudget) : 0,
      splitMethod: splitMethod || 'Equal Split',
      location,
      description,
      participantsList: participantsArray
    };

    if (req.file) {
      updateData.coverImage = "uploaded_via_memory";
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

    // Sync Participant records
    if (initialParticipants) {
      // For simplicity, we'll remove existing and re-add if this is considered the "authoritative" list
      // In a real app, you'd want to be more careful.
      await Participant.deleteMany({ eventId: id });
      if (participantsArray.length > 0) {
        const participantDocs = participantsArray.map(p => ({
          name: p.name,
          phone: p.phone,
          eventId: id
        }));
        await Participant.insertMany(participantDocs);
      }
    }

    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete event
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    // Also delete associated participants and expenses
    await Participant.deleteMany({ eventId });
    await Expense.deleteMany({ eventId });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
