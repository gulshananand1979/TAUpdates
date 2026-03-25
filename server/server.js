require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/positions', require('./routes/positions'));
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/analytics', require('./routes/analytics'));

// Database Connection
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? null : 'mongodb://localhost:27017/talenthub');

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables!');
}

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
          console.log(`🚀 Server running on port ${PORT}`);
        });
      }
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
    });
} else {
  console.warn('⚠️ Server started without MongoDB connection (Development fallback or Missing URI)');
}

module.exports = app;
