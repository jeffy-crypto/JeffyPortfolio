import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. IMPORT THIS
import TiltedCard from '../TiltedCard/TiltedCard';
import { supabase } from '../../supabaseClient';
import './Client.css';

const Clients = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', quote: '', rating: 5 });
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleNext = () => setCurrentIndex((p) => (p + 1) % reviews.length);
  const handlePrev = () => setCurrentIndex((p) => (p - 1 + reviews.length) % reviews.length);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('reviews').insert([{ 
        author: newReview.author, 
        quote: newReview.quote,
        rating: newReview.rating,
        image_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    }]);

    if (!error) {
      alert('Review added!');
      setNewReview({ author: '', quote: '', rating: 5 });
      setIsModalOpen(false);
      fetchReviews();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  const renderStars = (count) => (
    <div className="star-rating-display">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < count ? "star filled" : "star"}>★</span>
      ))}
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;
    
    // 2. USE PORTAL TO FORCE CENTER ON SCREEN
    return createPortal(
      <div className="review-modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <input 
              type="text" placeholder="Your Name" value={newReview.author} 
              onChange={(e) => setNewReview({...newReview, author: e.target.value})} required 
            />
            
            <div className="modal-star-input">
              <label>Rating: </label>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={star <= newReview.rating ? "star filled" : "star"}
                  onClick={() => setNewReview({...newReview, rating: star})}
                  style={{cursor: 'pointer', fontSize: '1.5rem'}}
                >★</span>
              ))}
            </div>

            <textarea 
              placeholder="Your Review..." rows="4" value={newReview.quote} 
              onChange={(e) => setNewReview({...newReview, quote: e.target.value})} required
            ></textarea>
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Submit'}</button>
          </form>
        </div>
      </div>,
      document.body // This places the modal at the very end of the HTML body
    );
  };

  // Safe Render Logic
  const hasReviews = reviews.length > 0;
  const currentReview = hasReviews 
    ? reviews[currentIndex] 
    : { id: 'placeholder', author: 'Future Client', quote: 'Be the first to leave a review!', rating: 5, image_url: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };

  return (
    <section id="clients" className="section">
      <div className="section-content">
        <h2 className="section-title center-title">Reviews</h2>

        <div className="review-slider-container">
          {hasReviews && (
            <button className="slider-arrow" onClick={handlePrev}><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg></button>
          )}

          <div className="card-stage">
            <TiltedCard
              key={currentReview.id} 
              imageSrc={currentReview.image_url}
              altText={`Review from ${currentReview.author}`}
              containerHeight="100%" containerWidth="100%" imageHeight="100%" imageWidth="100%"
              rotateAmplitude={12} scaleOnHover={1.1} displayOverlayContent={true} showTooltip={false}
              overlayContent={
                <>
                  {renderStars(currentReview.rating || 5)}
                  <p className="overlay-quote">"{currentReview.quote}"</p>
                  <p className="overlay-author">- {currentReview.author}</p>
                </>
              }
            />
          </div>

          {hasReviews && (
            <button className="slider-arrow" onClick={handleNext}><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg></button>
          )}
        </div>

        <div className="add-review-container">
            <button className="add-review-btn" onClick={() => setIsModalOpen(true)}>+ Add Yours</button>
        </div>

        {renderModal()}
      </div>
    </section>
  );
};

export default Clients;