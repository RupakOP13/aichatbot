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
    if (!user?.id) return; // FIX: Use user.id instead of user object to prevent infinite loops!

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

  // Poll for report status updates
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

  const renderReportsView = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>My Reports</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Manage uploaded reports and open them for analysis.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '10px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)', border: 'none',
            color: 'white', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'var(--transition-base)',
            boxShadow: '0 4px 20px rgba(0,206,201,0.3)'
          }}
        >
          Upload Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="glass" style={{
          padding: 32, borderRadius: 'var(--radius-lg)', textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p style={{ color: 'var(--text-muted)' }}>No reports yet. Upload your first CSV/XLSX report.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {reports.map(report => (
            <div key={report._id} className="glass" style={{
              padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {report.filename}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  color: report.status === 'completed' ? 'var(--success)' : report.status === 'failed' ? 'var(--error)' : 'var(--warning)',
                  background: 'rgba(255,255,255,0.06)', textTransform: 'capitalize'
                }}>
                  {report.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>Rows: {report.rowCount}</span>
                <span>Cols: {report.columnCount}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => openReportInChat(report._id)}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    border: 'none', background: 'var(--accent-gradient)', color: 'white',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Open Chat
                </button>
                <button
                  onClick={() => handleSelectReport(report)}
                  style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'transparent',
                    color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  style={{
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)',
                    color: '#ff6b6b', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsightsView = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Insights Center</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Auto-generated insights and trends across your reports.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="glass" style={{ padding: 32, borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <p style={{ color: 'var(--text-muted)' }}>Upload a report to generate insights.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {reports.map(report => (
            <div key={report._id} className="glass" style={{ padding: 18, borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{report.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{report.filename}</div>
                </div>
                <button
                  onClick={() => openReportInChat(report._id)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)', background: 'transparent',
                    color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer'
                  }}
                >
                  Open Chat
                </button>
              </div>

              {report.status !== 'completed' ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                  Insights are {report.status === 'processing' ? 'generating...' : 'unavailable'}.
                </p>
              ) : report.insights ? (
                <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                  {report.insights.summary && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {report.insights.summary}
                    </p>
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
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                  Insights are not available yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsView = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Manage your profile and plan details.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        <div className="glass" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Profile
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Username:</strong> {user?.username}</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {user?.email}</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Business:</strong> {user?.businessName || 'Not set'}</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Industry:</strong> {user?.industry || 'Not set'}</div>
          </div>
        </div>

        <div className="glass" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Plan & Usage
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div><strong style={{ color: 'var(--text-primary)' }}>Plan:</strong> {user?.plan}</div>
            <div><strong style={{ color: 'var(--text-primary)' }}>Reports Used:</strong> {user?.currentDocumentCount} / {user?.documentLimit}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0" style={{ minHeight: 0 }}>
      <div
        className="lg:w-[45%] border-r border-[rgba(255,255,255,0.06)]"
        style={{ minWidth: 0, minHeight: 0 }}
      >
        <ReportContextPanel report={activeReport} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: 0 }}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onChatUpdate={(updatedChat) => {
              setActiveChat(updatedChat);
              setChats(prev => prev.map(c => c._id === updatedChat._id
                ? { ...c, title: updatedChat.title, updatedAt: updatedChat.updatedAt }
                : c
              ));
            }}
          />
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%'
          }}>
            <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 420 }}>
              <div className="animate-float" style={{ fontSize: 56, marginBottom: 20 }}>💬</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Start a Conversation
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                {activeReport
                  ? 'Ask questions about the selected report or start a new chat session.'
                  : 'Select or upload a report to start exploring insights.'}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  id="empty-new-chat"
                  onClick={handleNewChat}
                  style={{
                    padding: '12px 24px', borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gradient)', border: 'none',
                    color: 'white', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'var(--transition-base)',
                    boxShadow: '0 4px 20px rgba(0,206,201,0.3)',
                    fontFamily: 'inherit',
                  }}
                >
                  New Chat
                </button>
                <button
                  id="empty-upload"
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    padding: '12px 24px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'var(--transition-base)',
                    fontFamily: 'inherit',
                  }}
                >
                  Upload Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
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
        {/* Header */}
        <header className="glass" style={{
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: 20, padding: 4,
              }}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                ⚡
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                NexusAI
              </span>
              {user?.plan === 'pro' && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 6px',
                  borderRadius: 4, background: 'var(--accent-gradient)',
                  color: 'white', letterSpacing: '0.05em'
                }}>
                  PRO
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Usage Stats */}
            <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Usage
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {user?.currentDocumentCount} / {user?.documentLimit} Reports
                </div>
              </div>
              <div style={{
                width: 60, height: 6, background: 'var(--bg-tertiary)',
                borderRadius: 3, overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, (user?.currentDocumentCount || 0) / (user?.documentLimit || 1) * 100)}%`,
                  height: '100%', background: 'var(--accent-primary)',
                  borderRadius: 3, transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>

            {user?.plan === 'free' && (
              <button
                onClick={handleUpgrade}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-gradient)', border: 'none',
                  color: 'white', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'var(--transition-base)',
                  boxShadow: '0 4px 12px rgba(0,206,201,0.2)',
                }}
              >
                Upgrade to Pro
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600, color: 'var(--accent-secondary)',
                }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {user?.username}
                </span>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
                  color: '#ff6b6b', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'var(--transition-fast)',
                  fontFamily: 'inherit',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {loading ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, border: '3px solid rgba(0,206,201,0.2)',
              borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading your workspace...</p>
          </div>
        ) : view === 'reports' ? (
          renderReportsView()
        ) : view === 'insights' ? (
          renderInsightsView()
        ) : view === 'settings' ? (
          renderSettingsView()
        ) : (
          renderDashboardView()
        )}
      </div>

      {/* Upload Modal */}
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
