import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: 'like' | 'dislike';
  sources?: string[];
  tokenCount?: number;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  documentIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: [true, 'Message role is required'] 
  },
  content: { 
    type: String, 
    required: [true, 'Message content is required'],
    maxlength: [50000, 'Message too long']
  },
  timestamp: { type: Date, default: Date.now },
  rating: { type: String, enum: ['like', 'dislike', null], default: null },
  sources: [String],
  tokenCount: { type: Number, default: 0 }
}, { _id: true });

const chatSchema = new Schema<IChat>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'User ID is required'],
      index: true
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      index: true
    },
    title: { 
      type: String, 
      default: 'New Chat',
      maxlength: [200, 'Title too long'],
      trim: true
    },
    messages: [messageSchema],
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    isActive: { type: Boolean, default: true },
    messageCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound indexes for performance
chatSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });
chatSchema.index({ userId: 1, createdAt: -1 });

// Update message count before saving
chatSchema.pre('save', function (next) {
  this.messageCount = this.messages.length;
  next();
});

export default mongoose.model<IChat>('Chat', chatSchema);
