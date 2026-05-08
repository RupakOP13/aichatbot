import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.login(formData.email, formData.password);
      login(response.token, response.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error('Google login failed. Please try again.');
        return;
      }
      const response = await api.loginWithGoogle(credentialResponse.credential);
      login(response.token, response.user);
      toast.success('Signed in with Google');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google login failed.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden p-12">
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,206,201,0.16) 0%, transparent 70%)',
          top: '-10%', left: '-10%', animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,144,255,0.12) 0%, transparent 70%)',
          bottom: '-5%', right: '-5%', animation: 'float 8s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,213,115,0.08) 0%, transparent 70%)',
          top: '40%', right: '20%', animation: 'float 5s ease-in-out infinite 1s',
        }} />

        <div className="relative z-10 text-center max-w-lg">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <div style={{
              width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 0 40px rgba(0,206,201,0.3)',
            }}>
              ⚡
            </div>
            <h1 className="text-5xl font-bold mb-4 gradient-text">NexusAI</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.7 }}>
              Your AI business report assistant.
              Upload spreadsheets, ask questions, get instant insights.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {['📊 Report Insights', '🧠 AI Q&A', '⚡ Fast Summaries', '🔒 Secure'].map((feature) => (
              <span key={feature} className="glass" style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
              }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-in py-12">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 0 30px rgba(0,206,201,0.3)',
            }}>
              ⚡
            </div>
            <h1 className="text-3xl font-bold gradient-text">NexusAI</h1>
          </div>

          <div className="glass-strong" style={{ 
            borderRadius: 'var(--radius-xl)', padding: '40px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{ 
              fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', 
              marginBottom: 4 
            }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
              Sign in to continue to your dashboard
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', fontSize: 13, fontWeight: 500, 
                  color: 'var(--text-secondary)', marginBottom: 8 
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', 
                    fontSize: 16, opacity: 0.4 
                  }}>
                    ✉️
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={{
                      width: '100%', padding: '12px 14px 12px 44px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 14, outline: 'none', transition: 'var(--transition-fast)',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ 
                  display: 'block', fontSize: 13, fontWeight: 500, 
                  color: 'var(--text-secondary)', marginBottom: 8 
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', 
                    fontSize: 16, opacity: 0.4 
                  }}>
                    🔒
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '12px 44px 12px 44px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      fontSize: 14, outline: 'none', transition: 'var(--transition-fast)',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent-primary)';
                      e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                      color: 'var(--text-muted)', padding: 4,
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'var(--bg-tertiary)' : 'var(--accent-gradient)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-base)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,206,201,0.3)',
                  fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.target as HTMLElement).style.boxShadow = '0 6px 30px rgba(0,206,201,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,206,201,0.3)';
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{
                      width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {googleClientId && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '24px 0 18px',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                  Or continue with
                  <span style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed.')}
                    theme="outline"
                    size="large"
                    width="320"
                  />
                </div>
              </>
            )}

            {/* Register link */}
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                id="goto-register"
                onClick={() => navigate('/register')}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-secondary)',
                  fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-secondary)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--accent-secondary)'}
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
