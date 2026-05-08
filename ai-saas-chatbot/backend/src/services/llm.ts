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
        temperature: 0.1, // Lower temperature for more factual analysis
        maxTokens: 2048,
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

    const lowerQ = question.toLowerCase();
    const isChartRequest = lowerQ.includes('chart') || lowerQ.includes('graph') || lowerQ.includes('visualize') || lowerQ.includes('plot');

    const systemPrompt =
      context && context.trim().length > 0
        ? `You are a helpful AI business data analyst. Use the following report context to answer the user's question accurately.
${isChartRequest ? 'If the user asks for a chart or visualization, include a JSON block at the end of your message in this format: [CHART_CONFIG: {"type": "bar|line|pie", "title": "Chart Title", "xColumn": "colName", "yColumn": "colName", "column": "colName (for pie)"}].' : ''}
Context:
${context}`
        : `You are a helpful AI assistant. Answer the user's question clearly and concisely.`;

    try {
      const response = await this.llm.invoke([
        ['system', systemPrompt],
        ['human', question],
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
      return firstMessage.split(' ').slice(0, 5).join(' ');
    }

    try {
      const response = await this.llm.invoke([
        [
          'system',
          'Generate a short, concise title (max 5 words) for a chat conversation. Return only the title text, no quotes or extra formatting.',
        ],
        ['human', `First message: "${firstMessage.substring(0, 150)}"`],
      ]);

      const title =
        response.content?.toString().trim().replace(/^[\"']|[\"']$/g, '') ||
        'New Chat';
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
    columnTypes: Record<string, string>;
    numericStats: any[];
    categoricalStats: any[];
    previewRows: Record<string, string | number | null>[];
    industry?: string;
  }): Promise<{
    summary?: string;
    keyInsights: string[];
    trends: string[];
    recommendations: string[];
    risks: string[];
    chartConfig?: {
      recommendedCharts: Array<{
        type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
        title: string;
        xColumn?: string;
        yColumn?: string;
        column?: string;
        description?: string;
      }>;
    };
  }> {
    await this.init();
    if (!this.llm) {
      return { summary: '', keyInsights: [], trends: [], recommendations: [], risks: [] };
    }

    const dateColumns = Object.entries(summary.columnTypes)
      .filter(([, type]) => type === 'date')
      .map(([col]) => col);
    const numericColumns = summary.numericStats.map((s: any) => s.column);
    const categoricalColumns = summary.categoricalStats.map((s: any) => s.column);

    const prompt = `You are a senior data analyst${summary.industry ? ` specializing in the ${summary.industry} industry` : ''}. Analyze this dataset and return ONLY valid JSON with these keys:
- summary (string): 2-3 sentence executive summary of the data
- keyInsights (array of 5 strings): specific data-driven observations with numbers
- trends (array of 3 strings): patterns and trends in the data
- recommendations (array of 3 strings): actionable recommendations
- risks (array of up to 3 strings): data quality issues or business risks
- chartConfig (object): recommended charts for this specific dataset

For chartConfig.recommendedCharts, suggest 2-4 charts. Use these column names exactly: ${summary.columns.join(', ')}.
Date columns: [${dateColumns.join(', ')}]
Numeric columns: [${numericColumns.join(', ')}]
Categorical columns: [${categoricalColumns.join(', ')}]

Chart types allowed: "line", "bar", "pie", "area".

Dataset Summary:
${JSON.stringify({ 
  title: summary.title, 
  rowCount: summary.rowCount, 
  columnCount: summary.columnCount, 
  numericStats: summary.numericStats, 
  categoricalStats: summary.categoricalStats.slice(0, 3),
  industry: summary.industry || 'General Business'
})}`;

    try {
      const response = await this.llm.invoke([
        ['system', 'Return ONLY valid JSON. No markdown, no code blocks, no commentary.'],
        ['human', prompt],
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
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        chartConfig: parsed.chartConfig || undefined,
      };
    } catch (error) {
      console.error('Insights generation error:', error);
      return { summary: '', keyInsights: [], trends: [], recommendations: [], risks: [] };
    }
  }
}

export default new LLMService();
