import { Router, Request, Response } from 'express';
import Chat from '../models/Chat';
import ReportModel from '../models/Report';
import LLMService from '../services/llm';

const router = Router();

// Create new chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const { reportId, title } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID is required'
      });
    }

    const report = await ReportModel.findById(reportId).select('userId title');
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const chat = new Chat({
      userId: req.userId,
      reportId,
      documentIds: [],
      title: title || 'New Chat'
    });

    await chat.save();

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    });
  } catch (error: any) {
    console.error('Create chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create chat' 
    });
  }
});

// Get user's chats
router.get('/', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.query;
    const filter: any = { userId: req.userId, isActive: true };

    if (reportId) {
      filter.reportId = reportId;
    }

    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 })
      .select('-messages')
      .populate('reportId', 'title filename')
      .lean();

    res.json({ 
      success: true,
      chats 
    });
  } catch (error: any) {
    console.error('Fetch chats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load chats' 
    });
  }
});

// Get specific chat with messages
router.get('/:chatId', async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    if (chat.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    res.json({ 
      success: true,
      chat 
    });
  } catch (error: any) {
    console.error('Fetch chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load chat' 
    });
  }
});

// Send message and get response
router.post('/:chatId/message', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Message cannot be empty' 
      });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    if (chat.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    const trimmedMessage = message.trim();

    // Add user message
    chat.messages.push({
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    });

    let context = '';
    let sources: string[] = [];

    const report = chat.reportId
      ? await ReportModel.findById(chat.reportId).lean()
      : null;

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found for this chat'
      });
    }

    const numericSummary = report.numericStats
      .map(stat => `${stat.column}: min=${stat.min}, max=${stat.max}, avg=${stat.avg.toFixed(2)}, sum=${stat.sum}`)
      .join('\n');

    const categoricalSummary = report.categoricalStats
      .slice(0, 5)
      .map(stat => `${stat.column}: ${stat.topValues.slice(0, 3).map(v => `${v.value} (${v.count})`).join(', ')}`)
      .join('\n');

    const sampleRows = (report.dataSample || report.previewRows || []).slice(0, 25);

    context = `Report Title: ${report.title}\nRows: ${report.rowCount}\nColumns: ${report.columnCount}\n\nColumns:\n${report.columns.join(', ')}\n\nNumeric Summary:\n${numericSummary || 'No numeric columns detected.'}\n\nTop Categories:\n${categoricalSummary || 'No categorical columns detected.'}\n\nSample Rows (JSON):\n${JSON.stringify(sampleRows)}`;

    sources = [report.title];

    // Generate response using LLM
    let response: string;
    try {
      response = await LLMService.generateResponse(context, trimmedMessage);
    } catch (llmError: any) {
      console.error('LLM error:', llmError.message);
      response = "I'm sorry, I'm having trouble generating a response right now. Please check that your API keys are configured correctly and try again.";
    }

    // Add assistant message
    chat.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      sources
    });

    // Auto-generate title from first message
    if (chat.messages.length === 2 && chat.title === 'New Chat') {
      try {
        chat.title = await LLMService.generateTitle(trimmedMessage);
      } catch {
        // Use truncated message as fallback title
        chat.title = trimmedMessage.length > 40 
          ? trimmedMessage.substring(0, 40) + '...' 
          : trimmedMessage;
      }
    }

    await chat.save();

    res.json({
      success: true,
      chat,
      assistantMessage: {
        content: response,
        sources
      }
    });
  } catch (error: any) {
    console.error('Message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process message' 
    });
  }
});

// Rate message
router.post('/:chatId/rate', async (req: Request, res: Response) => {
  try {
    const { messageIndex, rating } = req.body;

    if (!['like', 'dislike'].includes(rating)) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be "like" or "dislike"' 
      });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    if (chat.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    if (messageIndex < 0 || messageIndex >= chat.messages.length) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid message index' 
      });
    }

    // Toggle rating (click same rating to remove it)
    const currentRating = chat.messages[messageIndex].rating;
    chat.messages[messageIndex].rating = currentRating === rating ? undefined : rating;
    await chat.save();

    res.json({ 
      success: true,
      message: 'Rating updated',
      rating: chat.messages[messageIndex].rating || null
    });
  } catch (error: any) {
    console.error('Rate error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to rate message' 
    });
  }
});

// Delete chat (soft delete)
router.delete('/:chatId', async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ 
        success: false,
        message: 'Chat not found' 
      });
    }

    if (chat.userId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ 
      success: true,
      message: 'Chat deleted' 
    });
  } catch (error: any) {
    console.error('Delete chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete chat' 
    });
  }
});

export default router;
