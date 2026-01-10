const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // এটি আপনার .env ফাইলের MONGO_URI ব্যবহার করবে
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;