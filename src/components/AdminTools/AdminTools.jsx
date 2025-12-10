// src/components/AdminTools/AdminTools.jsx
import React, { useState } from 'react';
import { useAdminMode } from '../../hooks/useAdminMode';
import ArtUploader from '../ArtUploader/ArtUploader.jsx';
import AdminPanel from '../Admin/AdminPanel.jsx';
import './AdminTools.css';

const AdminTools = () => {
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const isAdmin = useAdminMode(); // Our secret check

  const toggleAnalyzer = () => {
    setIsAnalyzerOpen(!isAnalyzerOpen);
  };

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(!isAdminPanelOpen);
  };

  // If we are not in admin mode, this component renders nothing.
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <button className="admin-fab" onClick={toggleAnalyzer} title="Open Artwork Analyzer">
        ✨
      </button>
      <button className="admin-panel-fab" onClick={toggleAdminPanel} title="Open Admin Panel">
        ⚙️
      </button>

      <ArtUploader
        isOpen={isAnalyzerOpen}
        onClose={toggleAnalyzer}
      />
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={toggleAdminPanel}
      />
    </>
  );
};

export default AdminTools;