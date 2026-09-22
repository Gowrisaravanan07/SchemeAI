const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const schemeRoutes = require('./routes/schemeRoutes');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const demoRoutes = require('./routes/demoRoutes');
const agentRoutes = require('./routes/agentRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.use('/api/schemes', schemeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/demo-citizen', demoRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CivicAssist AI Backend is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ CivicAssist AI Backend running on http://localhost:${PORT}`);
});
