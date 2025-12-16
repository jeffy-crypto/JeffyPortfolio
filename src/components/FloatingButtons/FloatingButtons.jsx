import React, { useState } from 'react';
import Chatbot from '../Chatbot/Chatbot.jsx';
import ArtUploader from '../ArtUploader/ArtUploader.jsx';
import { FaMagic } from 'react-icons/fa'; // Import the icon
import './FloatingButtons.css';

const FloatingButtons = () => {
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

  const openAnalyzer = (e) => {
    e.stopPropagation();
    setIsAnalyzerOpen(true);
  };

  const closeAnalyzer = (e) => {
    e.stopPropagation();
    setIsAnalyzerOpen(false);
  };

  return (
    <>
      <div className="floating-buttons-container">
        {/* Updated Button with Icon */}
        <button 
          className="fab analyzer-button" 
          onClick={openAnalyzer} 
          title="Artwork Analyzer"
        >
          <FaMagic size={20} />
        </button>
        
        <Chatbot />
      </div>

      <ArtUploader 
        isOpen={isAnalyzerOpen} 
        onClose={closeAnalyzer} 
      />
    </>
  );
};

export default FloatingButtons;