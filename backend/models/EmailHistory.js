const mongoose = require('mongoose');

const EmailHistorySchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    recipients: {
        type: [String],
        required: true,
    },
    attachments: {
        type: [{ filename: String, size: Number }],
        default: [],
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success',
    },
    errorMessage: {
        type: String,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('EmailHistory', EmailHistorySchema);
