const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    charCount: {
        type: Number,
        required: true
    },
    passed: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    language: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
