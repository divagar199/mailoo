import React, { useState } from 'react';
import { Send, Users, FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../index.css';

const Dashboard = () => {
    const [formData, setFormData] = useState({
        subject: '',
        body: '',
        recipients: '',
        attachments: []
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'attachments') {
            setFormData({ ...formData, attachments: [...e.target.files] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                const extractedEmails = [];

                data.forEach(row => {
                    row.forEach(cell => {
                        if (typeof cell === 'string' && emailRegex.test(cell.trim())) {
                            extractedEmails.push(cell.trim());
                        }
                    });
                });

                if (extractedEmails.length > 0) {
                    const currentRecipients = formData.recipients ? formData.recipients.split(',').map(e => e.trim()).filter(e => e) : [];
                    const combined = [...new Set([...currentRecipients, ...extractedEmails])];

                    setFormData({ ...formData, recipients: combined.join(', ') });
                    setStatus({ type: 'success', message: `Extracted ${extractedEmails.length} emails from ${file.name}` });
                } else {
                    setStatus({ type: 'error', message: 'No valid emails found in the uploaded file.' });
                }
            } catch (error) {
                console.error("Error reading file:", error);
                setStatus({ type: 'error', message: 'Failed to read the Excel file.' });
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setIsSending(true);

        const recipientArray = formData.recipients
            .split(',')
            .map(email => email.trim())
            .filter(email => email !== '');

        if (recipientArray.length === 0) {
            setStatus({ type: 'error', message: 'Please enter at least one valid recipient.' });
            setIsSending(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('subject', formData.subject);
            data.append('body', formData.body);
            data.append('recipients', recipientArray.join(','));

            formData.attachments.forEach(file => {
                data.append('attachments', file);
            });

            const res = await axios.post('https://mailoo-5yjf.onrender.com/api/mail/send', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setStatus({ type: 'success', message: res.data.msg });
            setFormData({ subject: '', body: '', recipients: '', attachments: [] });
            const fileInput = document.getElementById('attachment-input');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.error || err.response?.data?.msg || 'Failed to send emails.'
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto 100px', padding: '0 24px' }}>

            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Send Bulk Mail</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Compose your message and broadcast to multiple recipients instantly.</p>
            </div>

            <div className="card" style={{ padding: '32px' }}>

                {status.message && (
                    <div className="animate-fade-in" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px',
                        marginBottom: '24px',
                        background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        color: status.type === 'success' ? 'var(--success)' : 'var(--danger)'
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <span style={{ fontWeight: 500 }}>{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div>
                        <div className="dashboard-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                <Users size={18} />
                                Recipients (comma separated)
                            </label>

                            <label className="import-btn-label" style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '0.85rem', color: 'var(--primary)',
                                cursor: 'pointer', background: 'var(--primary-bg)',
                                padding: '6px 12px', borderRadius: '16px', border: '1px solid transparent',
                                transition: 'all 0.2s ease', fontWeight: 500
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-active)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-bg)'}>
                                <Upload size={14} />
                                <span>Import Excel/CSV</span>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <input
                            type="text"
                            name="recipients"
                            placeholder="e.g. user1@example.com, user2@example.com"
                            className="input-field"
                            value={formData.recipients}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            <FileText size={18} />
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            placeholder="Enter email subject"
                            className="input-field"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            <FileText size={18} />
                            Message Body
                        </label>
                        <textarea
                            name="body"
                            placeholder="Type your message here..."
                            className="input-field"
                            style={{ minHeight: '200px', resize: 'vertical' }}
                            value={formData.body}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                            <Upload size={18} />
                            Attachments (Images/Files)
                        </label>
                        <input
                            type="file"
                            name="attachments"
                            id="attachment-input"
                            multiple
                            className="input-field"
                            style={{ padding: '12px' }}
                            onChange={handleChange}
                        />
                        {formData.attachments.length > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                                {formData.attachments.length} file(s) attached
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSending}
                        style={{ alignSelf: 'flex-end', padding: '16px 32px' }}
                    >
                        {isSending ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Sending...
                            </span>
                        ) : (
                            <>
                                <Send size={20} />
                                Send Broadcast
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Dashboard;
