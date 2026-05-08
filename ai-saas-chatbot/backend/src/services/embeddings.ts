import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

let pipeline: any = null;

export class EmbeddingsService {
  private extractor: any = null;
  private initialized = false;

  private async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    try {
      if (!pipeline) {
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
        // Suppress warning about using local models without a cache dir
        transformers.env.allowLocalModels = false;
      }

      console.log('⏳ Downloading/Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('✅ Local Embeddings service initialized (Transformers.js)');
    } catch (error) {
      console.warn('⚠️  Failed to initialize local embeddings service:', error);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.init();
    if (!this.extractor) {
      throw new Error('Local Embeddings service not available.');
    }
    
    // Generate embedding
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    await this.init();
    if (!this.extractor) {
      throw new Error('Local Embeddings service not available.');
    }

    const results: number[][] = [];
    
    // Process sequentially to avoid freezing the Node event loop or OOM issues
    for (const text of texts) {
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      results.push(Array.from(output.data));
    }

    return results;
  }

  async splitText(text: string, chunkSize: number = 1000): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', '']
    });

    const chunks = await splitter.splitText(text);
    return chunks.filter(chunk => chunk.trim().length > 0);
  }
}

export default new EmbeddingsService();
