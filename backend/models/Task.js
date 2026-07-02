const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  taskName: { type: String, required: true },
  assignedLead: { type: String },
  conceptDesignBy: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
