const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/KarmaLedger";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "Tip: run `mongod` locally, or set MONGO_URI to an Atlas connection string.",
    );
    process.exit(1);
  }
}

module.exports = connectDB;
