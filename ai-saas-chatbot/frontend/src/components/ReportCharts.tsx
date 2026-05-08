import React, { useMemo, useRef } from 'react';
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
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { Report } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

interface ReportChartsProps {
  report: Report;
}

export default function ReportCharts({ report }: ReportChartsProps) {
  const barRef = useRef<ChartJS<'bar'> | null>(null);
  const pieRef = useRef<ChartJS<'pie'> | null>(null);
  const chartHeight = 220;

  const numericOverview = useMemo(() => {
    const stats = [...report.numericStats]
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6);

    return {
      labels: stats.map(stat => stat.column),
      datasets: [
        {
          label: 'Average',
          data: stats.map(stat => Number(stat.avg.toFixed(2))),
          backgroundColor: 'rgba(0, 206, 201, 0.6)',
          borderColor: 'rgba(0, 206, 201, 0.9)',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 42,
        },
      ],
    };
  }, [report.numericStats]);

  const categoricalOverview = useMemo(() => {
    const category = report.categoricalStats[0];
    if (!category) {
      return null;
    }
    const topValues = category.topValues.slice(0, 6);

    return {
      title: category.column,
      data: {
        labels: topValues.map(item => item.value),
        datasets: [
          {
            label: 'Share',
            data: topValues.map(item => item.count),
            backgroundColor: [
              '#00cec9',
              '#1e90ff',
              '#2ed573',
              '#ffa502',
              '#ff6b6b',
              '#a29bfe',
            ],
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
          },
        ],
      },
    };
  }, [report.categoricalStats]);

  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    let y = 48;

    const addSectionTitle = (title: string) => {
      doc.setFontSize(13);
      doc.setTextColor('#1e1e45');
      doc.text(title, margin, y);
      y += 18;
    };

    const addParagraph = (text: string) => {
      doc.setFontSize(10);
      doc.setTextColor('#333333');
      const lines = doc.splitTextToSize(text, maxWidth) as string[];
      lines.forEach((line: string) => {
        if (y > 760) {
          doc.addPage();
          y = 48;
        }
        doc.text(line, margin, y);
        y += 14;
      });
      y += 6;
    };

    doc.setFontSize(18);
    doc.setTextColor('#0d0d1a');
    doc.text(report.title, margin, y);
    y += 22;

    doc.setFontSize(10);
    doc.setTextColor('#555555');
    doc.text(`Rows: ${report.rowCount} | Columns: ${report.columnCount}`, margin, y);
    y += 20;

    if (report.insights?.summary) {
      addSectionTitle('Executive Summary');
      addParagraph(report.insights.summary);
    }

    const insights = report.insights?.keyInsights || [];
    if (insights.length > 0) {
      addSectionTitle('Key Insights');
      insights.slice(0, 5).forEach((insight, index) => {
        addParagraph(`${index + 1}. ${insight}`);
      });
    }

    const barChart = barRef.current?.toBase64Image();
    if (barChart) {
      if (y > 600) {
        doc.addPage();
        y = 48;
      }
      addSectionTitle('Top Numeric Averages');
      doc.addImage(barChart, 'PNG', margin, y, maxWidth, 240);
      y += 260;
    }

    const pieChart = pieRef.current?.toBase64Image();
    if (pieChart) {
      if (y > 600) {
        doc.addPage();
        y = 48;
      }
      addSectionTitle(categoricalOverview ? `Category Share: ${categoricalOverview.title}` : 'Category Share');
      doc.addImage(pieChart, 'PNG', margin, y, maxWidth, 240);
      y += 260;
    }

    doc.save(`${report.title.replace(/\s+/g, '-').toLowerCase()}-report.pdf`);
  };

  if (report.numericStats.length === 0 && !categoricalOverview) {
    return null;
  }

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Charts
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-primary)',
            background: 'rgba(0,0,0,0.25)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(0,206,201,0.6)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)')}
        >
          Export PDF
        </button>
      </div>

      {report.numericStats.length > 0 && (
        <div style={{ marginBottom: categoricalOverview ? 20 : 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            Top numeric averages
          </div>
          <div style={{ height: chartHeight }}>
            <Bar
              ref={barRef}
              data={numericOverview}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    ticks: { color: '#9aa4c7', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#9aa4c7', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {categoricalOverview && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            Top categories for {categoricalOverview.title}
          </div>
          <div style={{ height: chartHeight }}>
            <Pie
              ref={pieRef}
              data={categoricalOverview.data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#cbd2e1', font: { size: 10 } } },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
