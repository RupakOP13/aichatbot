import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Chat, Report } from '../types';

interface SidebarProps {
  chats: Chat[];
  reports: Report[];
  activeChat: Chat | null;
  activeReportId?: string | null;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  onSelectReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
  onUpload: () => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  reports,
  activeChat,
  activeReportId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onSelectReport,
  onDeleteReport,
  onUpload,
  open,
  onClose
}: SidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [hoveredReport, setHoveredReport] = useState<string | null>(null);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/reports', label: 'Reports', icon: '📊' },
    { to: '/insights', label: 'Insights', icon: '✨' },
    { to: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--success)';
      case 'processing': return 'var(--warning)';
      case 'failed': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 40,
          }}
          className="md:hidden"
        />
      )}

      <aside
        style={{
          width: 280,
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: open ? 'translateX(0)' : undefined,
          zIndex: 40,
          flexShrink: 0,
        }}
        className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative`}
      >
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <button
            id="new-chat-btn"
            onClick={onNewChat}
            style={{
              width: '100%', padding: '10px 16px',
              background: 'var(--accent-gradient)',
              border: 'none', borderRadius: 'var(--radius-md)',
              color: 'white', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'var(--transition-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 2px 12px rgba(0, 206, 201, 0.2)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(0, 206, 201, 0.35)';
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.boxShadow = '0 2px 12px rgba(0, 206, 201, 0.2)';
              (e.target as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 16 }}>✨</span>
            New Chat
          </button>
        </div>

        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0, 206, 201, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'var(--transition-fast)'
              })}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          <div style={{ padding: '0 8px', marginBottom: 8 }}>
            <h3 style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Recent Chats
            </h3>
          </div>

          {chats.length === 0 ? (
            <p style={{
              padding: '16px', fontSize: 13, color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              No chats yet
            </p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {chats.map((chat, index) => {
                const isActive = activeChat?._id === chat._id;
                const isHovered = hoveredChat === chat._id;

                return (
                  <li key={chat._id} style={{
                    marginBottom: 2,
                    animation: 'fadeIn 0.3s ease forwards',
                    animationDelay: `${index * 0.03}s`,
                    opacity: 0,
                  }}>
                    <div
                      onMouseEnter={() => setHoveredChat(chat._id)}
                      onMouseLeave={() => setHoveredChat(null)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition-fast)',
                        background: isActive
                          ? 'rgba(0, 206, 201, 0.15)'
                          : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      }}
                    >
                      <button
                        onClick={() => {
                          onSelectChat(chat);
                          onClose();
                        }}
                        style={{
                          flex: 1, textAlign: 'left', padding: '10px 10px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: 13, fontWeight: isActive ? 600 : 400,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span style={{ marginRight: 8, fontSize: 12, opacity: 0.5 }}>💬</span>
                        {chat.title}
                      </button>

                      {(isHovered || isActive) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat._id);
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 14, padding: '4px 8px',
                            transition: 'var(--transition-fast)', borderRadius: 4,
                            marginRight: 4, flexShrink: 0,
                          }}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--error)'}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
                          title="Delete chat"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 8px', maxHeight: 220, overflowY: 'auto',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 8px', marginBottom: 8,
          }}>
            <h3 style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Reports ({reports.length})
            </h3>
            <button
              id="upload-report-btn"
              onClick={onUpload}
              style={{
                background: 'rgba(0, 206, 201, 0.12)', border: '1px solid rgba(0, 206, 201, 0.2)',
                borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                color: 'var(--accent-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'var(--transition-fast)', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(0, 206, 201, 0.2)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'rgba(0, 206, 201, 0.12)'}
            >
              + Add
            </button>
          </div>

          {reports.length === 0 ? (
            <p style={{
              padding: '12px 8px', fontSize: 13, color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              No reports uploaded
            </p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {reports.map(report => (
                <li
                  key={report._id}
                  onMouseEnter={() => setHoveredReport(report._id)}
                  onMouseLeave={() => setHoveredReport(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition-fast)',
                    background: activeReportId === report._id
                      ? 'rgba(0, 206, 201, 0.12)'
                      : hoveredReport === report._id
                        ? 'rgba(255,255,255,0.02)'
                        : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>📊</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <button
                        onClick={() => {
                          onSelectReport(report);
                          onClose();
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, textAlign: 'left', width: '100%',
                          fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: 'inherit'
                        }}
                      >
                        {report.title}
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: statusColor(report.status), flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {report.status}
                        </span>
                        {report.fileSizeFormatted && (
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            · {report.fileSizeFormatted}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(hoveredReport === report._id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(report._id);
                      }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 13, padding: '4px 6px',
                        transition: 'var(--transition-fast)', borderRadius: 4,
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--error)'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
                      title="Delete report"
                    >
                      🗑️
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
