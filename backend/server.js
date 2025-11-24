require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/foods');
const mealRoutes = require('./routes/meals');
const progressRoutes = require('./routes/progress');
const groceryRoutes = require('./routes/grocery');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware - CORS configuration
// Normalize frontend URL by removing trailing slash
const frontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.trim().replace(/\/$/, '')
  : '*';

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allowed origins
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    // Check if origin matches (with or without trailing slash)
    if (frontendUrl === '*' || allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin} (normalized: ${normalizedOrigin}) not in allowed: ${allowedOrigins}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB and start server only after successful connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Diet & Meal Planner API is running...');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Note: server is started inside the MongoDB connect .then() above
