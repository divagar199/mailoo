import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, History, LogOut, Settings as SettingsIcon } from 'lucide-react';
import '../index.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const closeSidebar = () => {
        if (setIsOpen) setIsOpen(false);
    };

    return (
        <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
                <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={32} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>Mailoo</h2>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <Mail size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/history" onClick={closeSidebar} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <History size={20} />
                    <span>Sent History</span>
                </NavLink>

                <NavLink to="/settings" onClick={closeSidebar} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <SettingsIcon size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <button
                onClick={handleLogout}
                className="sidebar-link"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}
            >
                <LogOut size={20} />
                <span>Logout</span>
            </button>

        </div>
    );
};

export default Sidebar;
