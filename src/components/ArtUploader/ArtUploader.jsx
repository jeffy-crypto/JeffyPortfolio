import React, { useState } from 'react';
import './ArtUploader.css';

const ArtUploader = ({ isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // --- 1. CLIENT-SIDE COLOR EXTRACTION LOGIC ---
  const extractColors = (imgElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    
    // Draw image to canvas to read pixels
    ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    const colorMap = {};
    let totalR = 0, totalG = 0, totalB = 0;
    
    // Sample every 10th pixel to save performance
    for (let i = 0; i < imageData.length; i += 40) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      totalR += r;
      totalG += g;
      totalB += b;

      // Quantize colors (group similar colors) to reduce noise
      const key = `${Math.round(r / 20) * 20},${Math.round(g / 20) * 20},${Math.round(b / 20) * 20}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Sort colors by frequency
    const sortedColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);
    
    // Pick top 5 colors and convert to Hex
    const palette = sortedColors.slice(0, 5).map(rgbStr => {
      const [r, g, b] = rgbStr.split(',').map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    });

    // Calculate Brightness for Tags
    const avgBrightness = (totalR + totalG + totalB) / (imageData.length / 4 * 3);
    
    return { palette, avgBrightness };
  };

  // --- 2. TAG GENERATION (Simulation based on image stats) ---
  const generateTags = (brightness) => {
    const tags = ["Digital Art", "Portfolio"];
    
    // Logic based on image properties
    if (brightness < 80) tags.push("Dark", "Moody", "Night");
    else if (brightness > 180) tags.push("Bright", "Minimalist", "High Key");
    else tags.push("Vibrant", "Balanced", "Detailed");

    // Random "AI" Tags to simulate detection
    const aiKeywords = ["Concept Art", "Illustration", "3D Render", "Character Design", "Environment", "Abstract", "Surrealism", "Cyberpunk", "Fantasy"];
    const randomTags = aiKeywords.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return [...tags, ...randomTags];
  };

  const handleAnalyze = () => {
    if (!imageUrl) {
      setError('Please paste an image URL first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    // Create an image element to load the URL
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Crucial for reading pixels from external URLs
    img.src = imageUrl;

    img.onload = () => {
      try {
        const { palette, avgBrightness } = extractColors(img);
        const tags = generateTags(avgBrightness);

        // Simulate a short delay to feel like "AI Processing"
        setTimeout(() => {
          setAnalysisResult({
            tags: tags,
            colorPalette: palette
          });
          setIsLoading(false);
        }, 1500);
      } catch (err) {
        console.error(err);
        setError('Could not analyze this image. (CORS restriction likely). Try an image from Supabase or Unsplash.');
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load image. Check the URL.');
      setIsLoading(false);
    };
  };

  return (
    <div className="uploader-overlay" onClick={onClose}>
      <div className="uploader-content" onClick={(e) => e.stopPropagation()}>
        <button className="uploader-close-btn" onClick={onClose}>×</button>
        <h2>Artwork Analyzer</h2>
        <p>Paste an image URL to extract a color palette and generate tags.</p>
        
        <div className="input-group">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., https://your-supabase-url.com/image.png"
          />
          <button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze Artwork'}
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        {analysisResult && (
          <div className="results-container fade-in">
            <h3>Analysis Complete!</h3>
            
            <div className="result-section">
              <h4>Dominant Palette:</h4>
              <div className="palette">
                {analysisResult.colorPalette.map(hex => (
                  <div key={hex} className="color-swatch" style={{ backgroundColor: hex }} title={hex}>
                    <span className="swatch-text">{hex}</span>
                  </div>
                ))}
              </div>
              <div className="code-snippet">
                 <pre>{JSON.stringify(analysisResult.colorPalette)}</pre>
                 <button className="copy-btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(analysisResult.colorPalette))}>Copy</button>
              </div>
            </div>

            <div className="result-section">
              <h4>Generated Tags:</h4>
              <div className="tags-list">
                {analysisResult.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
              <div className="code-snippet">
                 <pre>{JSON.stringify(analysisResult.tags)}</pre>
                 <button className="copy-btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(analysisResult.tags))}>Copy</button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ArtUploader;