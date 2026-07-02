require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Vercel වලදී uploads folder එකක් ලිවීමට නොහැකි නිසා මෙය දැනට අක්‍රිය කරන්න
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const participantRoutes = require("./routes/participants");
const expenseRoutes = require("./routes/expenses");
const pendingBillRoutes = require("./routes/pendingBills");
const borrowedItemRoutes = require("./routes/borrowedItems");
const taskRoutes = require("./routes/tasks");
const publicDonationRoutes = require("./routes/publicDonations");

// Public ping endpoint for pre-warming/cold-start wake-up
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/pending-bills", pendingBillRoutes);
app.use("/api/borrowed-items", borrowedItemRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/public-donations", publicDonationRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://trmadu447_db_user:setbudget123@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

if (!process.env.MONGODB_URI) {
  console.warn("⚠️ Warning: MONGODB_URI environment variable is not defined. Falling back to default Atlas connection string.");
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ Warning: JWT_SECRET environment variable is not defined. Falling back to default secret key.");
}

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

// MongoDB එකට connect වීම
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB successfully");
    await seedAdmin();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });

// Local development සඳහා පමණක් listen කරන්න
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
    });
}

// Vercel සඳහා අත්‍යවශ්‍ය වේ
module.exports = app;