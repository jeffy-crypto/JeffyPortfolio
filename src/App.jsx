import React, { useState, useEffect } from 'react';

import Header from './components/Header/Header';
import NavBar from './components/NavBar/NavBar';
import Content from './components/Content/Content';
import About from './components/About/About';
import Works from './components/Works/Works';
import Clients from './components/Clients/Clients';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import ArtUploader from './components/ArtUploader/ArtUploader.jsx';
import AdminTools from './components/AdminTools/AdminTools.jsx';
import FloatingButtons from './components/FloatingButtons/FloatingButtons.jsx';
import './index.css';


function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Start in dark mode to match original

  // Toggle theme and apply class to body
  useEffect(() => {
    // We use isDarkMode for the toggle, but the CSS uses light-mode for overrides
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const animatedElements = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1 }
    );
    animatedElements.forEach((el) => observer.observe(el));
    return () => animatedElements.forEach((el) => observer.unobserve(el));
  }, []);

  // RESTORED: Custom cursor with reveal effect
  useEffect(() => {
    const cursor = document.querySelector('.cursor');
    const bgb1Overlay = document.getElementById('bgb1-cursor-overlay');
    
    if (!cursor || !bgb1Overlay) return;

    let revealActive = false;

    const handleMouseMove = e => {
        cursor.style.top = `${e.clientY}px`;
        cursor.style.left = `${e.clientX}px`;
        
        if (revealActive) {
            const cursorRadius = 75; // Grow size
            bgb1Overlay.style.maskImage = `radial-gradient(circle ${cursorRadius}px at ${e.clientX}px ${e.clientY}px, white 99%, transparent 100%)`;
            bgb1Overlay.style.webkitMaskImage = `radial-gradient(circle ${cursorRadius}px at ${e.clientX}px ${e.clientY}px, white 99%, transparent 100%)`;
        }
    };

    const handleMouseDown = e => {
        const homeSection = document.getElementById('home');
        if (homeSection && homeSection.contains(e.target) && !e.target.closest('a, button')) {
            revealActive = true;
            cursor.classList.add('cursor-grow');
            bgb1Overlay.style.display = 'block';
            
            // Initial mask application
            const cursorRadius = 75;
            bgb1Overlay.style.maskImage = `radial-gradient(circle ${cursorRadius}px at ${e.clientX}px ${e.clientY}px, white 99%, transparent 100%)`;
            bgb1Overlay.style.webkitMaskImage = `radial-gradient(circle ${cursorRadius}px at ${e.clientX}px ${e.clientY}px, white 99%, transparent 100%)`;
        }
    };
    
    const handleMouseUp = () => {
        revealActive = false;
        cursor.classList.remove('cursor-grow');
        bgb1Overlay.style.display = 'none';
        bgb1Overlay.style.maskImage = 'none';
        bgb1Overlay.style.webkitMaskImage = 'none';
    };

    // Grow effect for hoverable elements
    const handleMouseEnter = () => cursor.classList.add('cursor-grow');
    const handleMouseLeave = () => { if(!revealActive) cursor.classList.remove('cursor-grow'); };
    const hoverableElements = document.querySelectorAll('a, button, input, textarea, .neumorphic-toggle-switch');

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    hoverableElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      hoverableElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(prevMode => !prevMode);

  return (
    <>
      {/* These two elements are crucial for the cursor effects */}
      <div id="bgb1-cursor-overlay"></div>
      <div className="cursor"></div>


      <NavBar isDarkMode={isDarkMode} />
      <Header isDarkMode={isDarkMode} />
      
      <main>
        <Content /> 
        <div className="white-separator">
          <About />
          <Works />
          <Clients />
          <Contact />
        </div>
      </main>
      
      <ArtUploader />
      <AdminTools />
      <Footer />
      <FloatingButtons />

      <label className="neumorphic-toggle-switch">
        <ThemeToggle 
        isDarkMode={isDarkMode} 
        onToggle={toggleTheme} 
      />

      
      
        {/* The rest of your toggle switch HTML (track, thumb, etc.) */}
      </label>
    </>
  );
  
}


export default App;