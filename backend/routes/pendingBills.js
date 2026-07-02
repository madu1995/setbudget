const express = require("express");
const router = express.Router();
const PendingBill = require("../models/PendingBill");
const Expense = require("../models/Expense");
const { verifyToken, isAdmin } = require("../middleware/auth"); // Adjust based on permissions

// Get pending bills for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const bills = await PendingBill.find({ eventId: req.params.eventId });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new pending bill
router.post("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { vendorName, description, amount, isPaid } = req.body;
    const newBill = new PendingBill({ eventId, vendorName, description, amount, isPaid });
    await newBill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pay pending bill and create expense
router.patch("/:billId/pay", verifyToken, async (req, res) => {
  try {
    const { billId } = req.params;
    const pendingBill = await PendingBill.findById(billId);
    
    if (!pendingBill) {
      return res.status(404).json({ message: "Pending bill not found" });
    }

    if (pendingBill.isPaid) {
      return res.status(400).json({ message: "Bill is already paid" });
    }

    // 1. Update bill status
    pendingBill.isPaid = true;
    await pendingBill.save();

    // 2. Automatically inject/create a new entry in standard Expense list
    const newExpense = new Expense({
      eventId: pendingBill.eventId,
      description: `Paid Bill: ${pendingBill.vendorName} - ${pendingBill.description}`,
      amount: pendingBill.amount,
      paidBy: "FUND", // Or get user ID who paid it if needed
      date: new Date()
    });

    await newExpense.save();

    res.json({ message: "Bill paid and expense recorded", pendingBill, newExpense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
