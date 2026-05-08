import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Chat, Report } from '../types';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import DocumentUpload from '../components/DocumentUpload';
import ReportContextPanel from '../components/ReportContextPanel';
import { FiLogOut, FiUser, FiMenu, FiGrid, FiZap, FiDatabase, FiPieChart, FiActivity } from 'react-icons/fi';

type DashboardView = 'dashboard' | 'reports' | 'insights' | 'settings';

interface DashboardProps {
  view?: DashboardView;
}

export default function Dashboard({ view = 'dashboard' }: DashboardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, refreshUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | undefined>(undefined);

  const reportIdParam = searchParams.get('reportId');

  const loadChats = useCallback(async (reportId?: string) => {
    try {
      const data = await api.getChats(reportId);
      setChats(data);
      return data;
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to load chats');
      }
      return [];
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const data = await api.getReports();
      setReports(data);
      return data;
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error('Failed to load reports');
      }
      return [];
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const init = async () => {
      setLoading(true);
      await refreshUser();
      const reportData = await loadReports();

      let selectedReport: Report | null = null;

      if (reportIdParam) {
        selectedReport = reportData.find(report => report._id === reportIdParam) || null;
        if (!selectedReport) {
          try {
            selectedReport = await api.getReport(reportIdParam);
            setReports(prev => {
              const exists = prev.some(report => report._id === selectedReport?._id);
              return selectedReport && !exists ? [selectedReport, ...prev] : prev;
            });
          } catch {
            selectedReport = null;
          }
        }
      }

      if (!selectedReport && reportData.length > 0) {
        selectedReport = reportData[0];
      }

      if (selectedReport) {
        try {
          const reportDetail = await api.getReport(selectedReport._id);
          setActiveReport(reportDetail);
        } catch {
          setActiveReport(selectedReport);
        }

        const chatData = await loadChats(selectedReport._id);
        if (chatData.length > 0) {
          try {
            const fullChat = await api.getChat(chatData[0]._id);
            setActiveChat(fullChat);
          } catch {
            setActiveChat(chatData[0]);
          }
        } else {
          setActiveChat(null);
        }
      } else {
        setActiveReport(null);
        setActiveChat(null);
      }

      setLoading(false);
    };

    init();
  }, [user?.id, reportIdParam, loadChats, loadReports, refreshUser]);

  useEffect(() => {
    const processingReports = reports.filter(r => r.status === 'processing');
    if (processingReports.length === 0) return;

    const intervalId = setInterval(async () => {
      try {
        const updatedReports = await api.getReports();
        setReports(updatedReports);

        if (activeReport) {
          const refreshed = updatedReports.find(r => r._id === activeReport._id);
          if (refreshed && refreshed.status !== activeReport.status) {
            const fullReport = await api.getReport(refreshed._id);
            setActiveReport(fullReport);
          }
        }
      } catch (error) {
        console.error('Failed to poll reports');
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [reports, activeReport]);

  const handleSelectChat = async (chat: Chat) => {
    setSidebarOpen(false);
    try {
      const fullChat = await api.getChat(chat._id);
      setActiveChat(fullChat);
    } catch {
      setActiveChat(chat);
    }
  };

  const handleSelectReport = async (report: Report) => {
    setSidebarOpen(false);
    try {
      const fullReport = await api.getReport(report._id);
      setActiveReport(fullReport);
    } catch {
      setActiveReport(report);
    }

    const chatData = await loadChats(report._id);
    if (chatData.length > 0) {
      try {
        const fullChat = await api.getChat(chatData[0]._id);
        setActiveChat(fullChat);
      } catch {
        setActiveChat(chatData[0]);
      }
    } else {
      setActiveChat(null);
    }
  };

  const handleNewChat = async () => {
    try {
      if (!activeReport) {
        toast.error('Select a report before starting a chat');
        return;
      }
      const newChat = await api.createChat(activeReport._id);
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setSidebarOpen(false);
    } catch (error: any) {
      toast.error('Failed to create chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await api.deleteChat(chatId);
      const updated = chats.filter(c => c._id !== chatId);
      setChats(updated);
      if (activeChat?._id === chatId) {
        if (updated.length > 0) {
          handleSelectChat(updated[0]);
        } else {
          setActiveChat(null);
        }
      }
      toast.success('Chat deleted');
    } catch (error: any) {
      toast.error('Failed to delete chat');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await api.deleteReport(reportId);
      const updatedReports = reports.filter(r => r._id !== reportId);
      setReports(updatedReports);
      if (activeReport?._id === reportId) {
        const nextReport = updatedReports[0] || null;
        setActiveReport(nextReport);
        if (nextReport) {
          const chatData = await loadChats(nextReport._id);
          if (chatData.length > 0) {
            try {
              const fullChat = await api.getChat(chatData[0]._id);
              setActiveChat(fullChat);
            } catch {
              setActiveChat(chatData[0]);
            }
          } else {
            setActiveChat(null);
          }
        } else {
          setActiveChat(null);
        }
      }
      await refreshUser();
      toast.success('Report deleted');
    } catch (error: any) {
      toast.error('Failed to delete report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpgrade = async () => {
    try {
      const loadingToast = toast.loading('Upgrading your plan...');
      await api.upgradeToPro();
      await refreshUser();
      toast.dismiss(loadingToast);
      toast.success('Welcome to Pro! You now have unlimited uploads.');
    } catch (error) {
      toast.error('Failed to upgrade. Please try again.');
    }
  };

  const openReportInChat = (reportId: string) => {
    navigate(`/dashboard?reportId=${reportId}`);
  };

  const handleFixData = async (message: string) => {
    if (!activeChat) {
      const newChat = await api.createChat(activeReport!._id);
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
    }
    setPendingMessage(message);
    // Clear pending message after a tick to allow re-triggering
    setTimeout(() => setPendingMessage(undefined), 100);
    toast.success('AI cleaning assistant activated');
  };

  const renderReportsView = () => (
    <div className="animate-fade-in p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
        <div className="flex-1 text-left">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Data Repository</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">Manage and analyze your business intelligence documents.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00cec9] to-[#0984e3] text-white font-bold text-sm shadow-lg shadow-[#00cec9]/10 hover:shadow-[#00cec9]/20 transition-all transform hover:-translate-y-1 active:scale-95 whitespace-nowrap self-start md:self-center"
        >
          Upload New Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="glass p-20 rounded-3xl text-center border-dashed border-2 border-white/5">
          <div className="text-6xl mb-6">📂</div>
          <h3 className="text-xl font-bold mb-3">No reports yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">Your data vault is empty. Upload a CSV or XLSX file to begin your journey into AI-powered insights.</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold"
          >
            Upload First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map(report => (
            <div key={report._id} className="glass group p-6 rounded-2xl hover:border-[#00cec9]/30 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:bg-[#00cec9]/10 transition-colors">
                  {report.mimeType?.includes('sheet') ? '📊' : '📄'}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  report.status === 'completed' ? 'bg-[#2ed573]/10 text-[#2ed573]' : 
                  report.status === 'failed' ? 'bg-[#ff6b6b]/10 text-[#ff6b6b]' : 
                  'bg-[#ffa502]/10 text-[#ffa502] animate-pulse'
                }`}>
                  {report.status}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1 truncate text-white">{report.title}</h3>
              <p className="text-gray-500 text-xs mb-6 truncate">{report.filename}</p>
              
              <div className="flex gap-4 text-[11px] font-medium text-gray-400 mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-1.5"><span className="text-white">{report.rowCount}</span> rows</div>
                <div className="flex items-center gap-1.5"><span className="text-white">{report.columnCount}</span> fields</div>
                <div className="flex items-center gap-1.5"><span className="text-white">{(report.fileSize / 1024).toFixed(1)}</span> KB</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openReportInChat(report._id)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  Analysis
                </button>
                <button
                  onClick={() => handleSelectReport(report)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="p-2.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsightsView = () => (
    <div className="animate-fade-in p-6 md:p-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
          <div className="flex-1 text-left">
             <h2 className="text-3xl font-black tracking-tight text-white mb-2">Executive Insights</h2>
             <p className="text-gray-400 text-sm font-medium leading-relaxed">Automated intelligence summaries across your entire report catalog.</p>
          </div>
       </div>

       {reports.length === 0 ? (
         <div className="glass p-20 rounded-3xl text-center">
           <div className="text-6xl mb-6">✨</div>
           <p className="text-gray-500">Insights will appear once you upload and process your reports.</p>
         </div>
       ) : (
         <div className="space-y-6 max-w-5xl">
           {reports.map(report => (
             <div key={report._id} className="glass p-8 rounded-2xl">
               <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00cec9] to-[#0984e3] flex items-center justify-center text-lg shadow-lg">✨</div>
                    <div>
                      <h3 className="font-bold text-white">{report.title}</h3>
                      <p className="text-xs text-gray-500">{report.filename}</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => openReportInChat(report._id)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"
                 >
                   Deep Dive
                 </button>
               </div>

               {report.status !== 'completed' ? (
                 <div className="flex items-center gap-3 text-gray-500 text-sm py-4 italic">
                    <div className="animate-spin text-[#ffa502]">⚙️</div>
                    AI is currently auditing your data...
                 </div>
               ) : report.insights ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="prose-dark">
                       <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#00cec9] mb-4">Executive Summary</h4>
                       <p className="text-sm leading-relaxed text-gray-300">{report.insights.summary}</p>
                    </div>
                    <div className="space-y-6">
                       <div>
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 mb-4">Top Intelligence</h4>
                          <div className="space-y-2">
                             {report.insights.keyInsights.slice(0, 3).map((ki, i) => (
                               <div key={i} className="flex gap-3 items-start text-xs bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                  <span className="text-[#00cec9] font-bold">0{i+1}.</span>
                                  <span className="text-gray-400">{ki}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <p className="text-gray-500 text-sm">Intelligence engine awaiting data sync.</p>
               )}
             </div>
           ))}
         </div>
       )}
    </div>
  );

  const renderSettingsView = () => (
    <div className="animate-fade-in p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
        <div className="flex-1 text-left">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Account Settings</h2>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">Manage your professional profile and intelligence plan.</p>
        </div>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <div className="glass p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-[#00cec9]/10 flex items-center justify-center text-xl">👤</div>
             <h3 className="text-lg font-bold">Profile Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
             <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Display Name</label>
                <div className="text-sm font-medium text-white p-3 rounded-lg bg-white/5 border border-white/5">{user?.username}</div>
             </div>
             <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email Address</label>
                <div className="text-sm font-medium text-white p-3 rounded-lg bg-white/5 border border-white/5">{user?.email}</div>
             </div>
             <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Business Organization</label>
                <div className="text-sm font-medium text-white p-3 rounded-lg bg-white/5 border border-white/5">{user?.businessName || 'Not configured'}</div>
             </div>
             <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Target Industry</label>
                <div className="text-sm font-medium text-white p-3 rounded-lg bg-white/5 border border-white/5">{user?.industry || 'Not configured'}</div>
             </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00cec9]/10 blur-3xl -z-10" />
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-[#6c5ce7]/10 flex items-center justify-center text-xl">💎</div>
             <h3 className="text-lg font-bold">Plan & Intelligence Quotas</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-2xl font-black uppercase tracking-tighter text-white">{user?.plan}</span>
                   {user?.plan === 'free' && <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold">DEFAULT</span>}
                </div>
                <p className="text-sm text-gray-400 mb-4">You are currently using {user?.currentDocumentCount} of your {user?.documentLimit} analysis credits.</p>
                <div className="w-full md:w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-gradient-to-r from-[#00cec9] to-[#0984e3]" 
                    style={{ width: `${Math.min(100, (user?.currentDocumentCount || 0) / (user?.documentLimit || 1) * 100)}%` }}
                   />
                </div>
             </div>
             {user?.plan === 'free' && (
               <button 
                onClick={handleUpgrade}
                className="px-8 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-[#00cec9] hover:text-white transition-all transform hover:scale-105"
               >
                 Go Unlimited with Pro
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 h-full overflow-hidden">
      <div className="lg:w-[45%] h-full border-r border-white/5">
        <ReportContextPanel report={activeReport} onFixData={handleFixData} />
      </div>
      <div className="flex-1 h-full min-w-0 flex flex-col">
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            report={activeReport}
            autoMessage={pendingMessage}
            onChatUpdate={(updatedChat) => {
              setActiveChat(updatedChat);
              setChats(prev => prev.map(c => c._id === updatedChat._id
                ? { ...c, title: updatedChat.title, updatedAt: updatedChat.updatedAt }
                : c
              ));
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="max-w-md text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-[#00cec9]/5 flex items-center justify-center text-5xl mx-auto mb-8 animate-float">💬</div>
              <h2 className="text-2xl font-bold mb-4 text-white">Conversational Analysis</h2>
              <p className="text-gray-500 mb-10 leading-relaxed">
                {activeReport
                  ? `Your report "${activeReport.title}" is ready. Ask specific questions about trends, outliers, or future projections.`
                  : 'Welcome to your AI intelligence hub. Select an existing report or upload a new one to begin your deep-dive analysis.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleNewChat}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00cec9] to-[#0984e3] text-white font-bold text-sm shadow-xl hover:shadow-[#00cec9]/20 transition-all transform hover:-translate-y-1"
                >
                  Start New Chat
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-all"
                >
                  Quick Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a1a] font-sans selection:bg-[#00cec9]/30 selection:text-white">
      <Sidebar
        chats={chats}
        reports={reports}
        activeChat={activeChat}
        activeReportId={activeReport?._id}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        onUpload={() => setShowUploadModal(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Navbar */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-black/10 backdrop-blur-md z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl text-gray-400 hover:text-white transition-colors"
            >
              <FiMenu />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00cec9] to-[#0984e3] flex items-center justify-center text-white font-black text-sm shadow-lg">
                 <FiActivity />
              </div>
              <span className="font-bold tracking-tight text-white flex items-center gap-2">
                NexusAI <span className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] text-gray-400 font-bold tracking-normal">v1.2</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Global Search Placeholder or Plan Status */}
            <div className="hidden lg-flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-full px-4 py-1.5">
               <div className="w-2 h-2 rounded-full bg-[#2ed573] shadow-[0_0_8px_#2ed573]" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Sync Active</span>
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-white/10 h-10">
              <div className="flex flex-col items-end hidden sm:flex justify-center h-full">
                 <span className="text-[13px] font-bold text-white leading-none mb-1">{user?.username}</span>
                 <span className="text-[9px] text-[var(--accent-primary)] font-black uppercase tracking-[0.15em] leading-none">{user?.plan} Membership</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent-primary)] font-bold shadow-inner">
                 <FiUser />
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all ml-1 group"
                title="Sign Out"
              >
                <FiLogOut className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0a0a1a] z-50">
              <div className="w-16 h-16 relative">
                 <div className="absolute inset-0 border-4 border-[#00cec9]/10 rounded-full" />
                 <div className="absolute inset-0 border-4 border-t-[#00cec9] rounded-full animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                 <p className="text-sm font-bold tracking-widest uppercase text-white">Calibrating Workspace</p>
                 <p className="text-[10px] text-gray-500 font-medium">Synchronizing with intelligence cloud...</p>
              </div>
            </div>
          ) : (
            <>
              {view === 'reports' ? renderReportsView() :
               view === 'insights' ? renderInsightsView() :
               view === 'settings' ? renderSettingsView() :
               renderDashboardView()}
            </>
          )}
        </main>
      </div>

      {showUploadModal && (
        <DocumentUpload
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={async (report) => {
            setReports(prev => [report, ...prev]);
            setActiveReport(report);
            setChats([]);
            setActiveChat(null);
            await refreshUser();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}
