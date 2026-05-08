/**
 * Split text into overlapping chunks for embedding.
 */
export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  if (!text || text.trim().length === 0) return [];
  
  const cleanedText = cleanText(text);
  const chunks: string[] = [];
  let start = 0;

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.substring(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move forward by chunkSize - overlap
    const step = chunkSize - overlap;
    if (step <= 0) break; // prevent infinite loop
    start += step;
    
    // If remaining text is smaller than overlap, capture it in current chunk
    if (start >= cleanedText.length) break;
  }

  return chunks;
};

/**
 * Clean text by normalizing whitespace and removing control characters.
 */
export const cleanText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\t/g, ' ')              // Replace tabs
    .replace(/\n{3,}/g, '\n\n')       // Collapse multiple newlines
    .replace(/[ ]{2,}/g, ' ')         // Collapse multiple spaces
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
};

/**
 * Extract filename without extension.
 */
export const extractFileName = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return filename;
  return filename.substring(0, lastDot);
};

/**
 * Format file size in human-readable format.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text to a max length with ellipsis.
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
