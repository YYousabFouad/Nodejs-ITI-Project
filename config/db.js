const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("=== connectDB() called ===");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error");
    console.error(error);
  }
};

module.exports = connectDB;
