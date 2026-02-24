require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mailRoutes = require('./routes/mailRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/mail', mailRoutes);

app.get('/', (req, res) => {
    res.send('Mailoo API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
