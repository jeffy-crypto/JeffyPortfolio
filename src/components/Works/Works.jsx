import React, { useEffect, useRef, useState } from 'react';
import initializeGallery from './galleryLogic.js';
import ChoiceModal from '../ChoiceModal/ChoiceModal.jsx'; 
import IIIFViewer from '../IIIFViewer/IIIFViewer.jsx';   
import { supabase } from '../../supabaseClient'; 
import './Works.css';

const Works = () => {
  const galleryContainerRef = useRef(null);

  // State for artworks from Supabase
  const [artworks, setArtworks] = useState([]);
  const [IMAGE_DATA, setIMAGE_DATA] = useState({});

  // Modal and Viewer States
  const [selectedIiifUrl, setSelectedIiifUrl] = useState(null);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);

  // Fetch artworks
  useEffect(() => {
    const fetchArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setArtworks(data);
        const imageData = {};
        data.forEach((artwork) => {
          const key = `artwork${artwork.id}`;
          imageData[key] = {
            // We use the same URL for everything since these are static images
            iiifUrl: artwork.image_url, 
            liveUrl: artwork.image_url, 
            thumbnail: artwork.image_url, 
            tags: ["Artwork"], 
            colorPalette: ["#000000", "#ffffff"] 
          };
        });
        setIMAGE_DATA(imageData);
      }
    };

    fetchArtworks();
  }, []);

  // Initialize Gallery
  useEffect(() => {
    let galleryInstance;

    const handleImageClick = (imageKey) => {
      const data = IMAGE_DATA[imageKey];
      if (data) {
        setSelectedImageData(data);
        setIsChoiceModalOpen(true);
      }
    };

    if (galleryContainerRef.current && Object.keys(IMAGE_DATA).length > 0) {
      const imageUrls = Object.values(IMAGE_DATA).map(data => data.thumbnail);
      const imageKeys = Object.keys(IMAGE_DATA);
      // Pass data to the 3D gallery
      galleryInstance = initializeGallery(galleryContainerRef.current, handleImageClick, imageUrls, imageKeys);
    }

    return () => {
      if (galleryInstance) {
        galleryInstance.destroy();
      }
    };
  }, [IMAGE_DATA]);

  // Button Handlers
  const handleViewDetail = () => {
    if (selectedImageData) {
      // Pass the URL to the viewer state
      setSelectedIiifUrl(selectedImageData.iiifUrl);
      // Close the Choice Modal so the Viewer can take over
      setIsChoiceModalOpen(false);
    }
  };

  const handleVisitLink = () => {
    if (selectedImageData) {
      window.open(selectedImageData.liveUrl, '_blank');
      setIsChoiceModalOpen(false);
    }
  };

  const closeChoiceModal = () => {
    setIsChoiceModalOpen(false);
  }

  return (
    <section id="works" className="section gradient-section">
      <div className="section-content">
        <h2 className="section-title">My Works</h2>
        <div
          ref={galleryContainerRef}
          id="gallery-container"
          style={{ height: '600px', position: 'relative', width: '100%' }}
        ></div>
      </div>

      <ChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={closeChoiceModal}
        onView={handleViewDetail}
        onVisit={handleVisitLink}
        imageData={selectedImageData}
      />

      {/* Render the Viewer when a URL is selected */}
      {selectedIiifUrl && (
        <IIIFViewer 
          tileSource={selectedIiifUrl} 
          onClose={() => setSelectedIiifUrl(null)} 
        />
      )}
    </section>
  );
};

export default Works;