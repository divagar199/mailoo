const express = require('express');
const router = express.Router();
const multer = require('multer');
const mailController = require('../controllers/mailController');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }
});

const uploadFields = upload.fields([
    { name: 'excelFile', maxCount: 1 },
    { name: 'attachments', maxCount: 10 }
]);

router.post('/send', uploadFields, mailController.sendMail);
router.get('/history', mailController.getHistory);

module.exports = router;
