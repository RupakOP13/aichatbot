import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Chat, Report } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  chat: Chat;
  report: Report | null;
  onChatUpdate: (chat: Chat) => void;
  autoMessage?: string;
}

export default function ChatWindow({ chat, report, onChatUpdate, autoMessage }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        } else if (event.error !== 'no-speech') {
          toast.error('Microphone error: ' + event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (autoMessage && !loading) {
      handleSendMessage(undefined, autoMessage);
    }
  }, [autoMessage, chat._id]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          toast.success('Listening... Speak now', { id: 'listening' });
        } catch (e) {
          console.error(e);
          // If already started, just sync state
          setIsListening(true);
        }
      } else {
        toast.error('Voice input is not supported in your browser.');
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chat._id]);

  const handleSendMessage = async (e?: React.FormEvent, directMessage?: string) => {
    if (e) e.preventDefault();
    const trimmed = (directMessage || message).trim();
    if (!trimmed || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    if (!directMessage) setMessage('');
    setLoading(true);

    try {
      const { chat: updatedChat } = await api.sendMessage(chat._id, trimmed);
      onChatUpdate(updatedChat);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessage(trimmed); // Restore message on failure
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRateMessage = async (messageIndex: number, rating: 'like' | 'dislike') => {
    try {
      await api.rateMessage(chat._id, messageIndex, rating);
      const updatedMessages = [...chat.messages];
      const current = updatedMessages[messageIndex].rating;
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        rating: current === rating ? null : rating
      };
      onChatUpdate({ ...chat, messages: updatedMessages });
    } catch (error: any) {
      toast.error('Failed to rate message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Chat title bar */}
      <div style={{
        padding: '10px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 14, opacity: 0.4 }}>💬</span>
        <span style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {chat.title}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {chat.messages.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: 360 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🤖</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                How can I help you?
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Ask me anything about your uploaded reports, or start a new analysis.
                I'm here to help.
              </p>
            </div>
          </div>
        ) : (
          <>
            {chat.messages.map((msg, idx) => (
              <MessageBubble
                key={msg._id || idx}
                message={msg}
                report={report}
                index={idx}
                onRate={(rating) => handleRateMessage(idx, rating)}
              />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="animate-fade-in" style={{
                display: 'flex', gap: 12, padding: '4px 0',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  🤖
                </div>
                <div style={{
                  background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                  borderRadius: '16px 16px 16px 4px', padding: '12px 18px',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--accent-secondary)',
                      animation: `typing-dot 1.4s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex', alignItems: 'flex-end', gap: 12,
          background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)', padding: '8px 8px 8px 18px',
          transition: 'var(--transition-fast)',
        }}>
          <textarea
            ref={inputRef}
            id="chat-input"
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--text-primary)',
              fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit',
              maxHeight: 150, minHeight: 24, padding: '4px 0',
            }}
          />
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            style={{
              padding: '8px', background: isListening ? 'rgba(255,107,107,0.1)' : 'transparent',
              border: 'none', borderRadius: 'var(--radius-full)',
              color: isListening ? '#ff6b6b' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'var(--transition-fast)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 18, animation: isListening ? 'pulse 1.5s infinite' : 'none' }}>
              {isListening ? '🛑' : '🎤'}
            </span>
          </button>
          <button
            id="send-btn"
            type="submit"
            disabled={loading || !message.trim()}
            style={{
              padding: '8px 16px',
              background: (loading || !message.trim()) ? 'var(--bg-tertiary)' : 'var(--accent-gradient)',
              border: 'none', borderRadius: 'var(--radius-sm)',
              color: 'white', fontSize: 13, fontWeight: 600,
              cursor: (loading || !message.trim()) ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-fast)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit', flexShrink: 0,
              opacity: (loading || !message.trim()) ? 0.5 : 1,
            }}
          >
            {loading ? (
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <>
                Send
                <span style={{ fontSize: 14 }}>↑</span>
              </>
            )}
          </button>
        </form>
        <p style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 8,
          textAlign: 'center', opacity: 0.6,
        }}>
          NexusAI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
