const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'chargeflow-local-demo-secret';
const DB = path.join(__dirname, 'data', 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const readDb = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const writeDb = db => fs.writeFileSync(DB, JSON.stringify(db, null, 2));
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const makeToken = u => jwt.sign({ id: u.id, name: u.name, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: '7d' });

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Login required.' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Session expired. Please login again.' }); }
}

function role(required) {
  return (req, res, next) => req.user.role === required ? next() : res.status(403).json({ message: 'Access denied.' });
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ChargeFlow API' }));

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || !email.includes('@') || password.length < 6) return res.status(400).json({ message: 'Enter a valid name, email and password.' });
  const db = readDb();
  if (db.users.some(u => u.email === email)) return res.status(409).json({ message: 'Email is already registered.' });
  const user = { id: crypto.randomUUID(), name, email, passwordHash: await bcrypt.hash(password, 10), role: 'driver', createdAt: new Date().toISOString() };
  db.users.push(user);
  db.notifications.push({ id: crypto.randomUUID(), userId: user.id, title: 'Welcome to ChargeFlow', text: 'Your driver account is ready.', type: 'system', read: false, createdAt: new Date().toISOString() });
  writeDb(db);
  res.status(201).json({ user: publicUser(user), token: makeToken(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const db = readDb();
  const user = db.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ user: publicUser(user), token: makeToken(user) });
});

app.get('/api/stations', (req, res) => {
  const db = readDb();
  const q = String(req.query.q || '').trim().toLowerCase();
  const status = String(req.query.status || 'all');
  let stations = db.stations;
  if (q) stations = stations.filter(s => `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q));
  if (status !== 'all') stations = stations.filter(s => s.status === status);
  res.json({ stations });
});

app.get('/api/stations/:id', (req, res) => {
  const station = readDb().stations.find(s => s.id === req.params.id);
  station ? res.json({ station }) : res.status(404).json({ message: 'Station not found.' });
});

app.get('/api/dashboard', auth, (req, res) => {
  const db = readDb();
  const bookings = db.bookings.filter(b => b.userId === req.user.id);
  const sessions = db.sessions.filter(s => s.userId === req.user.id);
  const notifications = db.notifications.filter(n => n.userId === req.user.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const energy = sessions.reduce((sum, s) => sum + Number(s.energyKwh || 0), 0);
  res.json({ bookings, sessions, notifications, stats: { bookings: bookings.length, activeSession: sessions.some(s => s.status === 'active'), energyKwh: energy, unread: notifications.filter(n => !n.read).length } });
});

app.post('/api/bookings', auth, (req, res) => {
  const { stationId, date, time, duration } = req.body;
  const mins = Number(duration);
  if (!stationId || !date || !time || ![30,60,90,120].includes(mins)) return res.status(400).json({ message: 'Invalid booking details.' });
  const db = readDb();
  const station = db.stations.find(s => s.id === stationId);
  if (!station) return res.status(404).json({ message: 'Station not found.' });
  if (station.status !== 'Available') return res.status(409).json({ message: 'This station is currently unavailable.' });
  const duplicate = db.bookings.find(b => b.stationId === stationId && b.date === date && b.time === time && b.status === 'confirmed');
  if (duplicate) return res.status(409).json({ message: 'That charging slot is already booked.' });
  const booking = { id: 'BK-' + crypto.randomBytes(3).toString('hex').toUpperCase(), userId: req.user.id, stationId, stationName: station.name, date, time, duration: mins, status: 'confirmed', createdAt: new Date().toISOString() };
  db.bookings.push(booking);
  db.notifications.push({ id: crypto.randomUUID(), userId: req.user.id, title: 'Booking confirmed', text: `${station.name} • ${date} at ${time}`, type: 'booking', read: false, createdAt: new Date().toISOString() });
  writeDb(db);
  res.status(201).json({ booking });
});

app.patch('/api/bookings/:id/cancel', auth, (req, res) => {
  const db = readDb();
  const booking = db.bookings.find(b => b.id === req.params.id && b.userId === req.user.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  booking.status = 'cancelled';
  db.notifications.push({ id: crypto.randomUUID(), userId: req.user.id, title: 'Booking cancelled', text: booking.stationName, type: 'booking', read: false, createdAt: new Date().toISOString() });
  writeDb(db);
  res.json({ message: 'Booking cancelled.' });
});

app.post('/api/sessions/start', auth, (req, res) => {
  const { stationId } = req.body;
  const db = readDb();
  if (db.sessions.some(s => s.userId === req.user.id && s.status === 'active')) return res.status(409).json({ message: 'You already have an active session.' });
  const station = db.stations.find(s => s.id === stationId);
  if (!station || station.status !== 'Available') return res.status(409).json({ message: 'Station is not available.' });
  station.status = 'Busy';
  station.availablePorts = Math.max(0, station.availablePorts - 1);
  const session = { id: 'SS-' + crypto.randomBytes(3).toString('hex').toUpperCase(), userId: req.user.id, stationId, stationName: station.name, startedAt: new Date().toISOString(), status: 'active', energyKwh: 0, cost: 0 };
  db.sessions.push(session);
  db.notifications.push({ id: crypto.randomUUID(), userId: req.user.id, title: 'Charging started', text: `${station.name} • ${session.id}`, type: 'session', read: false, createdAt: new Date().toISOString() });
  writeDb(db); res.status(201).json({ session });
});

app.patch('/api/sessions/:id/complete', auth, (req, res) => {
  const db = readDb();
  const session = db.sessions.find(s => s.id === req.params.id && s.userId === req.user.id && s.status === 'active');
  if (!session) return res.status(404).json({ message: 'Active session not found.' });
  const station = db.stations.find(s => s.id === session.stationId);
  const minutes = Math.max(1, Math.round((Date.now() - Date.parse(session.startedAt)) / 60000));
  session.energyKwh = Number((minutes * 0.42).toFixed(2));
  session.cost = Number((session.energyKwh * (station?.pricePerKwh || 12)).toFixed(2));
  session.endedAt = new Date().toISOString(); session.durationMinutes = minutes; session.status = 'completed';
  if (station) { station.availablePorts = Math.min(station.totalPorts, station.availablePorts + 1); station.status = 'Available'; }
  db.notifications.push({ id: crypto.randomUUID(), userId: req.user.id, title: 'Charging session completed', text: `${session.energyKwh} kWh • ₹${session.cost}`, type: 'session', read: false, createdAt: new Date().toISOString() });
  writeDb(db); res.json({ session });
});

app.patch('/api/notifications/:id/read', auth, (req, res) => {
  const db = readDb();
  const n = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (!n) return res.status(404).json({ message: 'Notification not found.' });
  n.read = true; writeDb(db); res.json({ notification: n });
});

// Operator APIs included for the training/report architecture.
app.get('/api/operator/stations', auth, role('operator'), (req, res) => res.json({ stations: readDb().stations }));
app.patch('/api/operator/stations/:id', auth, role('operator'), (req, res) => {
  const db = readDb(); const station = db.stations.find(s => s.id === req.params.id);
  if (!station) return res.status(404).json({ message: 'Station not found.' });
  ['status','pricePerKwh','power','connector'].forEach(k => { if (req.body[k] !== undefined) station[k] = req.body[k]; });
  writeDb(db); res.json({ station });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`ChargeFlow running at http://localhost:${PORT}`));
