import React, { useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Report } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DocumentUploadProps {
  onClose: () => void;
  onUploadSuccess: (report: Report) => void;
}

export default function DocumentUpload({ onClose, onUploadSuccess }: DocumentUploadProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = user && user.plan === 'free' && user.currentDocumentCount >= user.documentLimit;

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleUpload = useCallback(async (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File too large (${formatSize(file.size)}). Max 10MB.`);
      return;
    }

    const allowed = ['csv', 'xlsx', 'json', 'pdf', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      toast.error(`Unsupported file type. Allowed: ${allowed.join(', ')}`);
      return;
    }

    if (isLimitReached) {
      toast.error('Report limit reached. Please upgrade to Pro!');
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setProgress(0);

    try {
      const report = await api.uploadReport(file, (p) => setProgress(p));
      onUploadSuccess(report);
      toast.success('Report uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  }, [onUploadSuccess, isLimitReached]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, zIndex: 50,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="animate-scale-in glass-strong" style={{
        borderRadius: 'var(--radius-xl)',
        padding: 36, maxWidth: 480, width: '100%',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Upload Report
          </h2>
          {!loading && (
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 20, padding: 4,
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
            >
              ✕
            </button>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          Upload CSV, Excel, PDF, Word, or JSON files to get instant business insights and summaries.
        </p>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-primary)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: loading || isLimitReached ? 'default' : 'pointer',
            transition: 'var(--transition-base)',
            background: dragActive ? 'rgba(0,206,201,0.08)' : 'transparent',
            opacity: isLimitReached ? 0.7 : 1,
          }}
        >
          {isLimitReached ? (
            <div style={{ padding: '10px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Limit Reached
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                You've used all {user?.documentLimit} reports in your Free plan.
                Upgrade to Pro for unlimited uploads and faster processing.
              </p>
              <div style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600 }}>
                Pro Tip: You can delete old reports to free up space.
              </div>
            </div>
          ) : loading ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, margin: '0 auto',
                  border: '3px solid rgba(0,206,201,0.2)',
                  borderTopColor: 'var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>

              {selectedFile && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>
                  📄 {selectedFile.name}
                </p>
              )}

              {/* Progress bar */}
              <div style={{
                width: '100%', height: 6, background: 'var(--bg-tertiary)',
                borderRadius: 3, overflow: 'hidden', marginBottom: 8,
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: 'var(--accent-gradient)',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {progress < 100 ? `Uploading... ${progress}%` : 'Processing report...'}
              </p>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: 48, marginBottom: 12,
                animation: dragActive ? 'float 1s ease-in-out infinite' : 'none',
              }}>
                {dragActive ? '📥' : '📊'}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>
                {dragActive ? 'Drop your report here' : 'Drag & drop your report here'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                or click to browse
              </p>
              <div style={{
                display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap',
              }}>
                {['CSV', 'XLSX', 'JSON', 'PDF', 'DOCX'].map(type => (
                  <span key={type} style={{
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                  }}>
                    .{type.toLowerCase()}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, opacity: 0.6 }}>
                Max file size: 10MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={loading}
          accept=".csv,.xlsx,.json,.pdf,.docx"
          style={{ display: 'none' }}
        />

        {/* Footer */}
        {!loading && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                background: 'transparent', border: '1px solid var(--border-light)',
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'var(--transition-fast)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
