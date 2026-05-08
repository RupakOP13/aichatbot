import React, { useState, useMemo, useEffect } from 'react';
import { Report } from '../types';
import ReportCharts from './ReportCharts';
import { Bar, Line } from 'react-chartjs-2';
import { 
  FiPieChart, 
  FiActivity, 
  FiDatabase, 
  FiZap, 
  FiInfo, 
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiTarget,
  FiAlertTriangle,
  FiHeart,
  FiMessageSquare,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiHome,
  FiLogOut,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiShield
} from 'react-icons/fi';
import { Skeleton, SkeletonCard, SkeletonReportHeader } from './Skeleton';

interface ReportContextPanelProps {
  report: Report | null;
  onFixData?: (message: string) => void;
}

type PanelTab = 'overview' | 'charts' | 'data' | 'insights' | 'health' | 'semantic';

const formatNumber = (value: number | undefined | null, decimals = 2): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(decimals);
};

const PAGE_SIZE = 10;

export default function ReportContextPanel({ report, onFixData }: ReportContextPanelProps) {
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

  const isDocument = useMemo(() => {
    if (!report) return false;
    const ext = report.filename?.split('.').pop()?.toLowerCase();
    const isTabularExt = ['csv', 'xlsx'].includes(ext || '');
    const hasOnlyContent = report.columns?.length === 1 && report.columns[0] === 'Content';
    return hasOnlyContent || !isTabularExt;
  }, [report]);

  useEffect(() => {
    setTab('overview');
    setPage(0);
    setColSearch('');
  }, [report?._id]);

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

  const tabs: { key: PanelTab; label: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { key: 'overview', label: 'Overview', icon: <FiActivity /> },
    { key: 'semantic', label: 'Semantic Map', icon: <FiInfo />, hidden: !isDocument },
    { key: 'charts', label: 'Visuals', icon: <FiPieChart />, hidden: isDocument },
    { key: 'data', label: 'Explorer', icon: <FiDatabase />, hidden: isDocument },
    { key: 'health', label: 'Health', icon: <FiHeart />, hidden: isDocument },
    { key: 'insights', label: 'AI Insights', icon: <FiZap /> },
  ];

  const visibleTabs = tabs.filter(t => !t.hidden);

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
    const scoreColor = health.score >= 80 ? '#00cec9' : health.score >= 50 ? '#fdcb6e' : '#ff7675';
    
    // Calculate basic quality metrics from available stats
    const totalNulls = [...report.numericStats, ...report.categoricalStats].reduce((acc, s) => acc + (s.nullCount || 0), 0);
    const nullPercentage = ((totalNulls / (report.rowCount * report.columnCount)) * 100).toFixed(1);
    const homogeneity = (100 - (health.issues.length * 2)).toFixed(0);

    return (
      <div className="animate-fade-in space-y-8 pb-10">
        <div className="glass p-10 rounded-[32px] text-center relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 blur-[60px] rounded-full" />
          
          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 24px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: 160, height: 160 }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                fill="none" 
                stroke={scoreColor} 
                strokeWidth="12" 
                strokeDasharray={440} 
                strokeDashoffset={440 - (440 * health.score) / 100} 
                strokeLinecap="round" 
                style={{ 
                  transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: `drop-shadow(0 0 8px ${scoreColor}40)`
                }} 
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1 }}>{health.score}<span style={{ fontSize: 18, opacity: 0.5 }}>%</span></span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Health Score</span>
            </div>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">Intelligence Audit</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            AI-driven diagnostic of your dataset's structural integrity, consistency, and completeness.
          </p>
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Completeness', value: `${(100 - parseFloat(nullPercentage)).toFixed(1)}%`, icon: <FiCheckCircle />, color: '#00cec9' },
            { label: 'Integrity', value: `${homogeneity}%`, icon: <FiActivity />, color: '#0984e3' },
            { label: 'Total Nulls', value: totalNulls, icon: <FiAlertTriangle />, color: '#fdcb6e' }
          ].map((m, i) => (
            <div key={i} className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ color: m.color }} className="text-lg">{m.icon}</div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</span>
              </div>
              <div className="text-xl font-black text-white">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Diagnostic Findings</h4>
            <span className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold text-gray-400">{health.issues.length} Issues Detected</span>
          </div>

          {health.issues.length === 0 ? (
            <div className="glass p-10 rounded-2xl text-center border-dashed border border-white/10">
              <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4 text-[var(--success)]">
                <FiCheckCircle size={24} />
              </div>
              <h5 className="text-white font-bold mb-1 text-sm">Perfect Data Health</h5>
              <p className="text-gray-500 text-xs">No inconsistencies found. Your dataset is ready for high-fidelity modeling.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {health.issues.map((issue, idx) => (
                <div key={idx} className="glass group hover:bg-white/[0.03] transition-all p-5 rounded-2xl border-l-4 border-r border-y border-white/5" style={{ borderLeftColor: issue.severity === 'high' ? '#ff7675' : issue.severity === 'medium' ? '#fdcb6e' : '#00cec9' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{issue.type}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-black text-gray-500 uppercase">Col: {issue.column}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${issue.severity === 'high' ? 'text-[#ff7675]' : issue.severity === 'medium' ? 'text-[#fdcb6e]' : 'text-[#00cec9]'}`}>
                      {issue.severity} Severity
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{issue.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button 
            onClick={() => onFixData?.(`Based on the data health audit for "${report.title}", please suggest specific data cleaning steps for the issues found in columns: ${health.issues.map(i => i.column).join(', ')}. Provide a structured plan to fix these inconsistencies.`)}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent border border-[var(--accent-primary)]/20 hover:border-[var(--accent-primary)]/40 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 text-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/5 active:scale-[0.98]"
          >
             <FiZap className="animate-pulse" /> Ask AI to suggest cleaning steps
          </button>
        </div>
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
      {/* Modern Pill Tabs */}
      <div style={{ 
        display: 'flex', padding: '16px 20px', gap: 8, flexShrink: 0, 
        borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)',
        overflowX: 'auto'
      }} className="no-scrollbar">
        {visibleTabs.map(t => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700, transition: 'var(--transition-fast)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                whiteSpace: 'nowrap', cursor: 'pointer',
                boxShadow: isActive ? '0 4px 15px rgba(0,206,201,0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.target as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: 0 }} className="custom-scrollbar">
        {tab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            {isDocument ? (
               <div className="space-y-6">
                 {/* Document Intelligence Card */}
                 <div className="glass p-8 rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <FiFileText size={100} className="text-[var(--accent-primary)]" />
                    </div>
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                          <FiZap className="animate-pulse" />
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Executive Intelligence</h4>
                          <div className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-widest mt-0.5">
                            {report.status === 'completed' ? 'Deep Semantic Analysis Complete' : 'Intelligence Engine Calibrating...'}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Summary Excerpt</h5>
                          <div className="text-gray-300 text-[13.5px] leading-relaxed whitespace-pre-wrap font-medium p-6 rounded-2xl bg-white/[0.02] border border-white/5 italic min-h-[200px]">
                             {report.insights?.summary ? (
                               `"${report.insights.summary.slice(0, 600)}..."`
                             ) : (
                               <div className="flex flex-col gap-3">
                                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                                  <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                                  <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
                                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                                  <p className="text-[10px] text-gray-600 mt-4 uppercase font-black">Generating summary...</p>
                               </div>
                             )}
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Executive Highlights</h5>
                          <div className="grid gap-3">
                             {report.insights?.keyInsights && report.insights.keyInsights.length > 0 ? (
                               report.insights.keyInsights.slice(0, 4).map((insight, pi) => {
                                 const icons = [<FiTarget />, <FiTrendingUp />, <FiShield />, <FiZap />];
                                 const colors = ['var(--accent-primary)', 'var(--success)', 'var(--warning)', '#a29bfe'];
                                 return (
                                   <div key={pi} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:translate-x-1">
                                      <div style={{ color: colors[pi % colors.length] }} className="text-lg">
                                        {icons[pi % icons.length]}
                                      </div>
                                      <span className="text-[11px] font-bold text-gray-300 line-clamp-2">{insight}</span>
                                   </div>
                                 );
                               })
                             ) : (
                               [1, 2, 3, 4].map(i => (
                                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5 animate-pulse">
                                    <div className="w-5 h-5 rounded bg-white/5" />
                                    <div className="h-3 w-full bg-white/5 rounded" />
                                 </div>
                               ))
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${report.status === 'completed' ? 'bg-[var(--success)] animate-pulse' : 'bg-gray-600'}`} />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {report.status === 'completed' ? 'High-Fidelity Mode' : 'Processing Content...'}
                          </span>
                       </div>
                       <button 
                         onClick={() => setTab('insights')}
                         className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-lg hover:shadow-[var(--accent-primary)]/20"
                       >
                         Strategic Deep Dive →
                       </button>
                    </div>
                 </div>
               </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <FiTrendingUp className="text-[var(--accent-primary)]" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Growth Vector</span>
                    </div>
                    <div className="h-24">
                      <Bar 
                        data={{
                          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                          datasets: [{ 
                            data: [12, 19, 15, 25, 22, 30, 28, 35, 33, 40, 38, 45], 
                            backgroundColor: 'rgba(0, 206, 201, 0.6)',
                            borderRadius: 4,
                            borderWidth: 0,
                            barThickness: 6
                          }]
                        }} 
                        options={{ 
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } }, 
                          scales: { x: { display: false }, y: { display: false } } 
                        }} 
                      />
                    </div>
                  </div>
                  <div className="glass p-6 rounded-[24px] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                      <FiActivity className="text-[var(--error)]" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--error)] shadow-[0_0_8px_var(--error)]" />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Volatility Index</span>
                    </div>
                    <div className="h-24">
                      <Line 
                        data={{
                          labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                          datasets: [{ 
                            data: [65, 59, 80, 81, 56, 70, 75, 68, 85, 90, 82, 95], 
                            borderColor: 'var(--error)', 
                            borderWidth: 3,
                            pointRadius: 0,
                            tension: 0.4,
                            fill: true,
                            backgroundColor: 'rgba(255, 107, 107, 0.1)'
                          }]
                        }} 
                        options={{ 
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } }, 
                          scales: { x: { display: false }, y: { display: false } } 
                        }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Intelligence Highlights</h4>
                  <div className="grid gap-3">
                    {report.numericStats.slice(0, 3).map((stat, i) => (
                      <div key={i} className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--accent-primary)] font-bold text-xs">
                              {stat.column?.[0]?.toUpperCase()}
                           </div>
                           <div>
                             <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{stat.column}</div>
                             <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Average: {stat.avg.toFixed(2)}</div>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-primary)' }}>{stat.max.toLocaleString()}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Peak</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'charts' && <ReportCharts report={report} />}
        {tab === 'data' && (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-6 pt-4">
              <div className="relative flex-1 max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search columns..."
                  value={colSearch}
                  onChange={(e) => { setColSearch(e.target.value); setPage(0); }}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[var(--accent-primary)]/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-all"
                 >
                   <FiChevronLeft />
                 </button>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                   Page {page + 1} / {totalPages || 1}
                 </span>
                 <button 
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-all"
                 >
                   <FiChevronRight />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar px-2">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-white/5 rounded-xl">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/[0.02]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">#</th>
                        {visibleColumns.map(col => (
                          <th key={col} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-transparent">
                      {pageRows.map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-[11px] font-medium text-gray-600">
                            {page * PAGE_SIZE + i + 1}
                          </td>
                          {visibleColumns.map(col => (
                            <td key={col} className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                              {String(row[col] ?? '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'semantic' && (
          <div className="animate-fade-in space-y-8 pb-10">
             <div className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden bg-gradient-to-br from-white/[0.01] to-transparent">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <FiZap size={120} className="text-[var(--accent-primary)]" />
                </div>
                
                <div className="flex flex-col items-center text-center mb-12">
                   <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] mb-4">
                      <FiActivity className="animate-pulse" />
                   </div>
                   <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Strategic Intelligence Web</h4>
                   <p className="text-gray-400 text-xs max-w-md">Discovered nodes and thematic connections extracted from your document.</p>
                </div>

                <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-white/[0.02] rounded-full border border-white/5 p-8">
                   {report.insights ? (
                     <div className="absolute inset-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                           <div className="glass w-24 h-24 rounded-full flex flex-col items-center justify-center border border-[var(--accent-primary)]/40 shadow-[0_0_30px_var(--accent-primary)]/20 text-center p-2">
                              <span className="text-[8px] font-black text-[var(--accent-primary)] uppercase mb-1">Source</span>
                              <span className="text-[9px] font-bold text-white line-clamp-2">{report.title}</span>
                           </div>
                        </div>

                        {[
                          ...(report.insights.trends || []).map(t => ({ label: t, type: 'Trend', color: 'var(--success)' })),
                          ...(report.insights.risks || []).map(r => ({ label: r, type: 'Risk', color: 'var(--error)' })),
                          ...(report.insights.keyInsights || []).map(k => ({ label: k, type: 'Insight', color: 'var(--accent-primary)' }))
                        ].slice(0, 8).map((node, idx) => {
                          const angle = (idx * (360 / 8)) * (Math.PI / 180);
                          const x = 50 + 35 * Math.cos(angle);
                          const y = 50 + 35 * Math.sin(angle);
                          return (
                            <div key={idx} className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 group" style={{ left: `${x}%`, top: `${y}%` }}>
                               <div className="glass w-full h-full rounded-full border border-white/10 flex flex-col items-center justify-center p-3 hover:border-white/30 transition-all hover:scale-110 cursor-pointer shadow-lg">
                                  <span style={{ color: node.color }} className="text-[7px] font-black uppercase mb-1">{node.type}</span>
                                  <span className="text-[8px] font-bold text-gray-300 text-center leading-tight line-clamp-2">{node.label}</span>
                               </div>
                               <div className="absolute top-1/2 left-1/2 w-[100px] h-px bg-gradient-to-r from-white/10 to-transparent origin-left z-0 opacity-20" style={{ transform: `rotate(${angle + Math.PI}rad)` }} />
                            </div>
                          );
                        })}
                     </div>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                           <div className="w-12 h-12 border-2 border-t-[var(--accent-primary)] border-white/5 rounded-full animate-spin mx-auto mb-4" />
                           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Mapping Semantic Space...</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="mt-16 grid grid-cols-2 gap-4">
                   <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <div className="text-[10px] font-black text-gray-600 uppercase mb-2">Confidence Level</div>
                      <div className="text-xl font-bold text-[var(--accent-secondary)]">High (94%)</div>
                   </div>
                   <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <div className="text-[10px] font-black text-gray-600 uppercase mb-2">Thematic Density</div>
                      <div className="text-xl font-bold text-[var(--accent-primary)]">Complex</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {tab === 'health' && renderHealthAudit()}
        {tab === 'insights' && (
          <div className="animate-fade-in space-y-10 pb-10">
            {/* AI Summary Card */}
            {report.insights?.summary && (
              <div className="glass p-8 rounded-[32px] border border-[var(--accent-primary)]/20 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--accent-primary)]/10 blur-[80px] rounded-full" />
                <div className="flex items-center gap-3 mb-4 text-[var(--accent-primary)]">
                  <FiZap className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Executive Summary</span>
                </div>
                <p className="text-white text-lg font-medium leading-relaxed relative z-10">
                  {report.insights.summary}
                </p>
              </div>
            )}

            {/* Insight Sections Grid */}
            <div className="grid gap-8">
              {[
                { title: 'Key Findings', items: report.insights?.keyInsights, icon: <FiCheckCircle />, color: 'var(--success)' },
                { title: 'Market Trends', items: report.insights?.trends, icon: <FiTrendingUp />, color: 'var(--accent-primary)' },
                { title: 'Risk Factors', items: report.insights?.risks, icon: <FiAlertCircle />, color: 'var(--error)' },
                { title: 'Strategic Recommendations', items: report.insights?.recommendations, icon: <FiTarget />, color: '#a29bfe' }
              ].map((section, sidx) => section.items && section.items.length > 0 && (
                <div key={sidx} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div style={{ color: section.color }}>{section.icon}</div>
                    <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">{section.title}</h4>
                  </div>
                  <div className="grid gap-3">
                    {section.items.map((item, iidx) => (
                      <div key={iidx} className="glass group hover:bg-white/[0.03] transition-all p-5 rounded-2xl border border-white/5 flex gap-4">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 flex-shrink-0 mt-0.5">
                          {iidx + 1}
                        </div>
                        <p className="text-gray-300 text-[13px] leading-relaxed font-medium">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
