export interface User {
  id: string;
  username: string;
  email: string;
  businessName?: string;
  industry?: string;
  authProvider?: 'local' | 'google';
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  documentLimit: number;
  currentDocumentCount: number;
  createdAt?: string;
}

export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  rating?: 'like' | 'dislike' | null;
  sources?: string[];
}

export interface Chat {
  _id: string;
  userId: string;
  reportId?: string | { _id: string; title?: string; filename?: string };
  title: string;
  messages: Message[];
  documentIds: string[];
  isActive: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChartRecommendation {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  title: string;
  xColumn?: string;
  yColumn?: string;
  column?: string;
  description?: string;
}

export interface ReportInsight {
  summary?: string;
  keyInsights: string[];
  trends: string[];
  recommendations: string[];
  risks: string[];
  chartConfig?: {
    recommendedCharts: ChartRecommendation[];
  };
}

export interface NumericStat {
  column: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
  median?: number;
  stdDev?: number;
  nullCount?: number;
  uniqueCount?: number;
}

export interface CategoricalStat {
  column: string;
  topValues: { value: string; count: number }[];
  uniqueCount?: number;
  nullCount?: number;
}

export interface Report {
  _id: string;
  userId: string;
  title: string;
  filename: string;
  fileSize: number;
  fileSizeFormatted?: string;
  mimeType?: string;
  status: 'processing' | 'completed' | 'failed';
  rowCount: number;
  columnCount: number;
  columns: string[];
  columnTypes?: Record<string, 'number' | 'date' | 'string'>;
  previewRows: Record<string, string | number | null>[];
  dataSample?: Record<string, string | number | null>[];
  numericStats: NumericStat[];
  categoricalStats: CategoricalStat[];
  insights?: ReportInsight;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}
