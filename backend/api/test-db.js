const mongoose = require('mongoose');

module.exports = async (req, res) => {
    const uri = process.env.MONGO_URI;
    if (!uri) return res.send("MONGO_URI is missing");

    try {
        if (mongoose.connection.readyState === 1) {
            return res.send("Already Connected");
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Fail fast
        });
        res.send(`Connected Successfully to: ${mongoose.connection.host}`);
    } catch (error) {
        res.status(500).send(`Connection Failed: ${error.message}`);
    }
};
