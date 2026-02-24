import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import '../index.css';

const Settings = ({ theme, setTheme }) => {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleThemeChange = async (newTheme) => {
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5001/api/user/preferences',
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
        </div>
    );
};

export default Settings;
