import React, { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes } from 'react-icons/fa'; // Import icons
import './Chatbot.css';

const generateBotResponse = (userInput) => {
  const input = userInput.toLowerCase();
  // ... (Keep your existing response logic here) ...
  if (input.includes('hello') || input.includes('hi')) return "Hello! Ask about 'services', 'projects', or 'contact'.";
  return "I'm not sure. Try asking about 'services' or 'contact'.";
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const botResponse = { text: generateBotResponse(inputValue), sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputValue('');
  };

  return (
    <>
      {/* Updated Button with Icons */}
      <button className="chatbot-button" onClick={toggleChat}>
        <span className="chatbot-icon">
            {isOpen ? <FaTimes size={20} /> : <FaCommentDots size={22} />}
        </span>
      </button>

      {/* Keep the rest of your chat window logic exactly the same */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Chat Assistant</h3>
        </div>
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask a question..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;