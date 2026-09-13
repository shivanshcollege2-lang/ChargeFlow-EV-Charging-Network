# ChargeGrid – EV Charging Network

ChargeGrid is a full-stack EV charging management platform designed to simplify the process of discovering charging stations, checking availability, reserving charging slots, managing bookings, and tracking charging sessions.

The platform connects EV drivers with charging-station operations through authenticated workflows. Drivers can register, discover stations, reserve charging slots, manage bookings, start charging sessions, and track charging activity. Authorized operators can manage station information and availability.

> **Project note:** The current repository is a standalone demonstration build using Node.js, Express.js, JWT authentication, bcrypt-based password hashing, and JSON persistence. The repository also contains a MySQL-oriented relational schema for the production-style data model.

---

## 1. Problem Statement

EV users need a reliable way to discover charging infrastructure, understand station availability, choose suitable charging options, reserve a charging slot, and manage the charging session.

At the operational level, the system must also enforce rules such as:

- Only authenticated users can create bookings or sessions.
- Unavailable stations cannot be booked.
- Invalid booking durations are rejected.
- A confirmed slot cannot be booked twice.
- A driver cannot run multiple active charging sessions simultaneously.
- Operator-only operations must be protected from ordinary users.

ChargeGrid converts these requirements into a complete application workflow rather than treating the system as a simple form-and-database application.

---

## 2. Core Workflow

```text
Driver Registration / Login
          ↓
Station Discovery
          ↓
Station Details & Availability
          ↓
Select Date / Time / Duration
          ↓
Server-Side Booking Validation
          ↓
Booking Confirmation
          ↓
Start Charging Session
          ↓
Track Energy & Cost
          ↓
Complete Session
          ↓
Restore Station Availability
```

The broader project architecture also models users, vehicles, stations, charging points, bookings, sessions, operators, and payments as connected entities.

---

## 3. Key Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- Password hashing using `bcryptjs`
- Protected API routes
- Role-based authorization
- Driver and operator roles
- Seven-day JWT expiry in the current implementation
- Server-side validation

### Station Discovery

- Browse charging stations
- Search by station name, city, or address
- Filter stations by availability/status
- View station details
- View charging power, connector information, pricing, total ports, and available ports

### Booking Management

- Select station
- Select date and time
- Select booking duration
- Supported durations: 30, 60, 90, and 120 minutes
- Validate booking details on the server
- Prevent duplicate confirmed bookings for the same station/date/time
- View personal dashboard and booking history
- Cancel own bookings

### Charging Sessions

- Start charging session
- Prevent more than one active session per driver
- Mark station as busy when a session starts
- Reduce available-port count when a session starts
- Track session duration
- Calculate energy consumption
- Calculate charging cost
- Complete charging session
- Restore station availability after completion

### Dashboard

The authenticated dashboard exposes:

- Total bookings
- Active-session status
- Total energy consumed
- Unread notifications
- Booking history
- Charging-session history

### Notifications

The application generates user notifications for important events including:

- Account registration
- Booking confirmation
- Booking cancellation
- Charging-session start
- Charging-session completion

Users can mark notifications as read.

### Operator Management

Operator-only APIs allow authorized users to:

- View station inventory
- Update station status
- Update charging power
- Update connector information
- Update pricing

The server verifies the user's role before allowing operator operations.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Authentication | JWT |
| Password Security | bcryptjs |
| Current Persistence | JSON (`data/db.json`) |
| Relational Schema Reference | MySQL (`database_schema.sql`) |
| API Style | REST |
| Development Tools | Git, GitHub, VS Code, Postman |

The internship/report architecture for the broader ChargeGrid/ChargeFlow implementation uses React.js, React Router, Node.js, Express.js, MySQL, JWT, Git/GitHub, and Postman, with a three-tier presentation/application/data model.

---

## 5. System Architecture

### Current Repository Architecture

```text
┌─────────────────────────────────────────┐
│              Web Client                 │
│                                         │
│  Landing Page                           │
│  Login / Register                       │
│  Station Discovery                      │
│  Booking                                │
│  Dashboard                              │
│  Charging Session                       │
│  Notifications                          │
└────────────────────┬────────────────────┘
                     │
                     │ HTTP / REST
                     ▼
┌─────────────────────────────────────────┐
│          Node.js + Express.js           │
│                                         │
│  Authentication                         │
│  JWT Verification                       │
│  Role Authorization                     │
│  Station APIs                           │
│  Booking Logic                          │
│  Session Management                     │
│  Notification Management                │
└────────────────────┬────────────────────┘
                     │
                     │ File Persistence
                     ▼
┌─────────────────────────────────────────┐
│              data/db.json               │
│                                         │
│ users                                    │
│ stations                                │
│ bookings                                │
│ sessions                                │
│ notifications                           │
└─────────────────────────────────────────┘
```

