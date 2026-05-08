import React, { useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Report } from '../types';
import { 
  buildLineChart, 
  buildBarByCategory, 
  buildDoughnut, 
  SmartChart 
} from '../utils/chartHelpers';

interface DynamicChatChartProps {
  config: {
    type: 'bar' | 'line' | 'pie';
    title: string;
    xColumn?: string;
    yColumn?: string;
    column?: string;
  };
  report: Report | null;
}

export default function DynamicChatChart({ config, report }: DynamicChatChartProps) {
  const chart: SmartChart | null = useMemo(() => {
    if (!report) return null;
    const rows = (report.dataSample || report.previewRows || []) as Record<string, any>[];

    if (config.type === 'line' && config.xColumn && config.yColumn) {
      return buildLineChart(rows, config.xColumn, config.yColumn, config.title);
    }
    
    if (config.type === 'bar' && config.xColumn && config.yColumn) {
      const catStat = report.categoricalStats.find(s => s.column === config.xColumn);
      if (catStat) {
        return buildBarByCategory(rows, config.xColumn, config.yColumn, catStat.topValues, config.title);
      }
    }

    if (config.type === 'pie' && config.column) {
      const catStat = report.categoricalStats.find(s => s.column === config.column);
      if (catStat) {
        return buildDoughnut(catStat.topValues, config.column, config.title);
      }
    }

    return null;
  }, [config, report]);

  if (!chart) return null;

  return (
    <div style={{ 
      marginTop: 12, 
      background: 'rgba(0,0,0,0.2)', 
      borderRadius: 'var(--radius-md)', 
      padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
        {chart.title}
      </div>
      <div style={{ height: 220 }}>
        {chart.type === 'line' && <Line data={chart.chartData} options={chart.options} />}
        {chart.type === 'bar' && <Bar data={chart.chartData} options={chart.options} />}
        {chart.type === 'doughnut' && <Doughnut data={chart.chartData} options={chart.options} />}
      </div>
    </div>
  );
}
