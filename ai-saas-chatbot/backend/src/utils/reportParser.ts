import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParsedReport {
  columns: string[];
  rows: Record<string, string | number | null>[];
}

const normalizeKey = (key: string): string => key.trim();

const normalizeHeaderCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const isEmptyCell = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};

const buildUniqueColumns = (headers: string[], columnIndices: number[]): string[] => {
  const seen = new Map<string, number>();

  return headers.map((header, idx) => {
    const fallback = `Column ${columnIndices[idx] + 1}`;
    const base = normalizeKey(header || fallback) || fallback;
    const key = base.toLowerCase();
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    return count === 0 ? base : `${base} ${count + 1}`;
  });
};

const scoreHeaderRow = (row: unknown[]): number => {
  const cells = row.map(normalizeHeaderCell).filter(Boolean);
  if (cells.length === 0) return 0;

  const textCells = cells.filter(cell => {
    const numeric = Number(cell.replace(/,/g, ''));
    return Number.isNaN(numeric);
  });
  const uniqueCount = new Set(cells.map(cell => cell.toLowerCase())).size;

  return textCells.length * 3 + cells.length + uniqueCount;
};

const pickHeaderRowIndex = (rows: unknown[][], scanLimit: number = 30): number => {
  const limit = Math.min(rows.length, scanLimit);
  let bestIndex = 0;
  let bestScore = -1;

  for (let i = 0; i < limit; i += 1) {
    const score = scoreHeaderRow(rows[i] || []);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
};

const coerceValue = (value: unknown): string | number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value ? 1 : 0;

  const text = String(value).trim();
  if (!text) return null;

  const asNumber = Number(text.replace(/,/g, ''));
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
    return asNumber;
  }

  return text;
};

const normalizeRows = (
  rawRows: Record<string, unknown>[],
  columns: string[]
): Record<string, string | number | null>[] => {
  return rawRows.map(row => {
    const normalized: Record<string, string | number | null> = {};
    for (const column of columns) {
      normalized[column] = coerceValue(row[column]);
    }
    return normalized;
  });
};

const collectColumns = (rows: Record<string, unknown>[]): string[] => {
  const columnSet = new Set<string>();
  rows.forEach(row => {
    Object.keys(row).forEach(key => {
      const cleaned = normalizeKey(key);
      if (cleaned) columnSet.add(cleaned);
    });
  });
  return Array.from(columnSet);
};

export const parseCsv = (buffer: Buffer): ParsedReport => {
  const csvText = buffer.toString('utf-8');
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors && parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message || 'Failed to parse CSV');
  }

  const rawRows = (parsed.data || []).filter((row: Record<string, unknown>) => Object.keys(row).length > 0);
  const headerFields = (parsed.meta.fields || []).map(field => normalizeHeaderCell(field));
  const columnIndices = headerFields.map((_, idx) => idx);
  const columns = headerFields.length > 0
    ? buildUniqueColumns(headerFields, columnIndices)
    : collectColumns(rawRows);
  const rows = normalizeRows(rawRows, columns);

  return { columns, rows };
};

export const parseXlsx = (buffer: Buffer): ParsedReport => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in Excel file');
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = xlsx.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    raw: false
  });

  if (!matrix || matrix.length === 0) {
    throw new Error('Sheet appears to be empty');
  }

  const headerRowIndex = pickHeaderRowIndex(matrix);
  const headerRow = matrix[headerRowIndex] || [];
  const dataRows = matrix.slice(headerRowIndex + 1);

  const normalizedHeaders = headerRow.map(normalizeHeaderCell);
  const columnIndices: number[] = [];
  const headerNames: string[] = [];

  normalizedHeaders.forEach((header, idx) => {
    const hasData = dataRows.some(row => !isEmptyCell(row?.[idx]));
    if (!header && !hasData) return;
    columnIndices.push(idx);
    headerNames.push(header);
  });

  const columns = buildUniqueColumns(headerNames, columnIndices);

  const rawRows = dataRows
    .map(row => {
      const record: Record<string, unknown> = {};
      columnIndices.forEach((colIndex, colIdx) => {
        record[columns[colIdx]] = row?.[colIndex] ?? null;
      });
      return record;
    })
    .filter(row => Object.values(row).some(value => !isEmptyCell(value)));

  const rows = normalizeRows(rawRows, columns);

  return { columns, rows };
};

export const parseJson = (buffer: Buffer): ParsedReport => {
  const text = buffer.toString('utf-8');
  const data = JSON.parse(text);
  
  let rawRows: Record<string, any>[] = [];
  if (Array.isArray(data)) {
    rawRows = data.filter(item => typeof item === 'object' && item !== null);
  } else if (typeof data === 'object' && data !== null) {
    // If it's a single object, wrap it in an array
    rawRows = [data];
  } else {
    throw new Error('JSON content must be an object or an array of objects');
  }

  if (rawRows.length === 0) {
    throw new Error('JSON document is empty');
  }

  const columns = collectColumns(rawRows);
  const rows = normalizeRows(rawRows, columns);

  return { columns, rows };
};

export const parsePdf = async (buffer: Buffer): Promise<ParsedReport> => {
  const data = await pdf(buffer);
  const content = data.text.trim();
  
  if (!content) {
    throw new Error('No text content found in PDF');
  }

  // Treat as a single-column table for analysis compatibility
  return {
    columns: ['Content'],
    rows: [{ Content: content }]
  };
};

export const parseDocx = async (buffer: Buffer): Promise<ParsedReport> => {
  const result = await mammoth.extractRawText({ buffer });
  const content = result.value.trim();

  if (!content) {
    throw new Error('No text content found in Word document');
  }

  return {
    columns: ['Content'],
    rows: [{ Content: content }]
  };
};
