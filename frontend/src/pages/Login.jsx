import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';
import '../index.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

        try {
            const res = await axios.post(`http://localhost:5001${endpoint}`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-main)', position: 'relative', overflow: 'hidden'
        }}>

            {/* Main Container */}
            <div className="card animate-fade-in" style={{
                width: '100%', maxWidth: '440px', padding: '40px', zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px'
                    }}>
                        <Mail size={48} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 400, color: 'var(--text-primary)' }}>
                        {isLogin ? 'Sign in' : 'Create an account'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'to continue to Mailoo' : 'to start sending emails'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'var(--danger-bg)', color: 'var(--danger-text)',
                        padding: '12px 16px', borderRadius: '8px', marginBottom: '24px',
                        fontSize: '0.9rem', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '12px', width: '100%' }} disabled={isLoading}>
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Processing...
                            </span>
                        ) : (
                            <>
                                {isLogin ? 'Next' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{
                            background: 'none', border: 'none', color: 'var(--primary)',
                            fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem'
                        }}
                    >
                        {isLogin ? 'Create account' : 'Sign in instead'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;
