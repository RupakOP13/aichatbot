import { Router, Request, Response } from 'express';
import multer from 'multer';
import DocumentModel from '../models/Document';
import EmbeddingsService from '../services/embeddings';
import VectorDBService from '../services/vectorDb';
import { extractFileName, formatFileSize } from '../utils/text';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import User from '../models/User';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760')
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,txt').split(',');
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    if (ext && allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type ".${ext}". Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

// Upload document
router.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      // SaaS Check: Check user limits
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.currentDocumentCount >= user.documentLimit && user.plan === 'free') {
        return res.status(403).json({
          success: false,
          message: 'Document limit reached. Please upgrade to Pro for unlimited uploads.',
          isLimitReached: true
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No file uploaded' 
        });
      }

      const { file } = req;
      let content = '';
      const startTime = Date.now();

      // Extract text based on file type
      try {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        
        if (file.mimetype === 'application/pdf' || ext === 'pdf') {
          const data = await pdfParse(file.buffer);
          content = data.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          content = result.value;
        } else if (file.mimetype === 'text/plain' || ext === 'txt') {
          content = file.buffer.toString('utf-8');
        } else {
          // Fallback for other text-based files
          content = file.buffer.toString('utf-8');
          // Basic check for binary content to avoid mojibake
          if (content.includes('\u0000') || content.includes('\uFFFD')) {
            throw new Error('File contains binary data and cannot be parsed as text.');
          }
        }
      } catch (parseError: any) {
        return res.status(422).json({
          success: false,
          message: `Failed to parse file: ${parseError.message}`
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(422).json({
          success: false,
          message: 'File appears to be empty or could not be read'
        });
      }

      // Create document record
      const document = new DocumentModel({
        userId: req.userId,
        title: extractFileName(file.originalname),
        filename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        content: content.substring(0, 500000), // Cap at 500K chars
        status: 'processing'
      });

      await document.save();

      // Update user usage count
      user.currentDocumentCount += 1;
      await user.save();

      // Process embeddings in background
      processDocument(document._id.toString(), content, startTime).catch(error => {
        console.error('Background document processing failed:', error);
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        document: {
          _id: document._id,
          userId: document.userId,
          title: document.title,
          filename: document.filename,
          fileSize: document.fileSize,
          fileSizeFormatted: formatFileSize(document.fileSize),
          mimeType: document.mimeType,
          status: document.status,
          chunksCount: document.chunksCount,
          vectorsCount: document.vectorsCount,
          errorMessage: document.errorMessage,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        }
      });
    } catch (error: any) {
      // Handle multer errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.'
        });
      }
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to upload document' 
      });
    }
  }
);

// Get user's documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const documents = await DocumentModel.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-content')  // Don't send full content to client
      .lean();

    res.json({
      success: true,
      documents: documents.map(doc => ({
        ...doc,
        fileSizeFormatted: formatFileSize(doc.fileSize)
      }))
    });
  } catch (error: any) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load documents' 
    });
  }
});

// Get document status
router.get('/:documentId', async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.documentId)
      .select('-content')
      .lean();

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    if (document.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      document: {
        ...document,
        fileSizeFormatted: formatFileSize(document.fileSize)
      }
    });
  } catch (error: any) {
    console.error('Fetch document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load document' 
    });
  }
});

// Delete document
router.delete('/:documentId', async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findById(req.params.documentId);

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    if (document.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    // Try to clean up vectors (non-blocking)
    try {
      await VectorDBService.deleteDocumentVectors(document._id.toString());
    } catch (vecError) {
      console.warn('Vector cleanup skipped:', vecError);
    }

    await DocumentModel.findByIdAndDelete(req.params.documentId);

    // Update user usage count
    await User.findByIdAndUpdate(req.userId, { $inc: { currentDocumentCount: -1 } });

    res.json({ 
      success: true,
      message: 'Document deleted' 
    });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete document' 
    });
  }
});

// Background document processing
async function processDocument(documentId: string, content: string, startTime: number) {
  try {
    // Split text into chunks
    const chunks = await EmbeddingsService.splitText(content);

    if (chunks.length === 0) {
      await DocumentModel.findByIdAndUpdate(documentId, {
        status: 'failed',
        errorMessage: 'No content could be extracted from the document'
      });
      return;
    }

    // Generate embeddings
    const embeddings = await EmbeddingsService.generateEmbeddings(chunks);

    // Upsert to vector DB
    const vectorIds = await VectorDBService.upsertVectors(documentId, chunks, embeddings);

    const processingTime = Date.now() - startTime;

    // Update document status
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'completed',
      chunksCount: chunks.length,
      vectorsCount: vectorIds.length,
      processingTime
    });

    console.log(`✅ Document ${documentId} processed: ${chunks.length} chunks in ${processingTime}ms`);
  } catch (error) {
    console.error(`❌ Document ${documentId} processing failed:`, error);
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Processing failed'
    });
  }
}

export default router;
