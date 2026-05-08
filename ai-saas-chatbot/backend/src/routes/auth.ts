import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const buildUniqueUsername = async (base: string): Promise<string> => {
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'user';

  let candidate = cleaned;
  let suffix = 1;

  while (await User.findOne({ username: candidate })) {
    candidate = `${cleaned}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

// Register
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3, max: 30 })
      .trim()
      .escape()
      .withMessage('Username must be 3-30 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('businessName')
      .optional({ nullable: true })
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be 2-100 characters'),
    body('industry')
      .optional({ nullable: true })
      .isLength({ min: 2, max: 100 })
      .withMessage('Industry must be 2-100 characters')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(e => e.msg) 
        });
      }

      const { username, email, password } = req.body;
      const { businessName, industry } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ 
        $or: [{ email: email.toLowerCase() }, { username }] 
      });
      
      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        return res.status(409).json({ 
          success: false,
          message: `An account with this ${field} already exists` 
        });
      }

      // Create new user
      const user = new User({ username, email, password, businessName, industry });
      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          businessName: user.businessName,
          industry: user.industry,
          authProvider: user.authProvider,
          role: user.role,
          plan: user.plan,
          documentLimit: user.documentLimit,
          currentDocumentCount: user.currentDocumentCount
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Unable to create account. Please try again.' 
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array().map(e => e.msg) 
        });
      }

      const { email, password } = req.body;

      // Find user and explicitly select password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          businessName: user.businessName,
          industry: user.industry,
          authProvider: user.authProvider,
          role: user.role,
          plan: user.plan,
          documentLimit: user.documentLimit,
          currentDocumentCount: user.currentDocumentCount
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Unable to login. Please try again.' 
      });
    }
  }
);

// Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (user.currentDocumentCount < 0) {
      user.currentDocumentCount = 0;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
          businessName: user.businessName,
          industry: user.industry,
        authProvider: user.authProvider,
        role: user.role,
        plan: user.plan,
        documentLimit: user.documentLimit,
        currentDocumentCount: user.currentDocumentCount,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile' 
    });
  }
});

// Upgrade to Pro (Demo endpoint)
router.post('/upgrade', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.plan = 'pro';
    user.documentLimit = 100; // Increase limit for Pro
    user.subscriptionStatus = 'active';
    await user.save();

    res.json({
      success: true,
      message: 'Upgraded to Pro successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        businessName: user.businessName,
        industry: user.industry,
        authProvider: user.authProvider,
        role: user.role,
        plan: user.plan,
        documentLimit: user.documentLimit,
        currentDocumentCount: user.currentDocumentCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Upgrade failed' });
  }
});

// Google OAuth login (token-based)
router.post('/google', async (req: Request, res: Response) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

    if (!googleClient) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured'
      });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to verify Google account'
      });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const username = await buildUniqueUsername(payload.name || email.split('@')[0]);
      user = new User({
        username,
        email,
        password: crypto.randomUUID(),
        googleId: payload.sub,
        authProvider: 'google'
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      if (!user.authProvider) {
        user.authProvider = 'google';
      }
      await user.save();
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        businessName: user.businessName,
        industry: user.industry,
        authProvider: user.authProvider,
        role: user.role,
        plan: user.plan,
        documentLimit: user.documentLimit,
        currentDocumentCount: user.currentDocumentCount
      }
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed'
    });
  }
});

export default router;
