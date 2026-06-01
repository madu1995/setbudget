const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.Mixed, required: true }, // ObjectId or "FUND"
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  receiptImage: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);
