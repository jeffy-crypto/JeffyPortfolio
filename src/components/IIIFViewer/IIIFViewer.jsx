import React, { useEffect } from 'react';
import OpenSeadragon from 'openseadragon';
import './IIIFViewer.css';

const IIIFViewer = ({ tileSource, onClose }) => {
  
  // 1. We use useEffect to initialize the non-React OpenSeadragon library
  useEffect(() => {
    // If there is no image to show, do nothing
    if (!tileSource) return;

    // 2. Initialize the Viewer
    const viewer = OpenSeadragon({
      id: "openseadragon-viewer", // Matches the ID of the div below
      prefixUrl: "https://openseadragon.github.io/openseadragon/images/", // Icons for zoom buttons
      
      // 3. CRITICAL CONFIGURATION for Static Images (Supabase/JPEGs)
      // Standard URLs are not "Deep Zoom" tiles by default. 
      // We must tell OSD this is a single 'image'.
      tileSources: {
        type: 'image',
        url: tileSource,
        buildPyramid: false
      },
      
      // 4. Animation & UX settings
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 2,
      minZoomImageRatio: 0.5,
      visibilityRatio: 1,
      zoomPerScroll: 2,
      showNavigator: true,
      
      // 5. Allow Cross-Origin images (Required for Supabase)
      crossOriginPolicy: "Anonymous", 
    });

    // 6. Cleanup: Destroy viewer when component unmounts or image changes
    return () => {
      viewer.destroy();
    };
  }, [tileSource]);

  if (!tileSource) return null;

  return (
    <div className="iiif-viewer-overlay" onClick={onClose}>
      <div className="iiif-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="iiif-close-button" onClick={onClose}>×</button>
        
        {/* 
           This empty DIV is the target for OpenSeadragon.
           The library will inject the canvas and controls into here.
        */}
        <div id="openseadragon-viewer"></div>
      </div>
    </div>
  );
};

export default IIIFViewer;