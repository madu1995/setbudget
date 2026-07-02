const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { verifyToken, isAdmin } = require("../middleware/auth"); // Adjust based on permissions

// Get tasks for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ eventId: req.params.eventId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new task
router.post("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { taskName, assignedLead, conceptDesignBy, status } = req.body;
    const newTask = new Task({ eventId, taskName, assignedLead, conceptDesignBy, status });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status
router.patch("/:taskId/status", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'pending', 'in_progress', 'completed'
    
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
