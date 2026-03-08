const express = require('express');
const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const JUDGE0_URL = "https://ce.judge0.com";

const languageMap = {
    python: 71,
    javascript: 63,
    cpp: 54
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { problemId, code, language, roomId } = req.body;

        if (!problemId || !code || !language) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const language_id = languageMap[language.toLowerCase()];
        if (!language_id) {
            return res.status(400).json({ error: 'Unsupported language' });
        }

        let passed = 0;
        const total = problem.testCases.length;
        const results = [];

        for (const testCase of problem.testCases) {
            const submission = await axios.post(
                `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
                {
                    source_code: Buffer.from(code).toString('base64'),
                    language_id,
                    stdin: Buffer.from(testCase.input || "").toString('base64')
                }
            );

            const decode = (str) => str ? Buffer.from(str, 'base64').toString('utf8') : '';

            const actualOutput = decode(submission.data.stdout).trim();
            const expectedOutput = (testCase.expectedOutput || '').trim();

            const isPassed = actualOutput === expectedOutput;
            if (isPassed) {
                passed++;
            }

            results.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput,
                passed: isPassed,
                isHidden: testCase.isHidden,
                status: submission.data.status
            });
            await sleep(200);
        }

        const charCount = Buffer.byteLength(code, 'utf8');

        const newSubmission = new Submission({
            userId: req.user.userId,
            problemId,
            roomId: roomId || 'none', // Handle optional roomId if not provided
            code,
            charCount,
            passed,
            total,
            language
        });

        await newSubmission.save();

        res.json({
            passed,
            total,
            results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Submission evaluation failed' });
    }
});

router.get(['/', '/history', '/submissions'], authMiddleware, async (req, res) => {
    console.log("SUBMISSIONS ROUTE HIT");
    try {
        const { roomId, userId } = req.query;
        let query = {};
        if (roomId) query.roomId = roomId;
        if (userId) query.userId = userId;

        const submissions = await Submission.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

module.exports = router;


