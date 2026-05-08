import React from 'react';
import { Report } from '../types';
import ReportCharts from './ReportCharts';

interface ReportContextPanelProps {
  report: Report | null;
}

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '-';
  return value.toLocaleString();
};

export default function ReportContextPanel({ report }: ReportContextPanelProps) {
  if (!report) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center'
      }}>
        <div className="animate-fade-in" style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Upload a business report
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Upload a CSV or Excel report to view stats, insights, and chat with your data.
          </p>
        </div>
      </div>
    );
  }

  const previewColumns = report.columns.slice(0, 8);
  const previewRows = report.previewRows.slice(0, 8);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', padding: 20 }}>
      <div className="glass" style={{
        borderRadius: 'var(--radius-lg)', padding: 18, border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {report.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {report.filename} · {report.fileSizeFormatted || '—'}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            color: report.status === 'completed' ? 'var(--success)' : report.status === 'failed' ? 'var(--error)' : 'var(--warning)',
            background: 'rgba(255,255,255,0.06)',
            textTransform: 'capitalize'
          }}>
            {report.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Rows', value: formatNumber(report.rowCount) },
          { label: 'Columns', value: formatNumber(report.columnCount) },
          { label: 'Numeric Fields', value: formatNumber(report.numericStats.length) }
        ].map(stat => (
          <div key={stat.label} className="glass" style={{
            borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
          AI Insights
        </div>
        {report.status === 'processing' ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Generating insights... this takes a few seconds.
          </p>
        ) : report.insights ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {report.insights.summary && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {report.insights.summary}
              </div>
            )}
            {report.insights.keyInsights.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Key Insights
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {report.insights.keyInsights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.insights.trends.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Trends
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {report.insights.trends.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.insights.recommendations.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Recommendations
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {report.insights.recommendations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {report.insights.risks.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Risks
                </div>
                <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {report.insights.risks.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Insights are not available yet.
          </p>
        )}
      </div>

      <ReportCharts report={report} />

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
          Data Preview
        </div>
        {previewRows.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No preview available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {previewColumns.map(col => (
                    <th
                      key={col}
                      style={{
                        textAlign: 'left', fontSize: 11, color: 'var(--text-muted)',
                        padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)'
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {previewColumns.map(col => (
                      <td
                        key={col}
                        style={{
                          fontSize: 11, color: 'var(--text-secondary)',
                          padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)'
                        }}
                      >
                        {row[col] === null || row[col] === undefined ? '-' : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
