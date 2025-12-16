import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { supabase } from '../../supabaseClient';
import { FaGithub, FaLinkedin, FaTwitter, FaLink } from 'react-icons/fa';
import Notif from '../Notif/Notif.jsx';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [socialLinks, setSocialLinks] = useState([]);

  // Fetch Social Links from Supabase
  useEffect(() => {
    const fetchSocials = async () => {
      const { data } = await supabase.from('social_links').select('*');
      if (data) setSocialLinks(data);
    };
    fetchSocials();
  }, []);

  const getIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'github': return <FaGithub />;
      case 'linkedin': return <FaLinkedin />;
      case 'twitter': return <FaTwitter />;
      default: return <FaLink />;
    }
  };

  // --- THE FIXED SUBMIT FUNCTION ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    // 1. Prepare Data
    const formData = new FormData(form.current);
    const name = formData.get('from_name');
    const email = formData.get('from_email');
    const message = formData.get('message');

    try {
      // ---------------------------------------------
      // PART A: Save to Supabase (For Admin Dashboard)
      // ---------------------------------------------
      const { error: dbError } = await supabase
        .from('messages')
        .insert([{ name, email, message }]);

      if (dbError) {
        console.error("Supabase Error:", dbError.message);
        // We do NOT stop here, we still try to send the email
      }

      // ---------------------------------------------
      // PART B: Send to Email (via EmailJS)
      // ---------------------------------------------
      const result = await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('EmailJS Success:', result.text);
      setNotification({ message: 'Message sent successfully!', type: 'success' });
      form.current.reset();

    } catch (error) {
      console.error('EmailJS Error:', error);
      // Even if email fails, if Supabase worked, we might want to tell the user it worked, 
      // or tell them to try again. Here we show a generic error.
      setNotification({ message: 'Failed to send email. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Notif 
        message={notification.message} 
        type={notification.type} 
        onDone={() => setNotification({ message: '', type: '' })} 
      />

      <section id="contact" className="section gradient-section">
        <div className="section-content">
          <h2 className="section-title">Let's Create Together</h2>
          
          <form ref={form} className="contact-form" onSubmit={handleSendMessage}>
            {/* IMPORTANT: The 'name' attributes must match your EmailJS Template variables */}
            <input type="text" name="from_name" placeholder="Your Name" required />
            <input type="email" name="from_email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Tell me about your project" rows="5" required></textarea>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? <div className="loader"></div> : 'Send Message'}
            </button>
          </form>

          <div className="social-media-links">
            {socialLinks.map((link) => (
              link.url ? (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {getIcon(link.platform)}
                </a>
              ) : null
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;