import { Router, Request, Response } from 'express';
import multer from 'multer';
import ReportModel from '../models/Report';
import User from '../models/User';
import LLMService from '../services/llm';
import { parseCsv, parseXlsx } from '../utils/reportParser';
import { buildReportProfile } from '../utils/reportStats';
import { extractFileName, formatFileSize } from '../utils/text';
import { uploadReportBuffer, deleteReportFile } from '../services/cloudinary';
import Chat from '../models/Chat';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760')
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['csv', 'xlsx'];
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    if (ext && allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: csv, xlsx'));
    }
  }
});

const buildInsightsPayload = (report: {
  title: string;
  columns: string[];
  columnTypes: Record<string, string>;
  rowCount: number;
  columnCount: number;
  numericStats: any[];
  categoricalStats: any[];
  previewRows: Record<string, string | number | null>[];
  industry?: string;
}) => {
  return {
    title: report.title,
    rowCount: report.rowCount,
    columnCount: report.columnCount,
    columns: report.columns,
    columnTypes: report.columnTypes,
    numericStats: report.numericStats,
    categoricalStats: report.categoricalStats,
    previewRows: report.previewRows.slice(0, 10),
    industry: report.industry
  };
};

// Upload report
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.currentDocumentCount >= user.documentLimit && user.plan === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Report limit reached. Please upgrade to Pro for unlimited uploads.',
        isLimitReached: true
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { file } = req;
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    let parsed;
    try {
      if (ext === 'csv') {
        parsed = parseCsv(file.buffer);
      } else if (ext === 'xlsx') {
        parsed = parseXlsx(file.buffer);
      } else {
        return res.status(422).json({ success: false, message: 'Unsupported file type' });
      }
    } catch (parseError: any) {
      return res.status(422).json({
        success: false,
        message: `Failed to parse file: ${parseError.message}`
      });
    }

    if (!parsed.rows || parsed.rows.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'File appears to be empty or could not be read'
      });
    }

    const profile = buildReportProfile(parsed.columns, parsed.rows, {
      previewSize: 20,
      sampleSize: 200
    });

    let fileUrl = '';
    let filePublicId: string | undefined;
    let storageProvider: 'cloudinary' | 'local' = 'local';

    try {
      const uploadResult = await uploadReportBuffer(file.buffer, extractFileName(file.originalname));
      fileUrl = uploadResult.url;
      filePublicId = uploadResult.publicId;
      storageProvider = 'cloudinary';
    } catch (storageError: any) {
      console.warn('Cloudinary upload failed, storing metadata only:', storageError.message || storageError);
    }

    const report = new ReportModel({
      userId: req.userId,
      title: extractFileName(file.originalname),
      filename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageProvider,
      fileUrl,
      filePublicId,
      columns: parsed.columns,
      columnTypes: profile.columnTypes,
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      previewRows: profile.previewRows,
      dataSample: profile.dataSample,
      numericStats: profile.numericStats,
      categoricalStats: profile.categoricalStats,
      status: 'processing'
    });

    await report.save();

    user.currentDocumentCount += 1;
    await user.save();


    const payload = buildInsightsPayload({
      title: report.title,
      columns: report.columns,
      columnTypes: (report.columnTypes as Record<string, string>) || {},
      rowCount: report.rowCount,
      columnCount: report.columnCount,
      numericStats: report.numericStats,
      categoricalStats: report.categoricalStats,
      previewRows: report.previewRows,
      industry: user?.industry
    });

    LLMService.generateReportInsights(payload)
      .then(insights => ReportModel.findByIdAndUpdate(report._id, { insights, status: 'completed' }))
      .catch(error => {
        console.error('Report insights generation failed:', error);
        ReportModel.findByIdAndUpdate(report._id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Insights generation failed'
        }).catch(() => undefined);
      });

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      report: {
        _id: report._id,
        title: report.title,
        filename: report.filename,
        fileSize: report.fileSize,
        fileSizeFormatted: formatFileSize(report.fileSize),
        status: report.status,
        rowCount: report.rowCount,
        columnCount: report.columnCount,
        columns: report.columns,
        columnTypes: report.columnTypes,
        previewRows: report.previewRows,
        dataSample: report.dataSample,
        numericStats: report.numericStats,
        categoricalStats: report.categoricalStats,
        insights: report.insights,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }
    });
  } catch (error: any) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }

    console.error('Report upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload report' });
  }
});

// Get user's reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await ReportModel.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-dataSample')
      .lean();

    res.json({
      success: true,
      reports: reports.map(report => ({
        ...report,
        fileSizeFormatted: formatFileSize(report.fileSize)
      }))
    });
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to load reports' });
  }
});

// Get report details
router.get('/:reportId', async (req: Request, res: Response) => {
  try {
    const report = await ReportModel.findById(req.params.reportId).lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      report: {
        ...report,
        fileSizeFormatted: formatFileSize(report.fileSize)
      }
    });
  } catch (error: any) {
    console.error('Fetch report error:', error);
    res.status(500).json({ success: false, message: 'Failed to load report' });
  }
});

// Delete report
router.delete('/:reportId', async (req: Request, res: Response) => {
  try {
    const report = await ReportModel.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await deleteReportFile(report.filePublicId);
    await Chat.deleteMany({ reportId: report._id });
    await ReportModel.findByIdAndDelete(req.params.reportId);

    const usageUser = await User.findById(req.userId);
    if (usageUser) {
      const nextCount = Math.max(0, (usageUser.currentDocumentCount || 0) - 1);
      usageUser.currentDocumentCount = nextCount;
      await usageUser.save();
    }

    res.json({ success: true, message: 'Report deleted' });
  } catch (error: any) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
});

export default router;
