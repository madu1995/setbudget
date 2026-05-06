const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://trmadu447_db_user:yGioHe9YHsUzKeNq@cluster0.6q0hhuy.mongodb.net/setbudget?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    console.log("Attempting to connect with MongoClient...");
    await client.connect();
    console.log("Connected successfully to Atlas");
    const db = client.db("setbudget");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("MongoClient connection error:");
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
