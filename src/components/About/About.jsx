import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './About.css';

const About = () => {
  const [data, setData] = useState({ 
    about_text: "Loading...", 
    image_url: "https://via.placeholder.com/400" 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profile } = await supabase.from('profile_data').select('*').single();
      if (profile) setData(profile);
    };
    fetchProfile();
  }, []);

  return (
    <section id="about" className="section gradient-section">
      <div className="section-content">
        <h2 className="section-title" style={{ marginTop: 0 }}>About Me</h2>
        <div className="about-content">
          <img 
            src={data.image_url} 
            alt="Artist Profile" 
            className="about-image" 
          />
          <div className="about-text">
            <p>{data.about_text}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;