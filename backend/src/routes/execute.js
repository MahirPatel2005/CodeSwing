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
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id,
        stdin: stdin || ""
      }
    );

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