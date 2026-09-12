# ChargeGrid – EV Charging Network

ChargeGrid is a full-stack EV charging management platform that allows drivers
to discover charging stations, view charger availability, reserve charging
slots, manage bookings, start charging sessions, and track charging activity.

The application also includes operator-level functionality for managing
charging-station availability.

---

## 1. Project Overview

ChargeGrid addresses the operational workflow involved in finding and reserving
EV charging infrastructure.

Instead of treating charging as a simple CRUD workflow, the application
connects multiple stages:

```text
Authentication
      ↓
Station Discovery
      ↓
Station Availability
      ↓
Slot Booking
      ↓
Booking Management
      ↓
Charging Session
      ↓
Energy / Cost Tracking
