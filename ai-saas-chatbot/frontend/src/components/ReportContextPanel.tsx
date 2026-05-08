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
  FiAlertTriangle,
  FiHeart
} from 'react-icons/fi';
import { Skeleton, SkeletonCard, SkeletonReportHeader } from './Skeleton';

interface ReportContextPanelProps {
  report: Report | null;
}

type PanelTab = 'overview' | 'charts' | 'data' | 'insights' | 'health';

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
    { key: 'health', label: 'Health', icon: <FiHeart /> },
    { key: 'insights', label: 'AI Insights', icon: <FiZap /> },
  ];

  const statusColor = report.status === 'completed' ? 'var(--success)' : report.status === 'failed' ? 'var(--error)' : 'var(--warning)';
  const StatusIcon = report.status === 'completed' ? FiCheckCircle : report.status === 'failed' ? FiAlertCircle : FiActivity;

  if (report.status === 'processing') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', padding: 16 }}>
        <SkeletonReportHeader />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} width={80} height={32} borderRadius={99} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const renderHealthAudit = () => {
    const health = report.insights?.dataHealth || { score: 0, issues: [] };
    const scoreColor = health.score >= 80 ? 'var(--success)' : health.score >= 50 ? 'var(--warning)' : 'var(--error)';

    return (
      <div className="animate-fade-in space-y-6">
        <div className="glass p-8 rounded-[24px] text-center bg-gradient-to-br from-white/[0.02] to-transparent">
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 20px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="8" strokeDasharray={339} strokeDashoffset={339 - (339 * health.score) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{health.score}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Health Score</span>
            </div>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Data Quality Audit</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Our AI has audited your dataset for inconsistencies, missing values, and potential outliers.
          </p>
        </div>

        <div className="space-y-4">
          <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Detected Issues</h4>
          {health.issues.length === 0 ? (
            <div className="glass p-6 rounded-xl text-center">
              <FiCheckCircle style={{ color: 'var(--success)', fontSize: 24, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No quality issues detected. Your data is clean!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {health.issues.map((issue, idx) => (
                <div key={idx} className="glass p-4 rounded-xl border-l-4" style={{ borderColor: issue.severity === 'high' ? 'var(--error)' : issue.severity === 'medium' ? 'var(--warning)' : 'var(--info)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{issue.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: issue.severity === 'high' ? 'var(--error)' : issue.severity === 'medium' ? 'var(--warning)' : 'var(--info)' }}>{issue.severity}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Column: <strong style={{ color: 'var(--text-primary)' }}>{issue.column}</strong> • {issue.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm flex items-center justify-center gap-2">
           ✨ Ask AI to suggest cleaning steps
        </button>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg-secondary)' }}>
      {/* Report Header */}
      <div className="glass" style={{ margin: '16px 16px 0', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border-subtle)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${statusColor}15, transparent)`, pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <StatusIcon style={{ color: statusColor, fontSize: 16 }} />
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {report.title}
              </h1>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiFileText /> {report.filename} • {(report.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="glass" style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}10`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {report.status}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Total Rows', value: report.rowCount },
            { label: 'Data Fields', value: report.columnCount },
            { label: 'Metrics', value: report.numericStats.length },
            { label: 'Dimensions', value: report.categoricalStats.length },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03]" style={{ padding: '12px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '16px 16px 8px', gap: 4, flexShrink: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 4px', borderRadius: 'var(--radius-md)',
              background: tab === t.key ? 'rgba(255,255,255,0.05)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'var(--transition-fast)',
              color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            <div style={{ fontSize: 18 }}>{t.icon}</div>
            <div style={{ fontSize: 11 }}>{t.label}</div>
            {tab === t.key && <div style={{ width: 12, height: 2, background: 'var(--accent-primary)', borderRadius: 2, marginTop: 2 }} />}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }} className="custom-scrollbar">
        {tab === 'overview' && (
          <div className="animate-fade-in space-y-6">
             <div className="glass p-6 rounded-xl">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Metric Highlights</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {report.numericStats.slice(0, 4).map(ns => (
                   <div key={ns.column} className="bg-white/5 p-4 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">{ns.column} (Avg)</div>
                      <div className="text-xl font-bold">{formatNumber(ns.avg)}</div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
        {tab === 'charts' && <ReportCharts report={report} />}
        {tab === 'data' && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-2 mb-4 bg-white/5 p-2 rounded-lg">
               <FiSearch className="text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search columns..." 
                 className="bg-transparent border-none outline-none text-sm w-full"
                 value={colSearch}
                 onChange={e => setColSearch(e.target.value)}
               />
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-xs">
                 <thead>
                   <tr className="text-gray-500 text-left border-b border-white/10">
                     {visibleColumns.map(c => <th key={c} className="p-2">{c}</th>)}
                   </tr>
                 </thead>
                 <tbody>
                    {pageRows.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                         {visibleColumns.map(c => <td key={c} className="p-2 whitespace-nowrap">{String(row[c] ?? '')}</td>)}
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
        {tab === 'health' && renderHealthAudit()}
        {tab === 'insights' && (
          <div className="animate-fade-in space-y-4">
             {report.insights?.keyInsights.map((insight, i) => (
               <div key={i} className="glass p-4 rounded-xl flex gap-3">
                 <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold">{i+1}</div>
                 <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
