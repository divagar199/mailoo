const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const EmailHistory = require('../models/EmailHistory');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

exports.sendMail = async (req, res) => {
    const { subject, body } = req.body;
    const files = req.files || {};
    const excelFile = files.excelFile ? files.excelFile[0] : null;
    const attachmentFiles = files.attachments || [];

    let recipients = [];

    if (req.body.recipients) {
        const raw = Array.isArray(req.body.recipients)
            ? req.body.recipients.join(',')
            : req.body.recipients;
        recipients = raw
            .split(/[\s,]+/)
            .map(e => e.trim())
            .filter(e => e !== '');
    }

    if (excelFile) {
        try {
            const workbook = XLSX.read(excelFile.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            jsonData.forEach(row => {
                if (Array.isArray(row)) {
                    row.forEach(cell => {
                        const val = String(cell || '').trim();
                        if (emailRegex.test(val)) {
                            recipients.push(val);
                        }
                    });
                }
            });
            recipients = [...new Set(recipients)];
        } catch (err) {
            return res.status(400).json({ error: 'Failed to parse Excel file: ' + err.message });
        }
    }

    if (!recipients || recipients.length === 0) {
        return res.status(400).json({ error: 'No valid recipients found. Provide emails or upload a valid Excel file.' });
    }

    if (!subject || !body) {
        return res.status(400).json({ error: 'Subject and Body are required' });
    }

    const attachmentsMeta = attachmentFiles.map(f => ({ filename: f.originalname, size: f.size }));

    const nodemailerAttachments = attachmentFiles.map(f => ({
        filename: f.originalname,
        content: f.buffer,
        contentType: f.mimetype,
    }));

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            bcc: recipients.join(','),
            subject: subject,
            text: body,
            html: `<div style="font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #202124;">${body.replace(/\n/g, '<br>')}</div>`,
            attachments: nodemailerAttachments,
        };

        const info = await transporter.sendMail(mailOptions);

        const historyRecord = new EmailHistory({
            subject,
            body,
            recipients,
            attachments: attachmentsMeta,
            status: 'success'
        });
        await historyRecord.save();

        res.status(200).json({
            success: true,
            message: 'Emails sent successfully',
            recipientCount: recipients.length,
            accepted: info.accepted,
            rejected: info.rejected
        });
    } catch (error) {
        console.error('Error sending email:', error);
        try {
            const historyRecord = new EmailHistory({
                subject,
                body,
                recipients,
                attachments: attachmentsMeta,
                status: 'failed',
                errorMessage: error.message
            });
            await historyRecord.save();
        } catch (dbError) {
            console.error('Also failed to save email history:', dbError);
        }

        res.status(500).json({
            error: 'Failed to send emails',
            details: error.message
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await EmailHistory.find().sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch email history' });
    }
};
