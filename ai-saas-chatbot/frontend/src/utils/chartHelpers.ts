import { Report } from '../types';

export interface SmartChart {
  id: string;
  type: 'bar' | 'line' | 'doughnut';
  title: string;
  subtitle: string;
  chartData: any;
  options: any;
}

export const PALETTE = [
  '#00cec9', '#1e90ff', '#2ed573', '#ffa502',
  '#ff6b6b', '#a29bfe', '#fd79a8', '#fdcb6e',
];

export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(13,13,26,0.95)',
      borderColor: 'rgba(0,206,201,0.3)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      padding: 10,
    },
  },
  scales: {
    x: { 
      ticks: { 
        color: '#64748b', 
        font: { size: 10 },
        maxRotation: 90,
        minRotation: 90,
        autoSkip: true,
      }, 
      grid: { color: 'rgba(255,255,255,0.04)' } 
    },
    y: { beginAtZero: true, ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

export const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  cutout: '65%',
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10, padding: 10 } },
    tooltip: {
      backgroundColor: 'rgba(13,13,26,0.95)',
      borderColor: 'rgba(0,206,201,0.3)',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
      padding: 10,
    },
  },
};

export function buildLineChart(
  rows: Record<string, any>[],
  xCol: string,
  yCol: string,
  title: string
): SmartChart | null {
  const valid = rows.filter(r => r[xCol] != null && r[yCol] != null && !isNaN(Number(r[yCol])));
  if (valid.length < 2) return null;

  const sorted = [...valid].sort((a, b) => {
    const da = new Date(String(a[xCol])).getTime();
    const db = new Date(String(b[xCol])).getTime();
    return isNaN(da) || isNaN(db) ? 0 : da - db;
  });

  const step = Math.max(1, Math.floor(sorted.length / 25));
  const sampled = sorted.filter((_, i) => i % step === 0).slice(0, 25);

  const labels = sampled.map(r => {
    const d = new Date(String(r[xCol]));
    return isNaN(d.getTime())
      ? String(r[xCol]).slice(0, 10)
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return {
    id: `line-${xCol}-${yCol}`,
    type: 'line',
    title,
    subtitle: `${yCol} over ${xCol}`,
    chartData: {
      labels,
      datasets: [{
        label: yCol,
        data: sampled.map(r => Number(r[yCol]) || 0),
        borderColor: PALETTE[0],
        backgroundColor: `${PALETTE[0]}22`,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
      }],
    },
    options: { ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } },
  };
}

export function buildBarByCategory(
  rows: Record<string, any>[],
  catCol: string,
  numCol: string,
  topValues: { value: string; count: number }[],
  title: string
): SmartChart | null {
  const labels = topValues.slice(0, 8).map(tv => tv.value);
  if (labels.length === 0) return null;

  const grouped: Record<string, number[]> = {};
  rows.forEach(row => {
    const cat = String(row[catCol] ?? '');
    const val = row[numCol];
    if (!cat || val == null || isNaN(Number(val))) return;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(Number(val));
  });

  const data = labels.map(label => {
    const vals = grouped[label] || [];
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  return {
    id: `bar-${catCol}-${numCol}`,
    type: 'bar',
    title,
    subtitle: `Average ${numCol} per ${catCol}`,
    chartData: {
      labels,
      datasets: [{
        label: `Avg ${numCol}`,
        data: data.map(v => +v.toFixed(2)),
        backgroundColor: labels.map((_, i) => `${PALETTE[i % PALETTE.length]}bb`),
        borderColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 48,
      }],
    },
    options: { ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } },
  };
}

export function buildDoughnut(
  topValues: { value: string; count: number }[],
  column: string,
  title: string
): SmartChart | null {
  const sliced = topValues.slice(0, 6);
  if (sliced.length === 0) return null;

  return {
    id: `doughnut-${column}`,
    type: 'doughnut',
    title,
    subtitle: `Distribution of ${column}`,
    chartData: {
      labels: sliced.map(v => v.value),
      datasets: [{
        data: sliced.map(v => v.count),
        backgroundColor: sliced.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: 'rgba(13,13,26,0.8)',
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: doughnutOptions,
  };
}
