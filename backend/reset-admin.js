const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://trmadu447_db_user:yGioHe9YHsUzKeNq@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log("Admin user not found!");
      process.exit(1);
    }
    
    user.password = '1234';
    user.requiresPasswordChange = true;
    await user.save();
    
    console.log("Admin password reset to '1234' and requiresPasswordChange set to true.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetAdminPassword();
