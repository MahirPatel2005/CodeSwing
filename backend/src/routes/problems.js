const express = require("express");
const Problem = require("../models/Problem");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch problem" });
    }
});

module.exports = router;