require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const eventRoutes = require("./routes/events");
const participantRoutes = require("./routes/participants");
const expenseRoutes = require("./routes/expenses");

app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/expenses", expenseRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://trmadu447_db_user:yGioHe9YHsUzKeNq@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection error:", err));
