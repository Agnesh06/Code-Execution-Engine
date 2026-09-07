# System & Software Requirements Specification

Project: **Real-Time Quiz & Riddle Competition Platform**  
Source of Truth: `csea_recruitment_ps1.pdf` & Technical Specification  
Version: 1.0.0

---

## 1. System & Runtime Environment Requirements

| Layer | Requirement | Supported Version | Notes |
|---|---|---|---|
| **Operating System** | Windows, Linux, or macOS | Cross-platform | Tested on Windows 11 / Linux |
| **Runtime** | Node.js | `>= 18.0.0` (LTS recommended, tested on v24.x) | CommonJS (Backend), ESM (Frontend) |
| **Package Manager** | npm | `>= 9.0.0` (tested on v11.x) | Bundled with Node.js |
| **Database** | MongoDB | `>= 6.0` (or `mongodb-memory-server` fallback) | Embedded in-memory fallback enabled |
| **Container Engine** | Docker & Docker Compose | Optional (Docker `>= 20.x`, Compose `>= 2.x`) | For containerized multi-service deployment |
| **Web Browser** | Chromium, Firefox, WebKit | Modern evergreen browsers | ES6+, WebSocket support |

---

## 2. Software Dependencies & Libraries

### 2.1 Backend Dependencies (`backend/package.json`)

#### Production Dependencies:
- **`express`** (`^4.21.2`): HTTP REST API routing and middleware pipeline.
- **`mongoose`** (`^8.9.5`): Object Data Modeling (ODM) for MongoDB with schema validation and indexing.
- **`socket.io`** (`^4.8.1`): Bidirectional event-driven real-time transport for live leaderboard synchronization.
- **`jsonwebtoken`** (`^9.0.2`): Stateless authentication token generation and verification (8h expiry).
- **`bcryptjs`** (`^2.4.3`): Password hashing using salted bcrypt (cost factor 10).
- **`cors`** (`^2.8.5`): Cross-Origin Resource Sharing middleware for frontend-backend communication.
- **`dotenv`** (`^16.4.7`): Environment variable configuration management.
- **`express-validator`** (`^7.2.1`): Input validation and sanitization middleware on routes.

#### Development & Testing Dependencies:
- **`jest`** (`^29.7.0`): Automated test runner and assertion library.
- **`supertest`** (`^7.0.0`): Programmatic HTTP endpoint integration testing.
- **`mongodb-memory-server`** (`^10.1.3`): Ephemeral in-memory MongoDB instance for isolated testing and offline fallback.
- **`nodemon`** (`^3.1.9`): Live-reloading developer server.

---

### 2.2 Frontend Dependencies (`frontend/package.json`)

#### Production Dependencies:
- **`react`** (`^18.3.1`): Component-based UI library.
- **`react-dom`** (`^18.3.1`): Virtual DOM renderer for web browsers.
- **`react-router-dom`** (`^6.28.0`): Client-side routing and protected route guards.
- **`socket.io-client`** (`^4.8.1`): WebSocket client subscribing to real-time broadcasts.
- **`lucide-react`** (`^0.475.0`): SVG icon library for UI visual indicators and badges.

#### Development Dependencies:
- **`vite`** (`^5.4.11`): High-speed frontend build tool and dev server.
- **`@vitejs/plugin-react`** (`^4.3.4`): Fast Refresh Babel/SWC React plugin for Vite.
- **`tailwindcss`** (`^3.4.17`): Utility-first CSS framework for tournament design system.
- **`postcss`** (`^8.4.49`) & **`autoprefixer`** (`^10.4.20`): CSS processing and vendor prefixing.

---

## 3. Functional Requirements (FR)

### 3.1 Participant Portal
- **FR-1**: Participants must be able to register with name, email, and password.
- **FR-2**: Participants must be able to securely log in and obtain an authorization token.
- **FR-3**: A participant can create a team and receive a unique 6-character alphanumeric Team Code.
- **FR-4**: Other participants can join an existing team by submitting its Team Code.
- **FR-5**: Participants can view current event and round details.
- **FR-6**: Participants can access only currently unlocked questions sequentially. Correct answers must never be exposed to participants.
- **FR-7**: Participants can submit answers to the current question (MCQ selection or Riddle text).
- **FR-8**: Participants can view their team's score and recent submission history.
- **FR-9**: Participants can view their current rank on the live tournament leaderboard.

