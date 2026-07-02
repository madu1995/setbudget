const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  itemName: { type: String },
  quantity: { type: String },
  notes: { type: String }
});

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }, // Optional phone number
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  paymentMode: { type: String, enum: ["Full Share", "Fixed Amount"], default: "Full Share" },
  fixedAmount: { type: Number, default: 0 },
  isFixedPayer: { type: Boolean, default: false },
  directContribution: { type: Number, default: 0 },
  materialsContributed: [materialSchema],
  baseFee: { type: Number, default: 0 },
  initialDeposit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Participant", participantSchema);
