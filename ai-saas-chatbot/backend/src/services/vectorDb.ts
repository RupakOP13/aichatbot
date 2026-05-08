import ChunkModel from '../models/Chunk';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorDBService {
  async upsertVectors(
    documentId: string,
    texts: string[],
    embeddings: number[][]
  ): Promise<string[]> {
    console.log(`💾 Saving ${texts.length} chunks to local MongoDB vector store...`);
    
    // Clean up old chunks for this document if replacing
    await ChunkModel.deleteMany({ documentId });

    const chunks = texts.map((text, idx) => ({
      documentId,
      text: text.substring(0, 500),
      embedding: embeddings[idx],
      chunkIndex: idx,
      totalChunks: texts.length
    }));

    const saved = await ChunkModel.insertMany(chunks);
    console.log('✅ Local vector storage successful');
    
    return saved.map(c => c._id.toString());
  }

  async queryVectors(
    embedding: number[],
    topK: number = 5,
    documentIds?: string[]
  ): Promise<any[]> {
    // 1. Fetch vectors from MongoDB, strictly filtering by documentIds
    // CRITICAL: If no documentIds are provided, return empty to prevent data leakage from other users
    if (!documentIds || documentIds.length === 0) {
      return [];
    }

    const query = { documentId: { $in: documentIds } };
    const allChunks = await ChunkModel.find(query, 'documentId text embedding chunkIndex').lean();

    if (allChunks.length === 0) return [];

    // 2. Compute cosine similarity
    const scoredChunks = allChunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(embedding, chunk.embedding)
    }));

    // 3. Sort by descending score and take topK
    scoredChunks.sort((a, b) => b.score - a.score);
    const topResults = scoredChunks.slice(0, topK);

    // 4. Format to match previous Pinecone interface
    return topResults.map(result => ({
      id: result.chunk._id.toString(),
      score: result.score,
      metadata: {
        documentId: result.chunk.documentId,
        text: result.chunk.text,
        chunkIndex: result.chunk.chunkIndex
      }
    }));
  }

  async deleteDocumentVectors(documentId: string): Promise<void> {
    try {
      await ChunkModel.deleteMany({ documentId });
      console.log(`🗑️ Deleted vectors for document ${documentId}`);
    } catch (error) {
      console.warn(`Vector cleanup for document ${documentId} skipped:`, error);
    }
  }
}

export default new VectorDBService();
