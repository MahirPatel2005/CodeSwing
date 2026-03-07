const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const authRoutes = require("./routes/auth")
const problemRoutes = require("./routes/problems")
const executeRoutes = require("./routes/execute")
const roomRoutes = require("./routes/rooms")

const app = express()

app.use(cors())
app.use(express.json())

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// mount routes
app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/execute", executeRoutes)
app.use("/api/rooms", roomRoutes)

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