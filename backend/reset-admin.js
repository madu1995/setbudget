require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://trmadu447_db_user:setbudget123@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const admin = await User.findOne({ username: "admin" });
    if (admin) {
      admin.password = "1234";
      admin.requiresPasswordChange = true;
      await admin.save();
      console.log("Admin password reset to 1234");
    } else {
      await User.create({
        name: "Administrator",
        username: "admin",
        password: "1234",
        role: "admin",
        requiresPasswordChange: true
      });
      console.log("Admin user created with password 1234");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
