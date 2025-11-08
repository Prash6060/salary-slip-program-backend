require('dotenv').config();
const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log("✅ successfully connected to database");
    } catch (error) {
        console.log("❌ database connection failed", error);
        process.exit(1);
    }
};

module.exports = connectDB;
