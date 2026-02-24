import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const sendMail = (formData) =>
    api.post('/mail/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getHistory = () => api.get('/mail/history');

export default api;
