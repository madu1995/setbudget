const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const upload = require("../middleware/upload");
const { verifyToken, canManageEvent } = require("../middleware/auth");

// Get expenses for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ eventId: req.params.eventId }).sort({ date: -1 });

    // Manually populate paidBy only for non-FUND expenses
    const Participant = require("../models/Participant");
    const enriched = await Promise.all(expenses.map(async (exp) => {
      const obj = exp.toObject();
      if (exp.paidBy === "FUND") {
        obj.paidBy = { _id: "FUND", name: "💰 Event Fund" };
      } else {
        const participant = await Participant.findById(exp.paidBy).select("name");
        obj.paidBy = participant || { _id: exp.paidBy, name: "Unknown" };
      }
      return obj;
    }));

    res.json(enriched);
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

// Update an expense
router.put("/:id", verifyToken, canManageEvent, async (req, res) => {
  try {
    const { description, amount, paidBy } = req.body;
    
    const updateData = {};
    if (description) updateData.description = description;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (paidBy) updateData.paidBy = paidBy;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an expense
router.delete("/:id", verifyToken, canManageEvent, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
