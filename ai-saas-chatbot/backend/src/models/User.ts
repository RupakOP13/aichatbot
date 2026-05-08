import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  businessName?: string;
  industry?: string;
  googleId?: string;
  authProvider: 'local' | 'google';
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'none';
  documentLimit: number;
  currentDocumentCount: number;
  stripeCustomerId?: string;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: [true, 'Username is required'], 
      unique: true, 
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'], 
      minlength: [6, 'Password must be at least 6 characters'],
      select: false  // Don't return password by default
    },
    googleId: {
      type: String,
      index: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [100, 'Business name too long']
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry name too long']
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'canceled', 'none'],
      default: 'none'
    },
    documentLimit: {
      type: Number,
      default: 3 // Free users start with 3 docs
    },
    currentDocumentCount: {
      type: Number,
      default: 0
    },
    stripeCustomerId: { type: String },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Index for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model<IUser>('User', userSchema);
