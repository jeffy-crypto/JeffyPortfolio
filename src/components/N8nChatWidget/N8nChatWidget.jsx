// src/components/Chatbot/Chatbot.jsx

import React, { useEffect } from 'react';
import { createChat } from '@n8n/chat';

const N8nChatWidget = () => {
  useEffect(() => {
    // The delay is still a good practice for preventing layout breaks.
    const timer = setTimeout(() => {
      const chat = createChat({
        rootElement: document.getElementById('n8n-chat-root'), // Keep this!
        webhookUrl: 'https://jefersonpangan.app.n8n.cloud/webhook/d5cca8b5-0ef8-48bf-b3c0-5392de15bc19/chat',
        initialMessages: ['Hi! I\'m JefBot...'], // Your message here
        i18n: { /* ... Your text here ... */ },
        // No 'button' or 'chatWindow' style properties are needed here.
      });

      window.n8nChatInstance = chat;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.n8nChatInstance) {
        window.n8nChatInstance.destroy();
        delete window.n8nChatInstance;
      }
    };
  }, []);

  return null;
};

export default N8nChatWidget;