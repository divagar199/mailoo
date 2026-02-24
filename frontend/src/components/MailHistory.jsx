import React, { useEffect, useState } from 'react';
import { getHistory } from '../api';
import { Mail, Clock, CheckCircle, XCircle, Paperclip, RefreshCw } from 'lucide-react';

const MailHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getHistory();
            setHistory(response.data);
        } catch (err) {
            setError('Failed to load email history.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        if (isToday) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-4 md:px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-medium text-[#202124]" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
                        Sent History
                    </h2>
                    <span className="text-xs font-medium text-[#5f6368] bg-[#f1f3f4] px-2.5 py-1 rounded-full">
                        {history.length}
                    </span>
                </div>
                <button
                    onClick={fetchHistory}
                    disabled={loading}
                    className="ripple flex items-center gap-1.5 text-sm text-[#1a73e8] px-3 py-1.5 rounded-full hover:bg-[#e8f0fe] transition-colors font-medium disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="flex flex-col items-center gap-3 text-[#5f6368]">
                            <div className="w-8 h-8 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Loading history…</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#c5221f]">
                        <XCircle className="w-10 h-10 opacity-60" />
                        <p className="text-sm">{error}</p>
                        <button onClick={fetchHistory} className="text-sm text-[#1a73e8] hover:underline font-medium">Try Again</button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-[#9aa0a6] gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#f1f3f4] flex items-center justify-center">
                            <Mail className="w-10 h-10 opacity-40" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-medium text-[#5f6368]">No emails sent yet</p>
                            <p className="text-sm mt-1">Sent emails will appear here</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-[#f0f0f0]">
                        {history.map((record) => (
                            <div key={record._id} className="ripple px-4 md:px-6 py-4 hover:bg-[#f6f8fc] transition-colors cursor-default">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${record.status === 'success' ? 'text-[#137333]' : 'text-[#c5221f]'}`}>
                                            {record.status === 'success'
                                                ? <CheckCircle className="w-4 h-4" />
                                                : <XCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 justify-between">
                                                <h3 className="font-medium text-sm text-[#202124] truncate">{record.subject}</h3>
                                                <span className="text-xs text-[#5f6368] whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(record.createdAt)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#5f6368] mt-1 line-clamp-2">{record.body}</p>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                                <span className="text-xs text-[#5f6368]">
                                                    <span className="font-medium">To:</span>{' '}
                                                    <span className="text-[#202124]">
                                                        {record.recipients.slice(0, 2).join(', ')}
                                                        {record.recipients.length > 2 && (
                                                            <span className="text-[#1a73e8] ml-1">+{record.recipients.length - 2} more</span>
                                                        )}
                                                    </span>
                                                </span>
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${record.status === 'success' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                                                    {record.status === 'success' ? 'Delivered' : 'Failed'}
                                                </span>
                                                {record.attachments && record.attachments.length > 0 && (
                                                    <span className="flex items-center gap-1 text-xs text-[#5f6368]">
                                                        <Paperclip className="w-3 h-3" />
                                                        {record.attachments.length} attachment{record.attachments.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {record.status === 'failed' && record.errorMessage && (
                                                <p className="mt-2 text-xs text-[#c5221f] bg-[#fce8e6] px-2 py-1.5 rounded border border-[#f5c6c3]">
                                                    {record.errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailHistory;
