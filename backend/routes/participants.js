const express = require("express");
const router = express.Router();
const Participant = require("../models/Participant");

// Get participants for an event
router.get("/event/:eventId", async (req, res) => {
  try {
    const participants = await Participant.find({ eventId: req.params.eventId });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new participant
router.post("/", async (req, res) => {
  const participant = new Participant({
    name: req.body.name,
    eventId: req.body.eventId,
  });

  try {
    const newParticipant = await participant.save();
    res.status(201).json(newParticipant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
