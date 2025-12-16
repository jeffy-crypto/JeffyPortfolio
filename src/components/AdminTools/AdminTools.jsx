import React, { useState, useEffect } from 'react';
import './AdminTools.css';

import {
  DashboardOverview,
  ArtworkManager,
  CategoryManager,
  AssetLibrary,
  ProfileEditor, 
  ReviewManager, 
  ContactManager, 
  MessageViewer,
  AdminSettings
} from './AdminFeatures';

// --- CUSTOM ICONS COMPONENT ---
const Icon = ({ name }) => {
  const commonProps = {
    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { marginRight: '12px', verticalAlign: 'middle' }
  };

  switch (name) {
    case 'dashboard': return (<svg {...commonProps}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
    case 'artworks': return (<svg {...commonProps}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>);
    case 'categories': return (<svg {...commonProps}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>);
    case 'assets': return (<svg {...commonProps}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>);
    case 'profile': return (<svg {...commonProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
    case 'messages': return (<svg {...commonProps}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
    case 'settings': return (<svg {...commonProps}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
    case 'links': return (<svg {...commonProps}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>);
    default: return null;
  }
};

const AdminTools = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    document.body.classList.add('admin-mode-active');
    return () => { document.body.classList.remove('admin-mode-active'); };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const ADMIN_PASSWORD = "jef"; 
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setActiveTab('dashboard');
  };

  // --- Render Login View ---
  if (!isAuthenticated) {
    return (
      <div className="admin-page-container login-mode">
        <div className="admin-login-card">
          <div>
            <h2>ADMIN ACCESS</h2>
            <p className="login-subtitle">Authorized Only</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear error red color as soon as they type again
              }}
              // Add 'error' class if there is an error
              className={`admin-input ${error ? 'error' : ''}`}
              autoFocus
            />
            
            {/* Simple Text Message */}
            {error && <span className="error-text">Incorrect Password</span>}
            
            <button type="submit" className="login-btn">
            Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>PORTFOLIO ADMIN</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><Icon name="dashboard" /> Dashboard</button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}><Icon name="messages" /> Inbox</button>
          <button className={activeTab === 'artworks' ? 'active' : ''} onClick={() => setActiveTab('artworks')}><Icon name="artworks" /> Artworks</button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}><Icon name="profile" /> About Me</button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}><Icon name="messages" /> Reviews</button>
          <button className={activeTab === 'contact' ? 'active' : ''} onClick={() => setActiveTab('contact')}><Icon name="links" /> Social Links</button>
          <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}><Icon name="categories" /> Categories</button>
          <button className={activeTab === 'assets' ? 'active' : ''} onClick={() => setActiveTab('assets')}><Icon name="assets" /> Asset Library</button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Icon name="settings" /> Settings</button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn-sidebar">Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
        {activeTab === 'messages' && <MessageViewer />}
        {activeTab === 'artworks' && <ArtworkManager />}
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'reviews' && <ReviewManager />}
        {activeTab === 'contact' && <ContactManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'assets' && <AssetLibrary />}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};

export default AdminTools;