### Production-Oriented Data Model

The repository also contains `database_schema.sql`, which defines a relational structure for:

```text
Users
  ├── Vehicles
  └── Bookings
          ├── Charging Sessions
          └── Payments

Stations
  └── Charging Points
          └── Bookings
```

The documented relational design uses primary and foreign keys to connect the core EV charging entities.

---

## 6. How the Application Works

### 6.1 Registration

A user submits name, email, and password.

The backend:

```text
Validate Input
      ↓
Check Email Uniqueness
      ↓
Hash Password
      ↓
Create Driver Account
      ↓
Create Welcome Notification
      ↓
Issue JWT
```

### 6.2 Login

```text
Email + Password
      ↓
Find User
      ↓
Compare Password Hash
      ↓
Issue JWT
      ↓
Return User + Token
```

### 6.3 Station Discovery

The station API supports search/filter behavior using station name, city, address, and status.

### 6.4 Booking

The booking endpoint validates:

- Station ID
- Date
- Time
- Allowed duration
- Station existence
- Station availability
- Existing confirmed booking

The request is rejected when validation fails. Otherwise a confirmed booking is stored and a notification is generated.

### 6.5 Booking Conflict Prevention

The broader system design treats overlapping reservations as a server-side business rule rather than relying only on the UI. The documented overlap condition is:

```text
new_start < existing_end
AND
new_end > existing_start
```

This prevents partial overlaps and containment cases.

### 6.6 Charging Session

When a driver starts a session:

```text
Authenticate User
      ↓
Check Existing Active Session
      ↓
Check Station Availability
      ↓
Station → Busy
      ↓
Available Ports → Available Ports - 1
      ↓
Create Active Session
```

When the session is completed:

```text
Active Session
      ↓
Calculate Duration
      ↓
Calculate Energy
      ↓
Calculate Cost
      ↓
Session → Completed
      ↓
Restore Station Availability
      ↓
Create Completion Notification
```

The broader project architecture explicitly separates reservations from actual charging sessions and models session state transitions.

---

## 7. Project Structure

```text
ChargeGrid/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── book.html
│   └── dashboard.html
│
├── data/
│   └── db.json
│
├── database_schema.sql
├── server.js
├── package.json
└── README.md
```

---

## 8. Database Design

### Current Runtime Collections

The current standalone build persists the following collections in `data/db.json`:

```text
users
stations
bookings
sessions
notifications
```

### Relational Schema Reference

`database_schema.sql` defines the following production-oriented tables:

#### `users`

```text
user_id
name
email
password_hash
role
created_at
```

#### `stations`

```text
station_id
name
address
city
status
created_at
```

#### `charging_points`

```text
point_id
station_id
connector
power_kw
rate
status
```

#### `bookings`

```text
booking_id
user_id
point_id
start_time
end_time
status
created_at
```

#### `charging_sessions`

```text
session_id
booking_id
start_at
end_at
energy_kwh
```

#### `payments`

```text
payment_id
booking_id
amount
status
paid_at
```

The training documentation describes the same core relational relationships between users, vehicles, stations, charging points, bookings, sessions, and payments.

---

## 9. REST API

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API health check |

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register driver |
| `POST` | `/api/auth/login` | Authenticate user |

### Stations

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/stations` | List/search/filter stations |
| `GET` | `/api/stations/:id` | Get station details |

### Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/dashboard` | Return authenticated user's dashboard data |

### Bookings

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/bookings` | Create booking |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel own booking |

### Charging Sessions

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/sessions/start` | Start active session |
| `PATCH` | `/api/sessions/:id/complete` | Complete active session |

### Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |

### Operator

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/operator/stations` | View station inventory |
| `PATCH` | `/api/operator/stations/:id` | Update station information |

Operator endpoints are protected by JWT authentication and an operator-role check.

The broader project report documents the same resource-oriented REST approach for authentication, stations, bookings, sessions, and operator operations.

---

## 10. Authentication & Authorization

ChargeGrid uses JWT-based authentication.

```text
Login
  ↓
JWT Issued
  ↓
Bearer Token
  ↓
Protected API
  ↓
JWT Verification
  ↓
Authenticated User
  ↓
