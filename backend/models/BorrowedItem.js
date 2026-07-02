const mongoose = require("mongoose");

const borrowedItemSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  itemName: { type: String, required: true },
  borrowedFrom: { type: String },
  takenBy: { type: String },
  dateBorrowed: { type: Date },
  rentalFee: { type: Number, default: 0 },
  isReturned: { type: Boolean, default: false },
  dateReturned: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("BorrowedItem", borrowedItemSchema);
