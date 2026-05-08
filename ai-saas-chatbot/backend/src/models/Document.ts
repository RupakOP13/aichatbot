import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  content: string;
  chunksCount: number;
  vectorsCount: number;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'User ID is required'],
      index: true
    },
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title too long']
    },
    filename: { 
      type: String, 
      required: [true, 'Filename is required'] 
    },
    fileSize: { 
      type: Number, 
      required: [true, 'File size is required'],
      min: [1, 'File cannot be empty']
    },
    mimeType: { 
      type: String, 
      default: 'application/octet-stream' 
    },
    content: { 
      type: String, 
      required: [true, 'Content is required'] 
    },
    chunksCount: { type: Number, default: 0 },
    vectorsCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['processing', 'completed', 'failed'], 
      default: 'processing' 
    },
    errorMessage: { type: String },
    processingTime: { type: Number }
  },
  { timestamps: true }
);

// Compound index for user queries
documentSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IDocument>('Document', documentSchema);