Role Check
```

The JWT payload contains the authenticated user's identity and role.

Authorization is enforced at the backend, so hiding an operator button in the frontend is not considered a security control. Operator endpoints explicitly reject users whose role is not `operator`.

The broader project documentation also emphasizes the separation between authentication and authorization and server-side role enforcement.

---

## 11. Validation & Business Rules

Important rules implemented in the application include:

- Name must be at least two characters during registration.
- Email must contain a valid basic email pattern.
- Password must be at least six characters during registration.
- Duplicate emails are rejected.
- Invalid login credentials return an authentication error.
- Only supported booking durations are accepted.
- Unavailable stations cannot be booked.
- Duplicate confirmed bookings are rejected.
- A driver cannot start another session while already having an active session.
- A session can only be completed by its owning authenticated user.
- A notification can only be marked as read by its owning user.
- Operator operations require the `operator` role.

The broader training test plan also covers duplicate registration, invalid authentication, overlapping bookings, unavailable chargers, unauthorized operator access, malformed requests, cancellations, and completed sessions.

---

## 12. Testing

Recommended test scenarios for the project include:

### Authentication

- Valid registration
- Duplicate email registration
- Valid login
- Invalid password
- Missing/invalid JWT

### Booking

- Valid booking
- Invalid duration
- Unavailable station
- Duplicate confirmed booking
- Booking cancellation

### Charging Session

- Start valid session
- Reject second active session
- Reject unavailable station
- Complete valid session
- Verify energy calculation
- Verify cost calculation
- Restore station availability

### Authorization

- Driver accesses driver resources
- Unauthenticated request rejected
- Driver attempts operator endpoint
- Operator accesses operator endpoint

The project documentation recommends testing at unit/business-rule, API, integration, and UI levels, including overlap detection and authorization cases.

---

## 13. Screenshots

Create a `screenshots/` directory and add the actual screenshots from the application.

```text
screenshots/
├── home.png
├── login.png
├── register.png
├── stations.png
├── station-details.png
├── booking.png
├── dashboard.png
├── charging-session.png
├── notifications.png
└── operator-dashboard.png
```

### Station Discovery

![Station Discovery](screenshots/stations.png)

### Booking

![Booking](screenshots/booking.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Charging Session

![Charging Session](screenshots/charging-session.png)

---

## 14. Run Locally

### Prerequisites

- Node.js 18+
- npm
- Git

The current standalone build does not require an external MySQL server because it uses `data/db.json` for runtime persistence.

### Clone

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ChargeGrid
```

### Install Dependencies

```bash
npm install
```

### Start Application

```bash
npm start
```

The application runs on:

```text
http://localhost:5000
```

### Health Check

```text
http://localhost:5000/api/health
```

---

## 15. Demo Credentials

For public repositories, do not publish a real personal password.

Use dedicated demo credentials:

| Role | Email | Password |
|---|---|---|
| Driver | `<TEST_DRIVER_EMAIL>` | `<TEST_DRIVER_PASSWORD>` |
| Operator | `<TEST_OPERATOR_EMAIL>` | `<TEST_OPERATOR_PASSWORD>` |

Create the dedicated operator account using the application's data setup rather than exposing a private account.

---

## 16. Live Demo

**Live Application:** `<YOUR_DEPLOYED_URL>`  
**GitHub Repository:** `<YOUR_GITHUB_URL>`

---

## 17. Future Engineering Improvements

The broader project documentation identifies several production-oriented improvements:

- Stronger concurrency control for simultaneous booking requests
- Real-time station/charger availability using WebSockets or Server-Sent Events
- Booking expiry and no-show handling
- Payment gateway integration
- Map-based station discovery
- Pagination and indexing for larger datasets
- Caching for frequently accessed station information
- Background jobs for notifications and stale-booking expiration
- Audit logs
- Rate limiting
- Refresh-token rotation
- Automated security checks

These improvements move the project toward a production-grade EV charging platform without changing its core architecture.

---

## 18. Project Value

ChargeGrid demonstrates practical full-stack engineering across:

- REST API design
- JWT authentication
- Role-based authorization
- Server-side validation
- Time-based business rules
- Booking conflict prevention
- State-based charging workflows
- Relational database modelling
- API testing
- Frontend-backend integration
- Debugging
- Version control
- Deployment preparation

The strongest engineering aspect is that booking is treated as a business transaction with authentication, validation, availability checks, conflict detection, persistence, and confirmation rather than a simple database insert.

---

## Author
