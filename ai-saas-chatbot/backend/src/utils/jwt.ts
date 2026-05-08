import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-secret-key') {
    console.warn('⚠️  Using default JWT secret. Set JWT_SECRET in .env for production!');
    return 'demo_jwt_secret_key_change_in_production';
  }
  return secret;
};

export const generateToken = (userId: string): string => {
  const secret = getSecret();
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  const options: SignOptions = {
    expiresIn: expiresIn as any
  };
  
  return jwt.sign(
    { userId } as TokenPayload, 
    secret, 
    options
  );
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

export const extractToken = (authHeader: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  return token.length > 0 ? token : null;
};
