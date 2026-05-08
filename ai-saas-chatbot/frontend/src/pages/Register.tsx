import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    businessName: '',
    industry: '',
    password: '',
    confirmPassword: ''
  });
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(
        formData.username,
        formData.email,
        formData.password,
        formData.businessName,
        formData.industry
      );
      login(response.token, response.user);
      toast.success('Account created! Welcome aboard 🚀');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error('Google signup failed. Please try again.');
        return;
      }
      const response = await api.loginWithGoogle(credentialResponse.credential);
      login(response.token, response.user);
      toast.success('Account created with Google');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google signup failed.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 44px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', transition: 'var(--transition-fast)',
    fontFamily: 'inherit',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--accent-primary)';
    e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border-light)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative overflow-hidden p-12">
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,206,201,0.16) 0%, transparent 70%)',
          top: '-10%', right: '-10%', animation: 'float 7s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,144,255,0.12) 0%, transparent 70%)',
          bottom: '10%', left: '5%', animation: 'float 5s ease-in-out infinite 1s',
        }} />

        <div className="relative z-10 text-center max-w-lg">
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
              Join teams using AI-powered business report intelligence
              to unlock faster decisions.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { value: '10K+', label: 'Reports' },
              { value: '50K+', label: 'Questions' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-secondary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Create account
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
              Get started with your free NexusAI account
            </p>

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>👤</span>
                  <input id="register-username" type="text" name="username" value={formData.username}
                    onChange={handleChange} placeholder="Choose a username" required minLength={3}
                    autoComplete="username" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Business Name */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Business Name
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>🏢</span>
                  <input id="register-business" type="text" name="businessName" value={formData.businessName}
                    onChange={handleChange} placeholder="Your company or shop" required
                    autoComplete="organization" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Industry */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Industry
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>📈</span>
                  <input id="register-industry" type="text" name="industry" value={formData.industry}
                    onChange={handleChange} placeholder="e.g. Retail, SaaS, Finance" required
                    autoComplete="organization-title" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>✉️</span>
                  <input id="register-email" type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="you@example.com" required
                    autoComplete="email" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>🔒</span>
                  <input id="register-password" type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange} placeholder="Min 6 characters"
                    required minLength={6} autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: 44 }} onFocus={handleFocus} onBlur={handleBlur}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', padding: 4,
                    }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.4 }}>🔐</span>
                  <input id="register-confirm" type="password" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password"
                    required minLength={6} autoComplete="new-password"
                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button id="register-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'var(--bg-tertiary)' : 'var(--accent-gradient)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-base)',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,206,201,0.3)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { if (!loading) { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; (e.target as HTMLElement).style.boxShadow = '0 6px 30px rgba(0,206,201,0.4)'; } }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,206,201,0.3)'; }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Creating account...
                  </span>
                ) : 'Create Account'}
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
                    onError={() => toast.error('Google signup failed.')}
                    theme="outline"
                    size="large"
                    width="320"
                  />
                </div>
              </>
            )}

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button id="goto-login" onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)',
                  fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--accent-secondary)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--accent-secondary)'}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
