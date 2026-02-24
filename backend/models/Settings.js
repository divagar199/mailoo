const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    emailUser: {
        type: String,
        required: true,
    },
    emailPass: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Settings", SettingsSchema);
