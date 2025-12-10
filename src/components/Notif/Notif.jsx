// src/components/Notif/Notif.jsx

import React, { useState, useEffect } from 'react';
import './Notif.css'; // <-- Updated import path

// --- UPDATED COMPONENT NAME ---
const Notif = ({ message, type, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, onDone]);

  if (!message) return null;

  // --- UPDATED CLASS NAME ---
  return (
    <div className={`notif ${type} ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
};

export default Notif; // <-- Updated export