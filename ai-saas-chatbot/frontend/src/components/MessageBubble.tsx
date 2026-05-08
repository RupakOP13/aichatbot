import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  index: number;
  onRate: (rating: 'like' | 'dislike') => void;
}

export default function MessageBubble({ message, index, onRate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        
        // Strip markdown before speaking
        const cleanText = message.content.replace(/[#_*`\[\]]/g, '');
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
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-full)',
        background: isUser ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
        border: isUser ? 'none' : '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, marginTop: 2,
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '75%', minWidth: 0 }}>
        {/* Role label */}
        <div style={{
          fontSize: 11, fontWeight: 600, marginBottom: 4,
          color: isUser ? 'var(--accent-secondary)' : 'var(--text-muted)',
          textAlign: isUser ? 'right' : 'left',
        }}>
          {isUser ? 'You' : 'NexusAI'}
        </div>

        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(0,206,201,0.2), rgba(0,206,201,0.1))'
            : 'var(--bg-glass)',
          border: `1px solid ${isUser ? 'rgba(0,206,201,0.2)' : 'var(--border-subtle)'}`,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '12px 16px',
          transition: 'var(--transition-fast)',
        }}>
          {/* Message content */}
          <div style={{
            fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)',
            wordBreak: 'break-word',
          }}>
            {isUser ? (
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>
            ) : (
              <div className="prose-dark" style={{
                // Style markdown output
              }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{children}</strong>,
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
                            margin: '8px 0',
                            fontSize: 13,
                          }}>
                            <code style={{ color: 'var(--accent-secondary)' }}>{children}</code>
                          </pre>
                        );
                      }
                      return (
                        <code style={{
                          background: 'rgba(0,206,201,0.15)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 13,
                          color: 'var(--accent-secondary)',
                        }}>
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}>
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote style={{
                        borderLeft: '3px solid var(--accent-primary)',
                        paddingLeft: 12,
                        margin: '8px 0',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }}>
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Sources and Rating (assistant only) */}
          {!isUser && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 10, paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)',
            }}>
              {/* Sources */}
              <div>
                {message.sources && message.sources.length > 0 && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 12 }}>📚</span>
                    {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Rating buttons */}
              <div style={{
                display: 'flex', gap: 2,
                opacity: isHovered || message.rating ? 1 : 0,
                transition: 'var(--transition-fast)',
              }}>
                <button
                  onClick={() => onRate('like')}
                  style={{
                    background: message.rating === 'like' ? 'rgba(0,206,201,0.15)' : 'transparent',
                    border: `1px solid ${message.rating === 'like' ? 'rgba(0,206,201,0.3)' : 'transparent'}`,
                    borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 13,
                  }}
                  title="Good response"
                >
                  👍
                </button>
                <button
                  onClick={() => onRate('dislike')}
                  style={{
                    background: message.rating === 'dislike' ? 'rgba(255,107,107,0.15)' : 'transparent',
                    border: `1px solid ${message.rating === 'dislike' ? 'rgba(255,107,107,0.3)' : 'transparent'}`,
                    borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 13,
                  }}
                  title="Bad response"
                >
                  👎
                </button>
                <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
                <button
                  onClick={handleSpeak}
                  style={{
                    background: isSpeaking ? 'rgba(0,206,201,0.15)' : 'transparent',
                    border: `1px solid ${isSpeaking ? 'rgba(0,206,201,0.3)' : 'transparent'}`,
                    borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                    fontSize: 13,
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
