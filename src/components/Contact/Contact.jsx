// src/components/Contact/Contact.jsx

import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
// --- UPDATED IMPORT ---
import Notif from '../Notif/Notif.jsx'; 
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [isLoading, setIsLoading] = useState(false);
  // --- STATE VARIABLE RENAMED FOR CLARITY ---
  const [notification, setNotification] = useState({ message: '', type: '' });

  const sendEmail = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (result) => {
          console.log('SUCCESS!', result.text);
          setNotification({ message: 'Message sent successfully!', type: 'success' });
          form.current.reset();
        },
        (error) => {
          console.log('FAILED...', error.text);
          setNotification({ message: 'Failed to send message. Please try again.', type: 'error' });
        }
      )
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {/* --- UPDATED COMPONENT USAGE --- */}
      <Notif 
        message={notification.message} 
        type={notification.type} 
        onDone={() => setNotification({ message: '', type: '' })}
      />

      <section id="contact" className="section gradient-section">
        <div className="section-content">
          {/* ...the rest of your component is the same... */}
          <h2 className="section-title">Let's Create Together</h2>
          <form ref={form} className="contact-form" onSubmit={sendEmail}>
            <input type="text" name="from_name" placeholder="Your Name" required />
            <input type="email" name="from_email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Tell me about your project" rows="5" required></textarea>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <div className="loader"></div> : 'Send Message'}
            </button>
          </form>
          <div className="social-media-links">
            <a href="YOUR_GITHUB_LINK_HERE" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="YOUR_LINKEDIN_LINK_HERE" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="YOUR_TWITTER_LINK_HERE" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;