const express = require("express");
const router = express.Router();
const PublicDonation = require("../models/PublicDonation");
const { verifyToken, isAdmin } = require("../middleware/auth"); // Adjust based on permissions

// Get public donations for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const donations = await PublicDonation.find({ eventId: req.params.eventId });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new public donation
router.post("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { donorName, amount, dateReceived } = req.body;
    const newDonation = new PublicDonation({ eventId, donorName, amount, dateReceived });
    await newDonation.save();
    res.status(201).json(newDonation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
