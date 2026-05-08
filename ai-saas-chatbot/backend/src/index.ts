import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authMiddleware, errorHandler } from './middleware/auth';
import { initCloudinary } from './services/cloudinary';

// Routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import reportRoutes from './routes/reports';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
initCloudinary();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB with retry logic
const connectDB = async (retries = 5): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB');
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : error);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${2 * (i + 1)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  }
  console.error('💀 Failed to connect to MongoDB after all retries');
  process.exit(1);
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// Health check
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.path} not found` 
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('👋 Server shut down cleanly');
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
