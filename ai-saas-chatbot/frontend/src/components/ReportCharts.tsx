import React, { useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { Report, ChartRecommendation } from '../types';
import { 
  SmartChart, 
  buildLineChart, 
  buildBarByCategory, 
  buildDoughnut, 
  PALETTE,
  baseOptions,
  doughnutOptions
} from '../utils/chartHelpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

interface ReportChartsProps {
  report: Report;
}

function buildNumericOverview(numericStats: Report['numericStats'], title: string): SmartChart | null {
  const stats = numericStats.slice(0, 8);
  if (stats.length < 2) return null;

  return {
    id: 'numeric-overview',
    type: 'bar',
    title,
    subtitle: 'Average values across numeric columns',
    chartData: {
      labels: stats.map(s => s.column),
      datasets: [{
        label: 'Average',
        data: stats.map(s => +s.avg.toFixed(2)),
        backgroundColor: stats.map((_, i) => `${PALETTE[i % PALETTE.length]}bb`),
        borderColor: stats.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 48,
      }],
    },
    options: { ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } },
  };
}

export default function ReportCharts({ report }: ReportChartsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRefs = useRef<Record<string, any>>({});

  const rows = useMemo(
    () => (report.dataSample || report.previewRows || []) as Record<string, any>[],
    [report]
  );

  const columnTypes = report.columnTypes || {};

  // Detect date columns from columnTypes or sample data
  const dateColumns = useMemo(() => {
    const fromTypes = Object.entries(columnTypes)
      .filter(([, t]) => t === 'date')
      .map(([c]) => c);
    if (fromTypes.length > 0) return fromTypes;

    // Fallback: sniff from rows
    return report.columns.filter(col => {
      const sample = rows.slice(0, 8).map(r => r[col]).filter(Boolean);
      if (sample.length === 0) return false;
      const hits = sample.filter(v => {
        const s = String(v);
        if (/^\d+$/.test(s)) return false;
        return !isNaN(Date.parse(s));
      });
      return hits.length / sample.length >= 0.6;
    });
  }, [report.columns, columnTypes, rows]);

  // Build smart charts using AI chartConfig or auto-detection
  const charts: SmartChart[] = useMemo(() => {
    const result: SmartChart[] = [];
    const aiCharts: ChartRecommendation[] = report.insights?.chartConfig?.recommendedCharts || [];

    // --- Use AI-recommended charts first ---
    for (const rec of aiCharts) {
      if (rec.type === 'line' && rec.xColumn && rec.yColumn) {
        const c = buildLineChart(rows, rec.xColumn, rec.yColumn, rec.title);
        if (c) result.push(c);
      } else if (rec.type === 'bar' && rec.xColumn && rec.yColumn) {
        const catStat = report.categoricalStats.find(s => s.column === rec.xColumn);
        if (catStat) {
          const c = buildBarByCategory(rows, rec.xColumn, rec.yColumn, catStat.topValues, rec.title);
          if (c) result.push(c);
        }
      } else if (rec.type === 'pie' && rec.column) {
        const catStat = report.categoricalStats.find(s => s.column === rec.column);
        if (catStat) {
          const c = buildDoughnut(catStat.topValues, rec.column, rec.title);
          if (c) result.push(c);
        }
      }
    }

    // --- Auto-detection fallback if AI didn't provide charts ---
    if (result.length === 0) {
      // Line chart: date + top numeric
      if (dateColumns.length > 0 && report.numericStats.length > 0) {
        const dateCol = dateColumns[0];
        const numCols = report.numericStats.slice(0, 2);
        numCols.forEach(ns => {
          const c = buildLineChart(rows, dateCol, ns.column, `${ns.column} Over Time`);
          if (c) result.push(c);
        });
      }

      // Bar: categorical + numeric
      report.categoricalStats.slice(0, 2).forEach((cs, i) => {
        const ns = report.numericStats[0];
        if (!ns) return;
        const c = buildBarByCategory(rows, cs.column, ns.column, cs.topValues, `${ns.column} by ${cs.column}`);
        if (c) result.push(c);
      });

      // Doughnut: first categorical
      if (report.categoricalStats.length > 0) {
        const cs = report.categoricalStats[0];
        const c = buildDoughnut(cs.topValues, cs.column, `${cs.column} Distribution`);
        if (c) result.push(c);
      }

      // Numeric overview if no date cols
      if (dateColumns.length === 0 && report.numericStats.length > 1) {
        const c = buildNumericOverview(report.numericStats, 'Numeric Column Averages');
        if (c) result.push(c);
      }
    }

    // Extra doughnut if only 1 chart generated so far
    if (result.length === 1 && report.categoricalStats.length > 1) {
      const cs = report.categoricalStats[1];
      const c = buildDoughnut(cs.topValues, cs.column, `${cs.column} Distribution`);
      if (c) result.push(c);
    }

    return result;
  }, [report, rows, dateColumns]);

  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pw = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 48;

    doc.setFontSize(18);
    doc.setTextColor('#0d0d1a');
    doc.text(report.title, margin, y);
    y += 24;

    doc.setFontSize(10);
    doc.setTextColor('#555');
    doc.text(`Rows: ${report.rowCount} | Columns: ${report.columnCount}`, margin, y);
    y += 18;

    if (report.insights?.summary) {
      doc.setFontSize(12);
      doc.setTextColor('#1e1e45');
      doc.text('Executive Summary', margin, y);
      y += 16;
      doc.setFontSize(10);
      doc.setTextColor('#333');
      const lines = doc.splitTextToSize(report.insights.summary, pw) as string[];
      lines.forEach((l: string) => { doc.text(l, margin, y); y += 14; });
      y += 8;
    }

    charts.forEach(chart => {
      const ref = chartRefs.current[chart.id];
      if (!ref) return;
      if (y > 620) { doc.addPage(); y = 48; }
      doc.setFontSize(12);
      doc.setTextColor('#1e1e45');
      doc.text(chart.title, margin, y);
      y += 14;
      doc.addImage(ref.toBase64Image(), 'PNG', margin, y, pw, 200);
      y += 218;
    });

    doc.save(`${report.title.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
  };

  if (charts.length === 0) return null;

  const active = charts[activeIdx];

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          📈 Charts
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          style={{
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
            padding: '5px 12px', fontSize: 11, fontWeight: 600,
            color: 'var(--text-primary)', background: 'rgba(0,0,0,0.25)',
            cursor: 'pointer', transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0,206,201,0.6)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)')}
        >
          Export PDF
        </button>
      </div>

      {/* Chart tabs */}
      {charts.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {charts.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                border: `1px solid ${i === activeIdx ? 'rgba(0,206,201,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: i === activeIdx ? 'rgba(0,206,201,0.12)' : 'transparent',
                color: i === activeIdx ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'var(--transition-fast)',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              title={c.title}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Active chart */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
          {active.title}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 10 }}>
          {active.subtitle}
        </div>
        <div style={{ height: 260 }}>
          {active.type === 'line' && (
            <Line
              ref={el => { chartRefs.current[active.id] = el; }}
              data={active.chartData}
              options={active.options}
            />
          )}
          {active.type === 'bar' && (
            <Bar
              ref={el => { chartRefs.current[active.id] = el; }}
              data={active.chartData}
              options={active.options}
            />
          )}
          {active.type === 'doughnut' && (
            <Doughnut
              ref={el => { chartRefs.current[active.id] = el; }}
              data={active.chartData}
              options={active.options}
            />
          )}
        </div>
      </div>
    </div>
  );
}
