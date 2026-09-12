
---

# 2. ChargeGrid — README.md

I'm using the **ChargeGrid** name here because that's the name on your resume. The underlying training documentation calls the application ChargeFlow, and it documents the EV user/operator workflows, MySQL schema, authentication, API design, session lifecycle, and conflict prevention. :contentReference[oaicite:4]{index=4}

```markdown
# ChargeGrid – EV Charging Network

ChargeGrid is a full-stack EV charging management platform that allows users to
discover charging stations, manage vehicles, select charging points, reserve
time slots, and track charging sessions.

The platform also provides station-operator functionality for managing charging
infrastructure, reservations, and session activity.

## 1. Project Overview

ChargeGrid brings EV charging discovery and reservation into a single web
application.

The platform models:

- EV users
- Vehicles
- Charging stations
- Charging points
- Bookings
- Charging sessions
- Payments
- Station operators

The application uses React.js for the frontend, Node.js/Express.js for backend
services, and MySQL for persistent storage.

The architecture follows:

```text
React UI
   ↓
REST API
   ↓
Business Logic & Validation
   ↓
MySQL
