import React, { useState, useMemo } from 'react';
import { Report } from '../types';
import ReportCharts from './ReportCharts';
import { 
  FiPieChart, 
  FiActivity, 
  FiDatabase, 
  FiZap, 
  FiInfo, 
  FiChevronLeft, 
  FiChevronRight,
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiAlertTriangle
} from 'react-icons/fi';

interface ReportContextPanelProps {
  report: Report | null;
}

type PanelTab = 'overview' | 'charts' | 'data' | 'insights';

const formatNumber = (value: number | undefined | null, decimals = 2): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(decimals);
};

const PAGE_SIZE = 10;

export default function ReportContextPanel({ report }: ReportContextPanelProps) {
  const [tab, setTab] = useState<PanelTab>('overview');
  const [page, setPage] = useState(0);
  const [colSearch, setColSearch] = useState('');

  const previewRows = useMemo(
    () => (report?.dataSample || report?.previewRows || []),
    [report]
  );

  const visibleColumns = useMemo(() => {
    const cols = report?.columns || [];
    if (!colSearch.trim()) return cols;
    return cols.filter(c => c.toLowerCase().includes(colSearch.toLowerCase()));
  }, [report?.columns, colSearch]);

  const pageRows = previewRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(previewRows.length / PAGE_SIZE);

  if (!report) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.4 }}>📊</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Awaiting Data Analysis
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            Upload your business reports to unlock deep AI insights, interactive visualizations, and automated trend detection.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
             <span className="glass" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>CSV</span>
             <span className="glass" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-muted)' }}>XLSX</span>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: PanelTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <FiActivity /> },
    { key: 'charts', label: 'Visuals', icon: <FiPieChart /> },
    { key: 'data', label: 'Explorer', icon: <FiDatabase /> },
    { key: 'insights', label: 'AI Insights', icon: <FiZap /> },
  ];

  const columnTypeIcon = (col: string) => {
    const t = report.columnTypes?.[col];
    if (t === 'number') return <span style={{ color: 'var(--accent-primary)', fontSize: 10 }}>#</span>;
    if (t === 'date') return <span style={{ color: 'var(--warning)', fontSize: 10 }}>📅</span>;
    return <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Aa</span>;
  };

  const statusColor = report.status === 'completed' ? 'var(--success)' : report.status === 'failed' ? 'var(--error)' : 'var(--warning)';
  const StatusIcon = report.status === 'completed' ? FiCheckCircle : report.status === 'failed' ? FiAlertCircle : FiActivity;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-secondary)' }}>
      {/* Report Header */}
      <div className="glass" style={{ margin: '16px 16px 0', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-subtle)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${statusColor}15, transparent)`, pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FiFileText style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {report.title}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{report.filename}</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }} />
              <span>{report.fileSizeFormatted || '—'}</span>
            </div>
          </div>
          <div style={{
            padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
            color: statusColor, background: `${statusColor}10`,
            border: `1px solid ${statusColor}20`, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            animation: report.status === 'processing' ? 'pulse 2s infinite' : 'none'
          }}>
            <StatusIcon size={14} className={report.status === 'processing' ? 'animate-spin' : ''} />
            {report.status.toUpperCase()}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
          {[
            { label: 'Total Rows', val: report.rowCount.toLocaleString(), color: 'var(--text-primary)' },
            { label: 'Data Fields', val: report.columnCount, color: 'var(--text-primary)' },
            { label: 'Metrics', val: report.numericStats.length, color: 'var(--accent-primary)' },
            { label: 'Dimensions', val: report.categoricalStats.length, color: 'var(--accent-secondary)' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '10px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', flexShrink: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(0); }}
            className={tab === t.key ? 'animate-pulse-glow' : ''}
            style={{
              flex: 1, padding: '12px 8px', borderRadius: 'var(--radius-md)',
              border: '1px solid transparent',
              background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              boxShadow: tab === t.key ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none',
              transform: tab === t.key ? 'translateY(-2px)' : 'none',
            }}
          >
            <div style={{ fontSize: 18 }}>{t.icon}</div>
            <div style={{ fontSize: 11, letterSpacing: '0.02em' }}>{t.label}</div>
            {tab === t.key && <div style={{ width: 12, height: 2, background: 'var(--accent-primary)', borderRadius: 2, marginTop: 2 }} />}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }} className="custom-scrollbar">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: 16 }} className="animate-fade-in">
            {/* AI Summary Highlight */}
            {report.insights?.summary && (
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-accent)', background: 'linear-gradient(135deg, rgba(0,206,201,0.05) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <FiZap style={{ color: 'var(--accent-primary)' }} />
                  <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Executive AI Summary
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, fontWeight: 400 }}>
                  {report.insights.summary}
                </p>
              </div>
            )}

            {/* Key Metric Explorer */}
            {report.numericStats.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiTrendingUp size={14} /> Metric Performance
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {report.numericStats.slice(0, 5).map(stat => (
                    <div key={stat.column} className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-subtle)', transition: 'transform 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {stat.column}
                        </div>
                        <div style={{ fontSize: 10, padding: '4px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          Numeric
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-primary)' }}>{formatNumber(stat.avg)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>Average</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{formatNumber(stat.median)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>Median</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{formatNumber(stat.max)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>Peak</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 16, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', opacity: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorical Distribution */}
            {report.categoricalStats.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <FiTarget size={14} /> Key Distributions
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {report.categoricalStats.slice(0, 3).map(cs => (
                    <div key={cs.column} className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                        {cs.column}
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>
                          ({cs.uniqueCount} unique categories)
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {cs.topValues.slice(0, 5).map((tv, i) => {
                          const total = report.rowCount;
                          const pct = total > 0 ? (tv.count / total) * 100 : 0;
                          return (
                            <div key={tv.value}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                <span style={{ fontWeight: 500 }}>{tv.value}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{tv.count.toLocaleString()} units ({pct.toFixed(1)}%)</span>
                              </div>
                              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ 
                                  height: '100%', 
                                  width: `${pct}%`, 
                                  background: `linear-gradient(90deg, ${['#00cec9','#1e90ff','#2ed573','#ffa502','#a29bfe'][i % 5]}88, ${['#00cec9','#1e90ff','#2ed573','#ffa502','#a29bfe'][i % 5]})`,
                                  borderRadius: 3,
                                  boxShadow: `0 0 10px ${['#00cec9','#1e90ff','#2ed573','#ffa502','#a29bfe'][i % 5]}44`
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CHARTS ── */}
        {tab === 'charts' && (
          <div className="animate-fade-in">
            {report.status === 'processing' ? (
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <FiActivity size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', marginBottom: 16, display: 'inline-block' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Visualizing Your Data</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>We're building interactive charts based on your report structure...</p>
              </div>
            ) : (
              <ReportCharts report={report} />
            )}
          </div>
        )}

        {/* ── DATA EXPLORER ── */}
        {tab === 'data' && (
          <div style={{ display: 'grid', gap: 16 }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elevated)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <FiSearch style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search metrics & dimensions..."
                value={colSearch}
                onChange={e => setColSearch(e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                {visibleColumns.length} Fields
              </div>
            </div>

            {previewRows.length === 0 ? (
              <div className="glass" style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                 <FiDatabase size={32} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.5 }} />
                 <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data records available for preview.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ padding: '16px 20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Row
                        </th>
                        {visibleColumns.slice(0, 12).map(col => (
                          <th key={col} style={{
                            padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)',
                            fontWeight: 700, whiteSpace: 'nowrap', color: 'var(--text-primary)', fontSize: 11,
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {columnTypeIcon(col)}
                              {col}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, ri) => (
                        <tr key={ri} style={{ 
                          transition: 'background 0.2s ease',
                          background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' 
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                          <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 11, borderBottom: '1px solid var(--border-subtle)' }}>
                            {(page * PAGE_SIZE + ri + 1).toString().padStart(2, '0')}
                          </td>
                          {visibleColumns.slice(0, 12).map(col => {
                            const val = row[col];
                            const isNum = typeof val === 'number';
                            return (
                              <td key={col} style={{
                                padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)',
                                color: isNum ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontWeight: isNum ? 600 : 400,
                                maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {val === null || val === undefined ? <span style={{ color: 'var(--text-muted)', opacity: 0.5, fontStyle: 'italic' }}>NULL</span> : isNum ? formatNumber(val as number) : String(val)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Control */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 8 }}>
                    <button
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
                        border: '1px solid var(--border-subtle)', background: page === 0 ? 'transparent' : 'var(--bg-elevated)',
                        color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1,
                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8
                      }}
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                       <span style={{ color: 'var(--accent-primary)' }}>{page + 1}</span> / {totalPages}
                    </div>
                    <button
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13,
                        border: '1px solid var(--border-subtle)', background: page >= totalPages - 1 ? 'transparent' : 'var(--bg-elevated)',
                        color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1,
                        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8
                      }}
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── AI INTELLIGENCE ── */}
        {tab === 'insights' && (
          <div style={{ display: 'grid', gap: 20 }} className="animate-fade-in">
            {report.status === 'processing' ? (
              <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 60, textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <FiZap size={48} className="animate-float" style={{ color: 'var(--accent-primary)', marginBottom: 20, display: 'inline-block' }} />
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Artificial Intelligence Processing</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                  Our AI is currently performing multi-dimensional analysis on your data points to extract meaningful business insights.
                </p>
              </div>
            ) : !report.insights ? (
              <div className="glass" style={{ padding: 40, textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                 <FiInfo size={32} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.5 }} />
                 <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Intelligent analysis is not available for this data set.</p>
              </div>
            ) : (
              <>
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-accent)', background: 'linear-gradient(135deg, rgba(0,206,201,0.08) 0%, transparent 100%)', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 10, fontWeight: 800, color: 'var(--accent-primary)', background: 'rgba(0,206,201,0.1)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>AI Verified</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <FiActivity style={{ color: 'var(--accent-primary)' }} />
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Core Insight Matrix
                      </div>
                   </div>
                   <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.9, fontWeight: 400 }}>
                      {report.insights.summary}
                   </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                  {[
                    { key: 'keyInsights', label: 'Market Intelligence', icon: <FiTrendingUp />, color: 'var(--accent-primary)', items: report.insights.keyInsights },
                    { key: 'trends', label: 'Pattern Detection', icon: <FiActivity />, color: 'var(--info)', items: report.insights.trends },
                    { key: 'recommendations', label: 'Strategic Actions', icon: <FiTarget />, color: 'var(--success)', items: report.insights.recommendations },
                    { key: 'risks', label: 'Risk Assessment', icon: <FiAlertTriangle />, color: 'var(--error)', items: report.insights.risks },
                  ].filter(s => s.items.length > 0).map(section => (
                    <div key={section.key} className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', transition: 'all 0.3s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ color: section.color, fontSize: 18 }}>{section.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
                          {section.label}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {section.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${section.color}15`, color: section.color, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
