const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Add it to backend/.env before starting the API.');
  process.exit(1);
}

const notesRoutes = require('./routes/notes');
const authRoutes = require('./routes/auth');

const app = express();

app.get('/', (req, res) => {
    res.send('Notes App Backend is Running');
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/auth', authRoutes);

// MongoDB + Server Startup
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)))
  .catch((error) => console.error('❌ MongoDB connection error:', error));
