

### `Postman Documentation` - https://documenter.getpostman.com/view/39216496/2sBXcLfxE3


# 1. Project Title

CodeSwing Backend

A collaborative competitive coding platform backend that allows multiple users to join rooms, write code, run it using Judge0, submit solutions, and track results.

This backend is designed for **real-time collaborative coding sessions**.

---

# 2. Features Implemented (Phase 0 → Phase 2)

Phase 0:
* Express server setup
* MongoDB Atlas connection
* Environment configuration
* Folder structure
* Judge0 connectivity test

Phase 1:
* Authentication system (register, login, JWT)
* Password hashing with bcrypt
* User, Problem, Room, Submission schemas
* Seed script for coding problems
* Judge0 execution endpoint
* Submission evaluation endpoint
* Room creation and join endpoints

Phase 2:
* Rate limiting on code execution endpoints
* Global Express error handler
* Improved CORS configuration
* Submission history API
* Snapshot endpoint support
* Concurrency safety for Judge0

---

# 3. Project Structure

```text
backend/
  src/
    index.js              # Entry point establishing express server and routing
    models/               # Mongoose schemas
      User.js
      Problem.js
      Room.js
      Submission.js
    routes/               # Express API route controllers
      auth.js
      problems.js
      execute.js
      submit.js
      rooms.js
    middleware/           # Custom middleware functions
      authMiddleware.js
    seed.js               # Database seed script
  .env.example            # Environment variables template
```

---

# 4. Installation Guide

Follow these steps to run the project locally.

```bash
git clone <repository_url>
cd backend
npm install
```

Create a `.env` file in the root backend directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret
```

Start the server in development mode:

```bash
npm run dev
```

Expected console output:

```
MongoDB connected
Server running on port 3000
```

---

# 5. Environment Variables

* **PORT**: The port the backend server listens on (defaults to 3000).
* **MONGODB_URI**: Your MongoDB connection string (e.g., MongoDB Atlas).
* **JWT_SECRET**: Secret key used to sign and verify JSON Web Tokens.

**Note:** The `.env` file contains sensitive information and **should not be committed** to version control.

---

# 6. Database Models

* **User**: Stores authenticated user credentials (`username`, `email`, `passwordHash`).
* **Problem**: Defines competitive coding challenges (`title`, `description`, `difficulty`, `tags`, `testCases`).
* **Room**: Represents a collaborative real-time coding session (`roomId`, `problemId`, `participants`, `password`, `isActive`).
* **Submission**: Tracks user code execution against specific problems (`userId`, `problemId`, `roomId`, `code`, `charCount`, `passed`, `total`, `language`).

---

# 7. Judge0 Integration

Code execution is powered by the **Judge0 public API** (https://ce.judge0.com).

Code is sent securely in `base64` format with the following payload structure:
* `source_code`: The actual code authored by the user.
* `language_id`: Judge0 internal ID referencing the language environment.
* `stdin`: Required console input for evaluating the program.

Supported languages include:
* **Python** (ID: 71)
* **JavaScript** (ID: 63)
* **C++** (ID: 54)

Code execution is sandboxed safely in secure, isolated Judge0 containers protecting against malicious infinite loops or invasive kernel commands.

---

# 8. API Routes Documentation

## Authentication Routes

* **POST /api/auth/register**: Register a new user account.
* **POST /api/auth/login**: Authenticate user and receive JWT.
* **GET /api/auth/me**: Retrieve current authenticated user profile.

## Problems Routes

* **GET /api/problems**: Returns seeded coding problems.

## Code Execution

* **POST /api/execute**: Runs code using Judge0 without evaluating test cases. Request requires `code`, `language`, and `stdin`.

## Submission Evaluation

* **POST /api/submit**: Runs code against all problem test cases and stores results sequentially. Delay metrics prevent 429 warnings. Response returns `passed`, `total`, and full array of tests `results`.

## Submission History

* **GET /api/submit/history**: Returns last 20 submissions. Optional filters `roomId` or `userId`.

## Room Management

* **POST /api/rooms**: Creates a new coding room.
* **POST /api/rooms/join**: Join an existing room via ID and optional password.
* **GET /api/rooms/:roomId**: Fetch comprehensive room details.

## Snapshot Endpoint

* **GET /api/rooms/:roomId/snapshots**: Returns latest submission snapshots grouped by each user. Useful for comparing code via diff tool.

---

# 9. Rate Limiting

To aggressively restrict malicious spikes fetching Judge0 evaluations, rate limiters protect heavy endpoints.

Limit: **10 execution requests per minute per IP.**

Applied to:
* `POST /api/execute`
* `POST /api/submit`

If a user exceeds the limit, Express immediately returns a **429 Too Many Requests** error.

---

# 10. Error Handling

A robust global error middleware resides seamlessly at the basement of Express routing catching unintended crashes.

All unhandled exceptions correctly route to internal loggers and cleanly return **JSON formatting** (500 Internal Server Error) instead of brutally crashing the entire Node process.

---

# 11. Testing APIs

Test via tools like Postman, Thunder Client, or cURL.

Example cURL for running python execution:

```bash
curl -X POST http://localhost:3000/api/execute \
-H "Content-Type: application/json" \
-d '{"code": "print(input())", "language": "python", "stdin": "Hello CodeSwing!"}'
```

---

# 12. Development Notes

This project architecture supports **three developers working in parallel**.

* **Person A** – Backend APIs (Express, MonogDB endpoints)
* **Person B** – Realtime system (Socket.io + Redis integration)
* **Person C** – React frontend interface

Currently wrapped Phase 2. Moving onto **Phase 3 will integrate realtime features** across websockets globally connecting live editing capabilities.

---


