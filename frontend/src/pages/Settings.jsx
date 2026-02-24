import React, { useState, useEffect } from 'react';
import { Moon, Sun, CheckCircle2, AlertCircle, Mail, Save } from 'lucide-react';
import axios from 'axios';
import '../index.css';

const Settings = ({ theme, setTheme }) => {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    const [smtpData, setSmtpData] = useState({ emailUser: '', emailPass: '' });
    const [smtpStatus, setSmtpStatus] = useState({ type: '', message: '' });
    const [isSavingSmtp, setIsSavingSmtp] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://mailoo-5yjf.onrender.com/api/settings', {
                    headers: { 'x-auth-token': token }
                });
                if (res.data) {
                    setSmtpData({
                        emailUser: res.data.emailUser || '',
                        emailPass: res.data.emailPass || ''
                    });
                }
            } catch (err) {
                console.error("Failed to fetch SMTP settings");
            }
        };
        fetchSettings();
    }, []);

    const handleSmtpChange = (e) => {
        setSmtpData({ ...smtpData, [e.target.name]: e.target.value });
    };

    const handleSmtpSubmit = async (e) => {
        e.preventDefault();
        setIsSavingSmtp(true);
        setSmtpStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            await axios.post('https://mailoo-5yjf.onrender.com/api/settings', smtpData, {
                headers: { 'x-auth-token': token }
            });
            setSmtpStatus({ type: 'success', message: 'SMTP settings updated successfully.' });
        } catch (err) {
            setSmtpStatus({
                type: 'error',
                message: err.response?.data?.msg || 'Failed to update SMTP settings.'
            });
        } finally {
            setIsSavingSmtp(false);
        }
    };

    const handleThemeChange = async (newTheme) => {
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('https://mailoo-5yjf.onrender.com/api/user/preferences',
                { theme: newTheme },
                { headers: { 'x-auth-token': token } }
            );

            if (res.data?.theme) {
                setTheme(res.data.theme);
                document.documentElement.setAttribute('data-theme', res.data.theme);
                setStatus({ type: 'success', message: 'Theme preference saved successfully.' });
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.msg || 'Failed to save preferences.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 400 }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your personal application preferences.</p>
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Appearance
                </h2>

                {status.message && (
                    <div className="animate-fade-in" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px',
                        marginBottom: '24px',
                        background: status.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: status.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)'
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span style={{ fontWeight: 500 }}>{status.message}</span>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Theme</p>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                            disabled={isSaving}
                        >
                            <Sun size={24} />
                            <span>Light</span>
                        </button>

                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            disabled={isSaving}
                        >
                            <Moon size={24} />
                            <span>Dark</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '32px', marginTop: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={20} />
                    SMTP Configuration
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    Configure the Gmail account used to send broadcast emails. We recommend using a Google App Password instead of your real password.
                </p>

                {smtpStatus.message && (
                    <div className="animate-fade-in" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px',
                        marginBottom: '24px',
                        background: smtpStatus.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: smtpStatus.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)'
                    }}>
                        {smtpStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span style={{ fontWeight: 500 }}>{smtpStatus.message}</span>
                    </div>
                )}

                <form onSubmit={handleSmtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            Gmail Address
                        </label>
                        <input
                            type="email"
                            name="emailUser"
                            placeholder="e.g. you@gmail.com"
                            className="input-field"
                            value={smtpData.emailUser}
                            onChange={handleSmtpChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            App Password
                        </label>
                        <input
                            type="password"
                            name="emailPass"
                            placeholder="16-character Google App Password"
                            className="input-field"
                            value={smtpData.emailPass}
                            onChange={handleSmtpChange}
                            required
                        />
                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Don't use your regular password. Go to Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords.
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSavingSmtp}
                        style={{ padding: '12px 24px', alignSelf: 'flex-start', marginTop: '8px' }}
                    >
                        {isSavingSmtp ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Saving...
                            </span>
                        ) : (
                            <>
                                <Save size={18} /> Save SMTP Settings
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
