const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const upload = require("../middleware/upload");
const { verifyToken, canManageEvent } = require("../middleware/auth");

// Get expenses for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    // Populate 'paidBy' to easily get the participant's name
    const expenses = await Expense.find({ eventId: req.params.eventId })
      .populate("paidBy", "name")
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new expense with optional image upload
router.post("/", verifyToken, upload.single("receipt"), canManageEvent, async (req, res) => {
  try {
    const receiptImage = req.file ? "receipt_uploaded_via_memory" : null;

    const expense = new Expense({
      description: req.body.description,
      amount: Number(req.body.amount),
      paidBy: req.body.paidBy,
      eventId: req.body.eventId,
      receiptImage: receiptImage,
    });

    const newExpense = await expense.save();
    // Populate before sending back so client has 'paidBy.name' immediately
    await newExpense.populate("paidBy", "name");
    
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
