# Real-Time Quiz & Riddle Competition Platform

A web-based platform for conducting live quiz and riddle competitions where administrators manage events, rounds, and questions while participants compete in multi-member teams with progressive sequential unlocking and real-time WebSocket leaderboard synchronization.

See the complete [Requirements Specification](file:///d:/quiz/REQUIREMENTS.md) for full functional, non-functional, and environment requirements.

---

## 1. Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, express-validator, jsonwebtoken, bcryptjs
- **Database**: MongoDB (Mongoose ODM) with automated in-memory fallback (`mongodb-memory-server`) for offline reliability
- **Testing**: Jest + Supertest with isolated in-memory test database
- **Deployment**: Docker & Docker Compose

---

## 2. Default Seed Credentials

After running `npm run seed` in `backend/` (or on first boot):
- **Admin Email**: `admin@example.com`
- **Admin Password**: `ChangeMe123!`
- **Initial Event**: *Grand Championship Quiz & Riddle Tournament 2026* (`ACTIVE`)
- **Initial Round**: *Round 1: Speed & Logic* (`OPEN`, Order 1)
- **Initial Questions**: 3 questions seeded (2 MCQ, 1 RIDDLE) with progressive unlock orders 1, 2, 3.

---

## 3. Quick Start (Local Development)

### Prerequisites
- **Node.js**: `>= 18.0.0` and **npm** installed.
- **MongoDB** (Optional): If MongoDB is not running locally on port 27017, the backend automatically uses an embedded in-memory database (`mongodb-memory-server`) with zero setup needed.

---

### Step 1: Install Dependencies (One-time)
If you haven't already installed dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### Step 2: Seed the Database
Populates the default tournament event, Round 1, sample questions, and the admin account:
```bash
# From the project root:
npm run seed

# OR from backend directory:
cd backend && npm run seed
```

---

### Step 3: Start the Servers

You will need **two terminal windows**:

#### Terminal 1 — Backend API & WebSockets
```bash
# From the project root:
npm run dev:backend

# OR:
cd backend
npm run dev
```
* 🟢 **Backend Port**: `http://localhost:5001`
* 🟢 **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
*(Note: Visiting `http://localhost:5001/` directly returns `Cannot GET /` because it is a REST API; open the Frontend URL below to view the application UI).*

#### Terminal 2 — Frontend User Interface (React + Vite)
```bash
# From the project root:
npm run dev:frontend

# OR:
cd frontend
npm run dev
```
* 🚀 **Open in your browser**: **[http://localhost:5173](http://localhost:5173)**

---

### Step 4: Accessing the App

1. **Admin Login**:
   - Open [http://localhost:5173/login](http://localhost:5173/login)
   - Click **"Fast Fill: Demo Tournament Admin"** or enter:
     - **Email**: `admin@example.com`
     - **Password**: `ChangeMe123!`
   - Access the tournament dashboard to view rounds, edit questions, inspect teams, and view audit submissions.

2. **Participant & Team Competition**:
   - Open [http://localhost:5173/register](http://localhost:5173/register) (e.g. in a private/incognito window).
   - Register a participant account.
   - Create a team to generate a unique 6-character Team Code, or join an existing team using their code.
   - Enter the **Arena** to answer questions sequentially and watch the live leaderboard update in real time!

---

## 4. Quick Start (Docker)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

---

## 5. Running Automated Test Suites

The backend includes 5 isolated test suites executed via Jest and `mongodb-memory-server`:
```bash
cd backend
npm test
```

### Test Coverage Summary
- `tests/auth.test.js`: Participant self-registration only, bcrypt password hashing, JWT expiration, RBAC route gating.
- `tests/team.test.js`: Cryptographic 6-char team code generation, join team, prevent double-team membership, invalid code handling.
- `tests/unlock.test.js`: Progressive sequential unlocking (Question 2 hidden until Question 1 is solved), stripped `correctAnswer` security, manual admin unlock override.
- `tests/scoring.test.js`: Automated point evaluation, retry on incorrect answer, duplicate prevention, **simulated concurrent duplicate submissions asserting score is never double-counted (REL-2)**.
- `tests/leaderboard.test.js`: Rankings sorted by total score descending, and tie-breaking by earliest completion time (`lastScoreUpdateAt ASC`).

---

## 6. End-to-End Acceptance Flow (Section 1.18)

1. **Participant Registration**: Participant registers at `/register`.
2. **Team Formation**: Participant creates a team at `/team-setup` and receives a 6-character Team Code. A second participant joins using that code.
3. **Event & Round Status**: Active event and open Round 1 are exposed.
4. **Question 1 Available**: Team enters `/arena` and receives Question 1 (`unlockOrder = 1`).
5. **Answer Submission**: Team submits answers:
   - Wrong answer awards 0 points and allows retry without penalty.
   - Correct answer awards points atomically.
6. **Live Leaderboard & Question Advance**:
   - Leaderboard broadcasts `leaderboard:update` via WebSockets to all connected clients without page refresh.
   - Question 2 unlocks automatically for the team.
7. **Round Completion**: Solving Question 3 triggers the round complete celebration.
8. **Admin Oversight**: Tournament administrator logs into `/admin` to monitor the live submission audit feed, manage rounds, and trigger manual unlock overrides if needed.
