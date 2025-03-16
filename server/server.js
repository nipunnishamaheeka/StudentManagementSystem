const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const net = require('net');

// Load environment variables
dotenv.config();

// Improved JWT_SECRET validation
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in .env file!');
  process.exit(1); // Exit with error
} else if (process.env.JWT_SECRET.length < 32) {
  console.warn('WARNING: Your JWT_SECRET is too short! It should be at least 32 characters for security.');
} else {
  console.log('JWT_SECRET loaded successfully (length:', process.env.JWT_SECRET.length, 'characters)');
  console.log('JWT_SECRET first 5 chars:', process.env.JWT_SECRET.substring(0, 5) + '...');
}

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const { log } = require('console');

// Initialize Express app
const app = express();

// Middleware
const corsOptions = {
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.send('Student Management System API is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Server error' });
});

// Function to find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next port
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });

    server.listen({ port: startPort }, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
};

// Start server with auto port detection
const startServer = async () => {
  const preferredPort = process.env.PORT || 5000;
  try {
    const port = await findAvailablePort(parseInt(preferredPort));
    app.listen(port, () => console.log(`Server running on port ${port}${port !== parseInt(preferredPort) ? ' (original port was in use)' : ''}`));
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();