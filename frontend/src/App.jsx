import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Send, Clock, Menu, X, Mail } from 'lucide-react';
import MailComposer from './components/MailComposer';
import MailHistory from './components/MailHistory';

const navLinks = [
  { to: '/', icon: Send, label: 'Compose' },
  { to: '/history', icon: Clock, label: 'History' },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside className={`
                fixed top-0 left-0 h-full bg-white z-30 flex flex-col transition-transform duration-300
                border-r border-[#e0e0e0] w-64
                ${mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}
                md:relative md:translate-x-0 md:shadow-none md:z-auto
            `}>
        {/* Logo header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a73e8] rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-medium text-[#202124]" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
              Mailoo Bulk
            </span>
          </div>
          <button
            className="md:hidden p-1 rounded-full hover:bg-[#f1f3f4] transition-colors text-[#5f6368]"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-4 px-4 py-2.5 rounded-r-full text-sm font-medium transition-colors mb-1
                                ${isActive(to)
                  ? 'bg-[#e8f0fe] text-[#1a73e8]'
                  : 'text-[#202124] hover:bg-[#f1f3f4]'}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive(to) ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-[#e0e0e0]">
          <p className="text-xs text-[#9aa0a6]">Mailoo © 2025</p>
        </div>
      </aside>
    </>
  );
}

function TopBar({ setMobileOpen }) {
  const location = useLocation();
  const current = navLinks.find(l => l.to === location.pathname);
  return (
    <header className="md:hidden flex items-center gap-3 h-16 px-4 bg-white border-b border-[#e0e0e0] flex-shrink-0 sticky top-0 z-10">
      <button
        onClick={() => setMobileOpen(true)}
        className="p-2 -ml-2 rounded-full hover:bg-[#f1f3f4] transition-colors text-[#5f6368]"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#1a73e8] rounded-md flex items-center justify-center">
          <Mail className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-base font-medium text-[#202124]" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
          Mailoo Bulk
        </span>
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="md:hidden flex items-center bg-white border-t border-[#e0e0e0] flex-shrink-0 safe-area-inset-bottom">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors
                        ${isActive(to) ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}
        >
          <div className={`px-6 py-1 rounded-full transition-colors ${isActive(to) ? 'bg-[#e8f0fe]' : ''}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f6f8fc] overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar setMobileOpen={setMobileOpen} />

        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-sm border border-[#e0e0e0] overflow-hidden min-h-full">
            <Routes>
              <Route path="/" element={<MailComposer />} />
              <Route path="/history" element={<MailHistory />} />
            </Routes>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
