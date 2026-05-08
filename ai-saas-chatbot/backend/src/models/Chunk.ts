import mongoose, { Schema, Document } from 'mongoose';

export interface IChunk extends Document {
  documentId: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
  totalChunks: number;
}

const chunkSchema = new Schema<IChunk>({
  documentId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  chunkIndex: { type: Number, required: true },
  totalChunks: { type: Number, required: true }
});

export default mongoose.model<IChunk>('Chunk', chunkSchema);
