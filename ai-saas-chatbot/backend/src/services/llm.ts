let ChatGroqCtor: any = null;

export class LLMService {
  private llm: any = null;
  private initialized = false;

  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  Groq API key not configured. LLM service unavailable.');
      return;
    }

    try {
      if (!ChatGroqCtor) {
        const groqModule = require('@langchain/groq');
        ChatGroqCtor = groqModule.ChatGroq;
      }

      this.llm = new ChatGroqCtor({
        apiKey,
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        temperature: 0.7,
        maxTokens: 1024
      });

      console.log('✅ LLM service initialized (Groq)');
    } catch (error) {
      console.warn('⚠️  Failed to initialize LLM service:', error);
    }
  }

  async generateResponse(context: string, question: string): Promise<string> {
    await this.init();
    if (!this.llm) {
      throw new Error('LLM service not available. Configure GROQ_API_KEY.');
    }

    const systemPrompt = context && context.trim().length > 0
      ? `You are a helpful AI assistant. Use the following context to answer the user's question accurately and concisely. If the context doesn't contain relevant information, say so honestly and provide what help you can.

Context:
${context}`
      : `You are a helpful AI assistant. Answer the user's question clearly and concisely. If you don't know something, say so honestly.`;

    try {
      const response = await this.llm.invoke([
        ['system', systemPrompt],
        ['human', question]
      ]);

      return response.content?.toString() || 'I was unable to generate a response.';
    } catch (error: any) {
      console.error('LLM invoke error:', error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    await this.init();
    if (!this.llm) {
      // Fallback: use first few words
      return firstMessage.split(' ').slice(0, 5).join(' ');
    }

    try {
      const response = await this.llm.invoke([
        ['system', 'Generate a short, concise title (max 5 words) for a chat conversation. Return only the title text, no quotes or extra formatting.'],
        ['human', `First message: "${firstMessage.substring(0, 150)}"`]
      ]);

      const title = response.content?.toString().trim().replace(/^["']|["']$/g, '') || 'New Chat';
      return title.length > 60 ? title.substring(0, 57) + '...' : title;
    } catch (error) {
      console.error('Title generation error:', error);
      return firstMessage.split(' ').slice(0, 5).join(' ');
    }
  }

  async generateReportInsights(summary: {
    title: string;
    rowCount: number;
    columnCount: number;
    columns: string[];
    numericStats: any[];
    categoricalStats: any[];
    previewRows: Record<string, string | number | null>[];
  }): Promise<{ summary?: string; keyInsights: string[]; trends: string[]; recommendations: string[]; risks: string[] }> {
    await this.init();
    if (!this.llm) {
      return { summary: '', keyInsights: [], trends: [], recommendations: [], risks: [] };
    }

    const prompt = `You are a senior business analyst. Using the provided report summary, return JSON with keys: summary, keyInsights (5 items), trends (3 items), recommendations (3 items), risks (up to 3 items). Keep each item concise and action-oriented.\n\nReport Summary JSON:\n${JSON.stringify(summary)}`;

    try {
      const response = await this.llm.invoke([
        ['system', 'Return ONLY valid JSON. Do not include markdown or commentary.'],
        ['human', prompt]
      ]);

      const raw = response.content?.toString() || '';
      const jsonText = raw.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonText) {
        return { summary: '', keyInsights: [], trends: [], recommendations: [], risks: [] };
      }

      const parsed = JSON.parse(jsonText);
      return {
        summary: parsed.summary || '',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        trends: Array.isArray(parsed.trends) ? parsed.trends : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks : []
      };
    } catch (error) {
      console.error('Insights generation error:', error);
      return { summary: '', keyInsights: [], trends: [], recommendations: [], risks: [] };
    }
  }
}

export default new LLMService();
