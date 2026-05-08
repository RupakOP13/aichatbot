import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req.headers.authorization || '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please provide a valid token.' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload' 
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    const message = error.message === 'Token expired' 
      ? 'Session expired. Please login again.'
      : 'Invalid authentication token';
    
    return res.status(401).json({ 
      success: false,
      message 
    });
  }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. This resource already exists.'
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      detail: err.message 
    })
  });
};
