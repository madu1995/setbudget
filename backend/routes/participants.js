const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");
const { verifyToken, canManageEvent } = require("../middleware/auth");

// Get participants for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const participants = await Participant.find({ eventId: req.params.eventId });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new participant
router.post("/", verifyToken, canManageEvent, async (req, res) => {
  const { name, phone, eventId } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (phone) {
    const slPhoneRegex = /^(?:0|94|\+94)?7(?:0|1|2|4|5|6|7|8)\d{7}$/;
    if (!slPhoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid Sri Lankan phone number" });
    }
  }

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  const participant = new Participant({
    name,
    phone,
    eventId,
  });

  try {
    const newParticipant = await participant.save();
    res.status(201).json(newParticipant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
