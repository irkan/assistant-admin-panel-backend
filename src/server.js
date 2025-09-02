const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = require('./lib/prisma');
const WebSocketController = require('./controllers/websocketController');
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false, // Disable COOP for Google OAuth
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://app.swotig.com',
    'https://accounts.google.com',
    'https://oauth2.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const assistantsRoutes = require('./routes/assistants');
const organizationsRoutes = require('./routes/organizations');
const usersRoutes = require('./routes/users');
const toolsRoutes = require('./routes/tools');
const apiKeysRoutes = require('./routes/api-keys');
const voicesRoutes = require('./routes/voices');
const assistantApiRoutes = require('./routes/assistantApi');
const geminiImageRoutes = require('./routes/geminiImage');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assistants', assistantsRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/voices', voicesRoutes);
app.use('/api/gemini', geminiImageRoutes);

// API v1 routes for external API key access
app.use('/api/v1', assistantApiRoutes);

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected'
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Admin Panel Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      assistants: '/api/assistants',
      organizations: '/api/organizations',
      users: '/api/users',
      tools: '/api/tools',
      apiKeys: '/api/api-keys',
      // API v1 for external access
      'v1-assistants': '/api/v1/assistants',
      'v1-assistant-by-uuid': '/api/v1/assistants/{uuid}',
      'v1-auth-info': '/api/v1/auth/info',
      // WebSocket for voice communication (same port)
      'voice-websocket': `ws://localhost:${PORT}?assistantUuid={uuid}&apiKey={key}`
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Import error handler
const { errorHandler } = require('./middleware/errorHandler');

// Error handler
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Initialize WebSocket server on the same port as HTTP server
  const wss = new WebSocketServer({ server });
  const websocketController = new WebSocketController();

  console.log(`🎤 WebSocket server (voice) integrated on port ${PORT}`);
  console.log(`🔗 Voice WebSocket: ws://localhost:${PORT}?assistantUuid={uuid}&apiKey={key}`);

  // Ensure recordings directory exists
  const recordingsDir = path.join(__dirname, '..', process.env.RECORDINGS_DIRECTORY || 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
    console.log(`📁 Created recordings directory: ${recordingsDir}`);
  }

  // Handle WebSocket connections for voice communication
  wss.on('connection', async (ws, request) => {
    await websocketController.handleConnection(ws, request);
  });

  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    server.close(() => {
      console.log('💤 HTTP server closed');
    });
    wss.close(() => {
      console.log('💤 WebSocket server closed');
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    server.close(() => {
      console.log('💤 HTTP server closed');
    });
    wss.close(() => {
      console.log('💤 WebSocket server closed');
    });
  });
}

module.exports = app; 