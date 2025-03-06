const mongoose = require("mongoose");

exports.connectDB = () => {
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log("connected to db");
    } catch (error) {
        handleError(error);
    }
}