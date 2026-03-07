const express = require("express");
const axios = require("axios");

const router = express.Router();

const JUDGE0_URL = "https://ce.judge0.com";

router.post("/", async (req, res) => {
  try {
    const { source_code, language_id, stdin } = req.body;

    // Step 1: Submit code
    const submission = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code,
        language_id,
        stdin,
      }
    );

    // Step 2: Return result
    res.json({
        stdout: submission.data.stdout,
  stderr: submission.data.stderr,
  compile_output: submission.data.compile_output,
  time: submission.data.time,
  memory: submission.data.memory,
  status: submission.data.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Execution failed" });
  }
});

module.exports = router;