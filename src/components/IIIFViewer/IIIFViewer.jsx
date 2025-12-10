import React from 'react';
import OpenSeadragonViewer from 'openseadragon';
import './IIIFViewer.css';

const IIIFViewer = ({ tileSource, onClose }) => {
  if (!tileSource) return null;

  return (
    <div className="iiif-viewer-overlay" onClick={onClose}>
      <div className="iiif-viewer-content" onClick={(e) => e.stopPropagation()}>
        <button className="iiif-close-button" onClick={onClose}>×</button>
        <OpenSeadragonViewer
          options={{
            id: 'openseadragon-viewer',
            prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
            tileSources: [tileSource],
            animationTime: 0.5,
            showNavigator: true,
          }}
        />
      </div>
    </div>
  );
};

export default IIIFViewer;