const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://trmadu447_db_user:yGioHe9YHsUzKeNq@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, 'username role name');
    console.log("Registered Users:", JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
