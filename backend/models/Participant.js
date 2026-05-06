const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }, // Optional phone number
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  paymentMode: { type: String, enum: ["Full Share", "Fixed Amount"], default: "Full Share" },
  fixedAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Participant", participantSchema);
