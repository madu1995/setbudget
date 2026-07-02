const mongoose = require("mongoose");

const publicDonationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  donorName: { type: String, default: "Anonymous" },
  amount: { type: Number, required: true },
  dateReceived: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("PublicDonation", publicDonationSchema);
