const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const assignmentRoutes = require('./routes/assignments');
const userRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');
const maintenanceRoutes = require('./routes/maintenance');
const discountsRoutes = require('./routes/discounts');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/discounts', discountsRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ict-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ICT Inventory System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET  / (API info)');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- GET  /api/items');
  console.log('- GET  /api/assignments');
  console.log('- GET  /api/users');
  console.log('- GET  /api/users/employees');
  console.log('- GET  /api/reports/overview');
  console.log('- POST /api/maintenance');
  console.log('- GET  /api/maintenance');
  console.log('- GET  /api/maintenance/my');
  console.log('- POST /api/discounts');
  console.log('- GET  /api/discounts');
  console.log('- GET  /api/discounts/my');
});