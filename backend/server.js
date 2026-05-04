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
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const participantRoutes = require("./routes/participants");
const expenseRoutes = require("./routes/expenses");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/expenses", expenseRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://trmadu447_db_user:yGioHe9YHsUzKeNq@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

const seedAdmin = async () => {
  const User = require("./models/User");
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: "Administrator",
        username: "admin",
        password: "1234",
        role: "admin",
        requiresPasswordChange: true
      });
      console.log("Default admin user created. Username: admin, Password: 1234");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");
    await seedAdmin();
  })
  .catch((err) => {
    console.error("❌ Database connection error:");
    console.error(err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
