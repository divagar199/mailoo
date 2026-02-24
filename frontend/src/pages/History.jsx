import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import '../index.css';

const History = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('https://mailoo-5yjf.onrender.com/api/mail/history');
                setLogs(res.data);
            } catch (err) {
                setError('Failed to fetch history data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <HistoryIcon size={32} color="var(--primary)" />
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Broadcast History</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Review previously sent emails and their delivery statuses.</p>
                </div>
            </div>

            <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <div className="animate-float" style={{ display: 'inline-block', marginBottom: '16px' }}>
                            <Clock size={40} color="var(--primary)" />
                        </div>
                        <p>Loading history...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger-text)', background: 'var(--danger-bg)', borderRadius: '8px' }}>
                        <XCircle size={40} style={{ marginBottom: '16px' }} />
                        <p>{error}</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-disabled)' }}>
                        <HistoryIcon size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>No emails sent yet.</p>
                        <p>Your broadcast history will appear here.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Recipients</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>

                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>

                                    <td style={{ padding: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {log.subject.length > 30 ? log.subject.substring(0, 30) + '...' : log.subject}
                                    </td>

                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {log.recipients.slice(0, 2).map((r, i) => (
                                                <span key={i} style={{
                                                    background: 'var(--bg-main)', padding: '4px 8px',
                                                    borderRadius: '8px', fontSize: '0.85rem'
                                                }}>
                                                    {r}
                                                </span>
                                            ))}
                                            {log.recipients.length > 2 && (
                                                <span style={{
                                                    background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                                                    padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem'
                                                }}>
                                                    +{log.recipients.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                                            background: log.status === 'Success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                                            color: log.status === 'Success' ? 'var(--success-text)' : 'var(--danger-text)',
                                        }}>
                                            {log.status === 'Success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>
        </div>
    );
};

export default History;
