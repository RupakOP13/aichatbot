import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Report } from '../types';
import DynamicChatChart from './DynamicChatChart';

interface MessageBubbleProps {
  message: Message;
  report: Report | null;
  index: number;
  onRate: (rating: 'like' | 'dislike') => void;
}

export default function MessageBubble({ message, report, index, onRate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Detect embedded chart config: [CHART_CONFIG: {...}]
  const chartConfig = useMemo(() => {
    if (isUser) return null;
    const match = message.content.match(/\[CHART_CONFIG:\s*(\{.*?\})\]/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error('Failed to parse chat chart config', e);
        return null;
      }
    }
    return null;
  }, [message.content, isUser]);

  // Clean content of the chart tag for display
  const displayContent = useMemo(() => {
    return message.content.replace(/\[CHART_CONFIG:\s*\{.*?\}\]/, '').trim();
  }, [message.content]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = displayContent.replace(/[#_*`\[\]]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div
      className={isUser ? 'animate-slide-in-right' : 'animate-slide-in-left'}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 12,
        padding: '4px 0',
        animationDelay: `${index * 0.05}s`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-full)',
        background: isUser ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
        border: isUser ? 'none' : '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, marginTop: 2,
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      <div style={{ maxWidth: '85%', minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, marginBottom: 4,
          color: isUser ? 'var(--accent-secondary)' : 'var(--text-muted)',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {isUser ? 'You' : 'NexusAI Analyst'}
        </div>

        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(0,206,201,0.2), rgba(0,206,201,0.1))'
            : 'var(--bg-glass)',
          border: `1px solid ${isUser ? 'rgba(0,206,201,0.2)' : 'var(--border-subtle)'}`,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '14px 18px',
          transition: 'var(--transition-fast)',
          boxShadow: isUser ? 'none' : 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)',
            wordBreak: 'break-word',
          }}>
            {isUser ? (
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{displayContent}</p>
            ) : (
              <div className="prose-dark">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 10px 0' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{children}</strong>,
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-');
                      if (isBlock) {
                        return (
                          <pre style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '12px 16px',
                            overflowX: 'auto',
                            margin: '10px 0',
                            fontSize: 13,
                          }}>
                            <code style={{ color: 'var(--accent-primary)' }}>{children}</code>
                          </pre>
                        );
                      }
                      return (
                        <code style={{
                          background: 'rgba(0,206,201,0.12)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 13,
                          color: 'var(--accent-primary)',
                        }}>
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '10px 0' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '10px 0' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 6 }}>{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        {children}
                      </a>
                    ),
                  }}
                >
                  {displayContent}
                </ReactMarkdown>

                {/* Inline Chart Injection */}
                {chartConfig && (
                  <DynamicChatChart config={chartConfig} report={report} />
                )}
              </div>
            )}
          </div>

          {!isUser && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 12, paddingTop: 10,
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div>
                {message.sources && message.sources.length > 0 && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 14 }}>📘</span>
                    Source: {message.sources[0]}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex', gap: 4,
                opacity: isHovered || message.rating ? 1 : 0,
                transition: 'var(--transition-fast)',
              }}>
                <button
                  onClick={() => onRate('like')}
                  style={{
                    background: message.rating === 'like' ? 'rgba(0,206,201,0.15)' : 'transparent',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 14,
                  }}
                  title="Helpful"
                >
                  👍
                </button>
                <button
                  onClick={() => onRate('dislike')}
                  style={{
                    background: message.rating === 'dislike' ? 'rgba(255,107,107,0.15)' : 'transparent',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 14,
                  }}
                  title="Not helpful"
                >
                  👎
                </button>
                <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
                <button
                  onClick={handleSpeak}
                  style={{
                    background: isSpeaking ? 'rgba(0,206,201,0.15)' : 'transparent',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 14,
                  }}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? '🔇' : '🔊'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
