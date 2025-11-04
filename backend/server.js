const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    await testConnection();
});
