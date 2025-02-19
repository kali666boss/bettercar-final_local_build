// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g., http://localhost:8080 or your production URL
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Mount authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
