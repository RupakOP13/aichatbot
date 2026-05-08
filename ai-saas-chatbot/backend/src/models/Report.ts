import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface INumericStat {
  column: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
}

export interface ITopValue {
  value: string;
  count: number;
}

export interface ICategoricalStat {
  column: string;
  topValues: ITopValue[];
}

export interface IReportInsights {
  summary?: string;
  keyInsights: string[];
  trends: string[];
  recommendations: string[];
  risks: string[];
}

export interface IReport extends MongoDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storageProvider: 'cloudinary' | 'local';
  fileUrl: string;
  filePublicId?: string;
  columns: string[];
  rowCount: number;
  columnCount: number;
  previewRows: Record<string, string | number | null>[];
  dataSample: Record<string, string | number | null>[];
  numericStats: INumericStat[];
  categoricalStats: ICategoricalStat[];
  insights?: IReportInsights;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const numericStatSchema = new Schema<INumericStat>(
  {
    column: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    avg: { type: Number, required: true },
    sum: { type: Number, required: true },
    count: { type: Number, required: true }
  },
  { _id: false }
);

const topValueSchema = new Schema<ITopValue>(
  {
    value: { type: String, required: true },
    count: { type: Number, required: true }
  },
  { _id: false }
);

const categoricalStatSchema = new Schema<ICategoricalStat>(
  {
    column: { type: String, required: true },
    topValues: { type: [topValueSchema], default: [] }
  },
  { _id: false }
);

const reportInsightsSchema = new Schema<IReportInsights>(
  {
    summary: { type: String },
    keyInsights: { type: [String], default: [] },
    trends: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    risks: { type: [String], default: [] }
  },
  { _id: false }
);

const mixedArray: any = { type: [Schema.Types.Mixed], default: [] };

const reportSchema = new Schema<IReport>(
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
    filename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    storageProvider: { type: String, enum: ['cloudinary', 'local'], default: 'cloudinary' },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String },
    columns: { type: [String], default: [] },
    rowCount: { type: Number, default: 0 },
    columnCount: { type: Number, default: 0 },
    // Use mixed arrays for preview/sample rows.
    previewRows: mixedArray,
    dataSample: mixedArray,
    numericStats: { type: [numericStatSchema], default: [] },
    categoricalStats: { type: [categoricalStatSchema], default: [] },
    insights: { type: reportInsightsSchema },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    },
    errorMessage: { type: String }
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', reportSchema);
