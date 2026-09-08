const express = require("express");
const router = express.Router();
const BorrowedItem = require("../models/BorrowedItem");
const Expense = require("../models/Expense");
const { verifyToken, isAdmin } = require("../middleware/auth"); // Adjust based on permissions

// Get borrowed items for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const items = await BorrowedItem.find({ eventId: req.params.eventId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Return a borrowed item
router.patch("/:itemId/return", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await BorrowedItem.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: "Borrowed item not found" });
    }

    item.isReturned = true;
    item.dateReturned = new Date();
    
    await item.save();

    // Ensure expense is recorded if there is a rental fee and not already tracked
    if (item.rentalFee > 0) {
      const existingExpense = await Expense.findOne({
        eventId: item.eventId,
        description: new RegExp(`Rental Fee: ${item.itemName}`, 'i')
      });
      if (!existingExpense) {
        const rentalExpense = new Expense({
          eventId: item.eventId,
          description: `Rental Fee: ${item.itemName}${item.borrowedFrom ? ` (from ${item.borrowedFrom})` : ''}`,
          amount: item.rentalFee,
          paidBy: "FUND",
          date: item.dateReturned || new Date()
        });
        await rentalExpense.save();
      }
    }

    res.json({ message: "Item marked as returned", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
