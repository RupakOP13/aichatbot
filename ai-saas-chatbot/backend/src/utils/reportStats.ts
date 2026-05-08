import { ICategoricalStat, INumericStat } from '../models/Report';

export interface ReportProfile {
  rowCount: number;
  columnCount: number;
  numericStats: INumericStat[];
  categoricalStats: ICategoricalStat[];
  columnTypes: Record<string, 'number' | 'date' | 'string'>;
  previewRows: Record<string, string | number | null>[];
  dataSample: Record<string, string | number | null>[];
}

const isNumberValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isLikelyDate = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  if (!str) return false;
  // Must match a date-like pattern to avoid false positives on pure numbers
  if (/^\d+$/.test(str)) return false;
  const parsed = Date.parse(str);
  return !Number.isNaN(parsed);
};

const inferColumnType = (values: unknown[]): 'number' | 'date' | 'string' => {
  let numericCount = 0;
  let dateCount = 0;
  let total = 0;

  values.forEach(value => {
    if (value === null || value === undefined || value === '') return;
    total += 1;
    if (isNumberValue(value)) {
      numericCount += 1;
      return;
    }
    if (isLikelyDate(value)) {
      dateCount += 1;
    }
  });

  if (total === 0) return 'string';
  if (numericCount / total >= 0.7) return 'number';
  if (dateCount / total >= 0.7) return 'date';
  return 'string';
};

const computeMedian = (sorted: number[]): number => {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const computeStdDev = (numbers: number[], avg: number): number => {
  if (numbers.length < 2) return 0;
  const variance =
    numbers.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    (numbers.length - 1);
  return Math.sqrt(variance);
};

const buildNumericStats = (values: unknown[], column: string): INumericStat | null => {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  const nullCount = values.length - nonNull.length;
  const numbers = values.filter(isNumberValue);
  if (numbers.length === 0) return null;

  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = sum / numbers.length;
  const median = computeMedian(sorted);
  const stdDev = computeStdDev(numbers, avg);
  const uniqueCount = new Set(numbers).size;

  return {
    column,
    min,
    max,
    avg,
    sum,
    count: numbers.length,
    median,
    stdDev,
    nullCount,
    uniqueCount,
  };
};

const buildCategoricalStats = (
  values: unknown[],
  column: string,
  limit: number = 8
): ICategoricalStat | null => {
  const counter = new Map<string, number>();
  let nullCount = 0;

  values.forEach(value => {
    if (value === null || value === undefined || value === '') {
      nullCount += 1;
      return;
    }
    const key = String(value).trim();
    if (!key) {
      nullCount += 1;
      return;
    }
    counter.set(key, (counter.get(key) || 0) + 1);
  });

  if (counter.size === 0) return null;

  const topValues = Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));

  return {
    column,
    topValues,
    uniqueCount: counter.size,
    nullCount,
  };
};

export const buildReportProfile = (
  columns: string[],
  rows: Record<string, string | number | null>[],
  options?: { previewSize?: number; sampleSize?: number }
): ReportProfile => {
  const previewSize = options?.previewSize ?? 20;
  const sampleSize = options?.sampleSize ?? 200;

  const numericStats: INumericStat[] = [];
  const categoricalStats: ICategoricalStat[] = [];
  const columnTypes: Record<string, 'number' | 'date' | 'string'> = {};

  columns.forEach(column => {
    const values = rows.map(row => row[column]);
    const type = inferColumnType(values);
    columnTypes[column] = type;

    if (type === 'number') {
      const stat = buildNumericStats(values, column);
      if (stat) numericStats.push(stat);
      return;
    }

    // Both 'string' and 'date' get categorical stats
    const stat = buildCategoricalStats(values, column);
    if (stat) categoricalStats.push(stat);
  });

  return {
    rowCount: rows.length,
    columnCount: columns.length,
    numericStats,
    categoricalStats,
    columnTypes,
    previewRows: rows.slice(0, previewSize),
    dataSample: rows.slice(0, sampleSize),
  };
};
