const mongoose = require("mongoose");

const pendingBillSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  vendorName: { type: String },
  description: { type: String },
  amount: { type: Number, required: true },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("PendingBill", pendingBillSchema);
