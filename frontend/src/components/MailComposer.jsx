import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Send, AlertCircle, CheckCircle2, X, Paperclip, FileText, Image } from 'lucide-react';
import { sendMail } from '../api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MailComposer = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipientInput, setRecipientInput] = useState('');
    const [recipientChips, setRecipientChips] = useState([]);
    const [excelFile, setExcelFile] = useState(null);
    const [excelSummary, setExcelSummary] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const excelInputRef = useRef(null);
    const attachInputRef = useRef(null);

    const addEmailChip = (value) => {
        const emails = value.split(/[\s,;]+/).map(e => e.trim()).filter(e => EMAIL_REGEX.test(e));
        if (emails.length > 0) {
            setRecipientChips(prev => [...new Set([...prev, ...emails])]);
            setRecipientInput('');
        }
    };

    const handleRecipientKeyDown = (e) => {
        if (['Enter', ',', ' ', 'Tab'].includes(e.key)) {
            e.preventDefault();
            addEmailChip(recipientInput);
        }
        if (e.key === 'Backspace' && recipientInput === '' && recipientChips.length > 0) {
            setRecipientChips(prev => prev.slice(0, -1));
        }
    };

    const removeChip = (email) => {
        setRecipientChips(prev => prev.filter(e => e !== email));
    };

    const handleExcelUpload = (file) => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            setStatus({ type: 'error', message: 'Please upload a valid Excel (.xlsx, .xls) or CSV file.' });
            return;
        }
        setExcelFile(file);
        setExcelSummary(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const found = [];
                rows.forEach(row => {
                    if (!Array.isArray(row)) return;
                    row.forEach(cell => {
                        const val = String(cell || '').trim();
                        if (EMAIL_RE.test(val)) found.push(val);
                    });
                });

                const unique = [...new Set(found)];
                if (unique.length === 0) {
                    setStatus({ type: 'error', message: `No valid email addresses found in "${file.name}".` });
                    setExcelFile(null);
                    return;
                }

                setRecipientChips(prev => [...new Set([...prev, ...unique])]);
                setExcelSummary({ filename: file.name, count: unique.length });
            } catch (err) {
                setStatus({ type: 'error', message: 'Failed to parse Excel file: ' + err.message });
                setExcelFile(null);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAttachmentUpload = (files) => {
        const fileList = Array.from(files);
        setAttachments(prev => {
            const existing = new Set(prev.map(f => f.name + f.size));
            const newFiles = fileList.filter(f => !existing.has(f.name + f.size));
            return [...prev, ...newFiles];
        });
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const excelFiles = files.filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
        const otherFiles = files.filter(f => !/\.(xlsx|xls|csv)$/i.test(f.name));
        if (excelFiles.length > 0) handleExcelUpload(excelFiles[0]);
        if (otherFiles.length > 0) handleAttachmentUpload(otherFiles);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const manualEmails = recipientInput
            ? recipientInput.split(/[\s,;]+/).map(e => e.trim()).filter(e => EMAIL_REGEX.test(e))
            : [];
        const allRecipients = [...new Set([...recipientChips, ...manualEmails])];

        if (allRecipients.length === 0 && !excelFile) {
            setStatus({ type: 'error', message: 'Please add at least one recipient or upload an Excel file.' });
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('body', body);
            allRecipients.forEach(email => formData.append('recipients', email));
            if (excelFile) formData.append('excelFile', excelFile);
            attachments.forEach(file => formData.append('attachments', file));

            const response = await sendMail(formData);
            setStatus({
                type: 'success',
                message: `✓ Emails sent to ${response.data.recipientCount} recipients successfully!`
            });
            setSubject('');
            setBody('');
            setRecipientInput('');
            setRecipientChips([]);
            setExcelFile(null);
            setExcelSummary(null);
            setAttachments([]);
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.error || 'Failed to send emails. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = (file) => file.type.startsWith('image/');

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-4 md:px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-medium text-[#202124]" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
                    New Bulk Message
                </h2>
                <span className="text-xs text-[#5f6368] bg-[#f1f3f4] px-2 py-1 rounded-full">
                    {recipientChips.length} recipient{recipientChips.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto">
                {status.message && (
                    <div className={`mx-4 md:mx-6 mt-4 p-3 rounded-lg flex items-start gap-3 text-sm
                        ${status.type === 'success' ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]' :
                            status.type === 'error' ? 'bg-[#fce8e6] text-[#c5221f] border border-[#f5c6c3]' :
                                'bg-[#e8f0fe] text-[#1558d6] border border-[#c5d5f8]'}`}>
                        {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <p>{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                    {/* Recipients */}
                    <div className="border border-[#dadce0] rounded-lg focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] transition-all">
                        <div className="flex items-center px-3 py-2 border-b border-[#f0f0f0] bg-[#fafafa] rounded-t-lg">
                            <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wide w-16 flex-shrink-0">To</span>
                            <div className="flex flex-wrap gap-1.5 flex-1 min-h-8 items-center">
                                {recipientChips.map(email => (
                                    <span key={email} className="md-chip text-xs">
                                        {email}
                                        <button type="button" onClick={() => removeChip(email)} title="Remove">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder={recipientChips.length === 0 ? "Add email, press Enter or comma…" : "Add more…"}
                                    className="flex-1 min-w-[180px] outline-none bg-transparent text-sm text-[#202124] placeholder-[#9aa0a6] py-1"
                                    value={recipientInput}
                                    onChange={e => setRecipientInput(e.target.value)}
                                    onKeyDown={handleRecipientKeyDown}
                                    onBlur={() => addEmailChip(recipientInput)}
                                />
                            </div>
                        </div>

                        {/* Excel Upload Row */}
                        <div className="flex items-center px-3 py-2 gap-2">
                            <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wide w-16 flex-shrink-0">Excel</span>
                            <div
                                className={`flex-1 flex items-center gap-2 border border-dashed rounded-md px-3 py-2 cursor-pointer transition-colors ${dragOver ? 'border-[#1a73e8] bg-[#e8f0fe]' : 'border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8fbff]'}`}
                                onClick={() => excelInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <FileText className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
                                {excelFile ? (
                                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                                        <span className="text-sm text-[#202124] font-medium truncate max-w-[160px]">{excelFile.name}</span>
                                        <span className="text-xs text-[#5f6368]">{formatSize(excelFile.size)}</span>
                                        {excelSummary && (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full border border-[#ceead6]">
                                                ✓ {excelSummary.count} email{excelSummary.count !== 1 ? 's' : ''} imported
                                            </span>
                                        )}
                                        <button type="button"
                                            onClick={e => { e.stopPropagation(); setExcelFile(null); setExcelSummary(null); }}
                                            className="ml-auto text-[#5f6368] hover:text-[#ea4335] rounded-full p-0.5 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-sm text-[#5f6368]">Upload Excel / CSV with email IDs <span className="text-[#1a73e8]">Browse</span></span>
                                )}
                            </div>
                            <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                                onChange={e => handleExcelUpload(e.target.files?.[0])} />
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center border border-[#dadce0] rounded-lg focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] transition-all overflow-hidden">
                        <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wide px-3 py-3 border-r border-[#f0f0f0] bg-[#fafafa] w-16 flex-shrink-0">Subject</span>
                        <input
                            type="text"
                            placeholder="Enter email subject…"
                            className="flex-1 px-3 py-3 outline-none bg-transparent text-sm text-[#202124] placeholder-[#9aa0a6]"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    {/* Body */}
                    <div className="border border-[#dadce0] rounded-lg focus-within:border-[#1a73e8] focus-within:ring-1 focus-within:ring-[#1a73e8] transition-all">
                        <textarea
                            placeholder="Write your message here…"
                            className="w-full p-4 outline-none resize-none bg-transparent text-sm text-[#202124] placeholder-[#9aa0a6] min-h-[180px] md:min-h-[220px]"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            required
                        />

                        {/* Attachment previews */}
                        {attachments.length > 0 && (
                            <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-[#f0f0f0] pt-3">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="relative group flex items-center gap-1.5 bg-[#f1f3f4] rounded-lg overflow-hidden pr-2" style={{ maxWidth: 160 }}>
                                        {isImage(file) ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-10 h-10 object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 flex items-center justify-center bg-[#e8f0fe] flex-shrink-0">
                                                <Paperclip className="w-4 h-4 text-[#1a73e8]" />
                                            </div>
                                        )}
                                        <div className="min-w-0 py-1">
                                            <p className="text-xs font-medium text-[#202124] truncate" style={{ maxWidth: 90 }}>{file.name}</p>
                                            <p className="text-xs text-[#5f6368]">{formatSize(file.size)}</p>
                                        </div>
                                        <button type="button" onClick={() => removeAttachment(idx)}
                                            className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5 text-[#5f6368] hover:text-[#ea4335] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bottom toolbar */}
                        <div className="flex items-center justify-between px-3 py-2 border-t border-[#f0f0f0]">
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => attachInputRef.current?.click()}
                                    title="Attach image or file"
                                    className="ripple flex items-center gap-1.5 text-[#5f6368] hover:text-[#1a73e8] px-2 py-1.5 rounded-full text-xs font-medium transition-colors">
                                    <Image className="w-4 h-4" />
                                    <span className="hidden sm:inline">Attach Photo</span>
                                </button>
                                <input ref={attachInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden"
                                    onChange={e => handleAttachmentUpload(e.target.files)} />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`ripple flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] disabled:text-[#9aa0a6] text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow active:scale-[0.98] ${loading ? 'cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Sending…</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Bulk Mail</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MailComposer;
