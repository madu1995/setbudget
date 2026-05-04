const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  totalBudget: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  category: { type: String, default: "Uncategorized" },
  mode: { type: String, enum: ["quick", "detailed"], default: "quick" },
  startDate: { type: Date },
  endDate: { type: Date },
  splitMethod: { type: String, default: "Equal Split" },
  location: { type: String },
  coverImage: { type: String },
  participantsList: [{ name: String, phone: String }], 
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model("Event", eventSchema);