### 3.2 Admin Portal
- **FR-10**: Administrators can manage questions (Create, Read, Update, Delete for MCQ and Riddle types).
- **FR-11**: Administrators can view an audit feed of submissions made by all participating teams.
- **FR-12**: Administrators can inspect registered teams and manage team membership.
- **FR-13**: Administrators can control competition rounds (open rounds, close rounds).
- **FR-14**: Administrators can view global leaderboard rankings and score breakdowns.
- **RC-3**: Administrators can manually unlock a specific question for a team during the competition without awarding points.

---

## 4. Non-Functional & Security Requirements

| ID | Category | Requirement Description |
|---|---|---|
| **AR-1** | Authentication | Secure stateless authentication via JWT tokens. |
| **AR-2** | Security | Passwords must never be stored in plain text; hashed using bcrypt (cost factor 10, min 8 characters). |
| **AR-3** | Authorization | Protected routes accessible only to authenticated users with matching roles (`ADMIN` vs `PARTICIPANT`). |
| **SEC-1** | RBAC | Participant accounts can never access administrative endpoints (returns `403 Forbidden`). |
| **SEC-2** | Data Privacy | The `correctAnswer` field is strictly stripped from all participant responses. |
| **REL-1** | Reliability | Scores must remain accurate under all conditions. |
| **REL-2** | Concurrency | No duplicate scoring: enforced by a unique compound index `{ team: 1, question: 1 }` and atomic write ordering. |
| **REL-3** | Error Handling | Centralized error handler returning uniform `{ error: { code, message } }` payloads. |
| **RT-1** | Real-Time | Leaderboard updates broadcast over WebSockets (`Socket.IO`) without manual page refresh. |
| **RT-2** | Real-Time Sync | All connected participants and spectators see identical live standings. |
| **SC-1** | Scalability | Stateless API server ready for horizontal scaling; indexes on `teamCode`, `(team, question)`, and `unlockOrder`. |

---

## 5. Domain Rules & Locked Decisions (D-1 to D-10)

- **D-1**: One ADMIN user is created exclusively via the database seed script (`admin@example.com`). Public self-registration only creates `PARTICIPANT` accounts.
- **D-2**: A participant belongs to at most one team for the competition.
- **D-3**: Sequential order is dictated by integer `unlockOrder` within each round.
- **D-4**: Hierarchy: `Event` (1) → `Round` (many) → `Question` (many). One active event at a time.
- **D-5**: Opening a round automatically exposes its first question (`unlockOrder = 1`).
- **D-6**: Tie-breaker rule: when two teams tie in total score, the team with the **earliest completion time** (`lastScoreUpdateAt`) ranks higher.
- **D-7**: Retries on incorrect answers are permitted without penalty. Every attempt is logged in `Submission`, but only the first correct submission awards points.
- **D-8**: Real-time scope is dedicated to leaderboard updates (`leaderboard:update`). Question advance is fetched upon submission response.
- **D-9**: MCQ stores options array `string[]`; Riddle accepts free-form text. Evaluation trims and normalizes lowercase.
- **D-10**: Password policy: minimum 8 characters.

---

## 6. Port & Network Requirements

| Service | Default Port | Protocol | Usage |
|---|---|---|---|
| **Frontend Web App** | `5173` (or `80` in Docker) | HTTP / WebSocket | Vite React client |
| **Backend REST API** | `5001` (or `5000` configurable) | HTTP / WebSocket | Express server & Socket.IO |
| **MongoDB** | `27017` | TCP | Database daemon (if using standalone/Docker) |

---

## 7. Verification & Acceptance Checklist

- [x] Node.js & npm packages install without dependency conflicts.
- [x] `npm test` in `backend/` passes all 5 test suites (15/15 tests green).
- [x] Concurrent submissions test asserts score is credited exactly once (no race condition).
- [x] Pre-seeded admin account logs in and accesses the Admin Command Center.
- [x] Participant registration and team creation generates a 6-character alphanumeric code.
- [x] Question 1 exposes properly; Question 2 remains locked until Question 1 is solved.
- [x] Manual admin question unlock makes question accessible without scoring.
- [x] Real-time leaderboard updates dynamically when correct answer is submitted.
