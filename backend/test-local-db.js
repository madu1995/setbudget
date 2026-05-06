const mongoose = require('mongoose');

const LOCAL_URI = "mongodb://localhost:27017/setbudget";

async function testLocal() {
  console.log("Testing LOCAL connection to:", LOCAL_URI);
  try {
    await mongoose.connect(LOCAL_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("SUCCESS: Connected to LOCAL MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("FAILURE: Local connection failed.");
    process.exit(1);
  }
}

testLocal();
