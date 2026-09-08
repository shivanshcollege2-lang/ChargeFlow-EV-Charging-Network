# ChargeFlow – EV Charging Network

ChargeFlow is a full-stack web application prototype designed to simplify the discovery, reservation, and management of electric vehicle (EV) charging services through a centralized digital platform.

The application provides a complete simulated workflow for EV users, including charging-station discovery, availability filtering, user authentication, charging-slot reservation, booking management, charging-session tracking, energy consumption calculation, cost estimation, and notifications.

The project is developed as a functional prototype with a production-oriented architecture that can be extended in the future with real charging-network APIs, live station data, payment gateways, and a relational database.

---

## Overview

The increasing adoption of electric vehicles creates a growing need for convenient access to charging infrastructure. Users often need to identify suitable charging stations, check availability, select an appropriate time slot, and manage their charging sessions.

ChargeFlow addresses this workflow through a unified web-based interface.

The application allows a user to:

- Discover available charging stations
- Search stations by name or city
- Filter stations according to availability
- Register and authenticate securely
- Select a charging station and reserve a time slot
- View and manage existing bookings
- Cancel reservations
- Start and complete charging sessions
- Monitor energy consumption
- Calculate estimated charging costs
- Receive system notifications

---

## Key Features

### 1. Charging Station Discovery

Users can browse available EV charging stations and view important station information such as:

- Station name
- Location
- City
- Charging power
- Connector type
- Number of charging ports
- Availability status
- Charging rate

### 2. Search and Filtering

The station discovery interface supports:

- Station-based search
- City-based search
- Availability filtering

This allows users to quickly identify relevant charging locations.

### 3. User Authentication

ChargeFlow provides user account functionality through:

- User registration
- User login
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Role-based authorization for operator functionality

### 4. Charging Slot Reservation

Authenticated users can select:

- Charging station
- Date
- Time
- Charging duration

The backend validates booking details and prevents duplicate reservations for the same station, date, and time slot.

### 5. Booking Management

Users can access their bookings through the dashboard and:

- View booking information
- Check reservation status
- Cancel confirmed bookings

### 6. Charging Session Management

The application separates a charging session from a booking.

Users can:

- Start a charging session
- Monitor the active session
- Complete the charging session
- View session duration
- View calculated energy consumption
- View estimated charging cost

### 7. Energy and Cost Calculation

The system calculates estimated energy consumption based on the session duration and derives the corresponding charging cost using the station's configured charging rate.

### 8. Notifications

Users receive application notifications related to:

- Account registration
- Booking confirmation
- Booking cancellation
- Charging session start
- Charging session completion

### 9. Operator API Structure

The backend also includes operator-oriented API endpoints for future station management and monitoring functionality, including station status and configuration updates.

### 10. Responsive Interface

The frontend is designed to provide a consistent experience across:

- Desktop screens
- Laptop screens
- Tablet devices
- Mobile devices

---

## System Workflow

The primary user workflow can be summarized as:

```text
Station Discovery
       ↓
Search / Filter
       ↓
Select Charging Station
       ↓
Choose Date & Time
       ↓
Validate Booking
       ↓
Confirm Reservation
       ↓
View Dashboard
       ↓
Start Charging Session
       ↓
Complete Session
       ↓
Calculate Energy & Cost
