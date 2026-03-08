const express = require("express");
const axios = require("axios");

const router = express.Router();

const JUDGE0_URL = "https://ce.judge0.com";

const languageMap = {
  python: 71,
  javascript: 63,
  cpp: 54
};

router.post("/", async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language are required" });
    }

    const language_id = languageMap[language.toLowerCase()];
    if (!language_id) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const submission = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id,
        stdin: Buffer.from(stdin || "").toString('base64')
      }
    );

    const decode = (str) => str ? Buffer.from(str, 'base64').toString('utf8') : null;

    res.json({
      stdout: decode(submission.data.stdout),
      stderr: decode(submission.data.stderr),
      compile_output: decode(submission.data.compile_output),
      time: submission.data.time,
      memory: submission.data.memory,
      status: submission.data.status
    });

  } catch (error) {
    if (error.response) {
      console.error("Judge0 Error:", error.response.data);
    } else {
      console.error("Execution error:", error.message);
    }
    res.status(500).json({ error: "Execution failed", details: error.message });
  }
});

module.exports = router;