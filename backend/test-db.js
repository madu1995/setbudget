const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://trmadu447_db_user:setbudget123@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

async function testConnection() {
  console.log("Testing connection to:", MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log("SUCCESS: Connected to MongoDB");
    const User = require('./models/User');
    const users = await User.find();
    console.log("Users in DB:");
    users.forEach(u => console.log(`- ${u.username} (Role: ${u.role})`));
    process.exit(0);
  } catch (err) {
    console.error("FAILURE: Connection error details:");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
