# AI-Powered Water Treatment Plant Monitoring & Chemical Optimization System

An academic MERN stack prototype for real-time water treatment monitoring, simulated anomaly detection, rule-based AI chemical dose optimization, human-in-the-loop approval, and what-if digital twin simulation.

---

## 🌟 Key Features

1. **Authentication & Role-Based Access Control (RBAC)**
   - **OPERATOR**: Live monitoring, alert acknowledgement, AI chemical dose approval/adjustment, digital twin execution, compliance reports.
   - **ADMIN**: Full access including managing plants, sensors, equipment, thresholds, user access, and system resolution.
   - **AUDITOR**: Read-only access to historical telemetry, dose approvals, compliance reports, and immutable audit logs.

2. **Sensor Simulator & Telemetry Engine**
   - Simulates **pH**, **Turbidity**, **Chlorine**, **Flow**, and **Pressure** with realistic random walk variations and occasional simulated anomalies.
   - Automatically generates alerts upon threshold breaches.

3. **Rule-Based AI Chemical Dose Recommendation**
   - Calculates recommended chlorine dosing based on water parameters (pH, turbidity, flow, residual chlorine).
   - Generates confidence scores and detailed human-readable rationales.
   - **Human-in-the-Loop**: Requires operator **Approve**, **Adjust**, or **Reject** action before logging.

4. **Digital Twin "What-If" Simulation**
   - Mathematical model simulating water quality score shift and parameter changes when varying chemical dosage.

5. **Compliance PDF Report Generation**
   - Generates downloadable compliance reports detailing water quality stats, incidents, and AI dosing efficiency.

6. **Audit Trail Logging**
   - Immutable audit log tracking logins, dose decisions, threshold changes, and report generations.

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Operator** | `operator@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |
| **Auditor** | `auditor@example.com` | `password123` |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- MongoDB Community Server (Running on `mongodb://127.0.0.1:27017`)

---

### Step 1: Server Setup & Seeding

```bash
cd server
npm install
npm run seed
npm run dev
```

*The server will start on `http://localhost:5000` and launch the live sensor simulator.*

---

### Step 2: Client Setup

```bash
cd client
npm install
npm run dev
```

*Open your browser at `http://localhost:5173` to launch the application.*

---

## 📁 Project Structure

```text
AI-Powered-Water-Treatment/
├── client/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar
│   │   ├── context/        # AuthContext (JWT & User state)
│   │   ├── pages/          # Dashboard, Chemical Optimization, Digital Twin, Reports, etc.
│   │   ├── api.js          # Axios client with JWT interceptor
│   │   ├── App.jsx         # React Router & RBAC layout
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── config/             # DB connection
│   ├── controllers/        # Auth, Sensors, AI, Digital Twin, Reports, Alerts, Audit
│   ├── middleware/         # JWT Auth & RBAC Middleware
│   ├── models/             # 11 Mongoose Schemas (User, Plant, Sensor, Alert, etc.)
│   ├── routes/             # Express API Endpoints
│   ├── services/           # Sensor Simulator, AI Rule Engine, Digital Twin, Anomaly Engine
│   ├── utils/              # PDF Generator (PDFKit), Audit Logger
│   ├── seed/               # Database Seeding Script
│   ├── .env.example
│   └── server.js
├── .gitignore
└── README.md
```

---

## ⚠️ Academic Disclaimer

*This application is a college academic prototype demonstration. All sensor readings, equipment health scores, digital twin physics predictions, and chemical dosage calculations are simulated demo data. Do not use for actual industrial chemical control.*
