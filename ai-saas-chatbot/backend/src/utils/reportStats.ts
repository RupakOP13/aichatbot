import { ICategoricalStat, INumericStat } from '../models/Report';

export interface ReportProfile {
  rowCount: number;
  columnCount: number;
  numericStats: INumericStat[];
  categoricalStats: ICategoricalStat[];
  previewRows: Record<string, string | number | null>[];
  dataSample: Record<string, string | number | null>[];
}

const isNumberValue = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isLikelyDate = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  const parsed = Date.parse(String(value));
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

const buildNumericStats = (values: unknown[], column: string): INumericStat | null => {
  const numbers = values.filter(isNumberValue);
  if (numbers.length === 0) return null;

  const sum = numbers.reduce((acc, val) => acc + val, 0);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const avg = sum / numbers.length;

  return {
    column,
    min,
    max,
    avg,
    sum,
    count: numbers.length
  };
};

const buildCategoricalStats = (values: unknown[], column: string, limit: number = 5): ICategoricalStat | null => {
  const counter = new Map<string, number>();

  values.forEach(value => {
    if (value === null || value === undefined || value === '') return;
    const key = String(value).trim();
    if (!key) return;
    counter.set(key, (counter.get(key) || 0) + 1);
  });

  if (counter.size === 0) return null;

  const topValues = Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));

  return {
    column,
    topValues
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

  columns.forEach(column => {
    const values = rows.map(row => row[column]);
    const type = inferColumnType(values);

    if (type === 'number') {
      const stat = buildNumericStats(values, column);
      if (stat) numericStats.push(stat);
      return;
    }

    if (type === 'string') {
      const stat = buildCategoricalStats(values, column);
      if (stat) categoricalStats.push(stat);
    }
  });

  return {
    rowCount: rows.length,
    columnCount: columns.length,
    numericStats,
    categoricalStats,
    previewRows: rows.slice(0, previewSize),
    dataSample: rows.slice(0, sampleSize)
  };
};
