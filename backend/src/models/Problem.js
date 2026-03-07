const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    tags: [{
        type: String
    }],
    testCases: [{
        input: {
            type: String,
            required: true
        },
        expectedOutput: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
