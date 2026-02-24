const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multer = require("multer");
const dns = require("dns");
const util = require("util");
const resolve4 = util.promisify(dns.resolve4);
const EmailLog = require("../models/EmailLog");
const Settings = require("../models/Settings");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const createTransporter = (emailUser, emailPass, ipAddress) => {
    return nodemailer.createTransport({
        host: ipAddress,
        port: 465,
        secure: true,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        tls: {
            servername: "smtp.gmail.com"
        }
    });
};

router.post("/send", upload.array('attachments'), async (req, res) => {
    let { subject, body, recipients } = req.body;

    let recipientArray = [];
    if (typeof recipients === 'string') {
        recipientArray = recipients.split(',').map(email => email.trim()).filter(email => email !== '');
    } else if (Array.isArray(recipients)) {
        recipientArray = recipients;
    }

    if (!subject || !body || recipientArray.length === 0) {
        return res.status(400).json({ msg: "Please provide all required fields." });
    }

    try {
        const settings = await Settings.findOne();
        if (!settings || !settings.emailUser || !settings.emailPass) {
            return res.status(400).json({ msg: "SMTP Credentials not configured. Please add them in Settings." });
        }

        // Force IPv4 lookup for Render compatibility
        const addresses = await resolve4("smtp.gmail.com");
        const ipv4 = addresses[0];

        const transporter = createTransporter(settings.emailUser, settings.emailPass, ipv4);

        const mailAttachments = req.files ? req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype
        })) : [];

        const mailOptions = {
            from: settings.emailUser,
            to: recipientArray.join(", "),
            subject: subject,
            text: body,
            attachments: mailAttachments
        };

        const info = await transporter.sendMail(mailOptions);

        const log = new EmailLog({
            subject,
            body,
            recipients: recipientArray,
            status: "Success",
        });
        await log.save();

        res.json({ msg: "Emails sent successfully!", logDetails: info });
    } catch (err) {
        console.error("Email sending error:", err);

        const log = new EmailLog({
            subject,
            body,
            recipients: recipientArray,
            status: "Failure",
            errorMessage: err.message,
        });
        await log.save();

        res.status(500).json({ msg: "Failed to send emails", error: err.message });
    }
});

router.get("/history", async (req, res) => {
    try {
        const history = await EmailLog.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
