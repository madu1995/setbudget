const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "Participant", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  receiptImage: { type: String }, // Path to the uploaded image
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", expenseSchema);
