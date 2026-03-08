const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const problemRoutes = require("./routes/problems")
const executeRoutes = require("./routes/execute")
const roomRoutes = require("./routes/rooms")
const submitRoutes = require("./routes/submit")

const app = express()

app.use(cors({
  origin: "*",
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ]
}))
app.use(express.json())

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// mount routes
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many execution requests, slow down"
  }
})

app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/execute", executeLimiter, executeRoutes)
app.use("/api/rooms", roomRoutes)
app.use("/api/submit", executeLimiter, submitRoutes)
app.use("/api/submissions", executeLimiter, submitRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  })
})

const PORT = process.env.PORT || 3000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection failed")
    process.exit(1)
  })