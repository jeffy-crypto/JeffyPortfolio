import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; 

// ------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW 
// ------------------------------------------------------------------
export const DashboardOverview = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ artworks: 0, reviews: 0, messages: 0, avgRating: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: artCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
      const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false);
      const { data: reviewData } = await supabase.from('reviews').select('rating');
      const revCount = reviewData ? reviewData.length : 0;
      const avg = reviewData && revCount > 0 
        ? (reviewData.reduce((acc, curr) => acc + (curr.rating || 5), 0) / revCount).toFixed(1) 
        : "N/A";

      setStats({ artworks: artCount || 0, reviews: revCount, messages: msgCount || 0, avgRating: avg });
      
      const { data: recentMsgs } = await supabase.from('messages').select('name, created_at').order('created_at', { ascending: false }).limit(3); 
      setRecentActivity(recentMsgs || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-panel fade-in">
      <h2>DASHBOARD OVERVIEW</h2>
      {loading ? <p>Loading analytics...</p> : (
        <>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => setActiveTab('artworks')} style={{cursor:'pointer'}}>
              <h3>{stats.artworks}</h3><p>Total Artworks</p>
            </div>
            <div className="stat-card" onClick={() => setActiveTab('reviews')} style={{cursor:'pointer'}}>
              <h3>{stats.reviews}</h3><p>Client Reviews</p><small style={{color:'#ffd700'}}>★ {stats.avgRating} Avg</small>
            </div>
            <div className={`stat-card ${stats.messages > 0 ? 'unread-alert' : ''}`} onClick={() => setActiveTab('messages')} style={{cursor:'pointer'}}>
              <h3>{stats.messages}</h3><p>Unread Messages</p>
            </div>
            <div className="stat-card action-card" onClick={() => setActiveTab('artworks')}>
              <span style={{fontSize:'2rem'}}>+</span><p>Upload New</p>
            </div>
          </div>
          <div style={{marginTop: '30px', background: '#222', padding: '20px', borderRadius: '8px', color: '#fff'}}>
            <h3 style={{marginTop:0}}>Recent Inquiries</h3>
            {recentActivity.length === 0 ? <p style={{color:'#666'}}>No recent activity.</p> : (
              <ul style={{listStyle:'none', padding:0}}>
                {recentActivity.map((act, i) => (
                  <li key={i} style={{borderBottom:'1px solid #333', padding:'10px 0', display:'flex', justifyContent:'space-between'}}>
                    <span><strong>{act.name}</strong> sent a message.</span>
                    <span style={{color:'#888', fontSize:'0.8rem'}}>{new Date(act.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* Fix: Added dashboard-btn-fix class */}
            <button className="sm-btn dashboard-btn-fix" style={{marginTop:'10px'}} onClick={() => setActiveTab('messages')}>View All Messages →</button>
          </div>
        </>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// 2. MESSAGE VIEWER (Straight Reply)
// ------------------------------------------------------------------
export const MessageViewer = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  };

  const markAsRead = async (id, currentStatus) => {
    const { error } = await supabase.from('messages').update({ is_read: !currentStatus }).eq('id', id);
    if (!error) setMessages(messages.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
  };

  const deleteMessage = async (id) => {
    if(!confirm("Delete this message?")) return;
    await supabase.from('messages').delete().eq('id', id);
    setMessages(messages.filter(m => m.id !== id));
  };

  return (
    <div className="admin-panel fade-in">
      <div className="panel-header">
        <h2>Inbox ({messages.filter(m => !m.is_read).length} Unread)</h2>
        <button className="primary-btn" onClick={fetchMessages}>↻ Refresh</button>
      </div>

      {loading ? <p>Loading messages...</p> : (
        <div className="message-list">
          {messages.length === 0 && <p>No messages found.</p>}
          {messages.map((msg) => (
            <div key={msg.id} style={{
              background: msg.is_read ? '#fff' : '#e6f7ff',
              border: '1px solid #ddd',
              borderLeft: msg.is_read ? '5px solid #ccc' : '5px solid #00d4ff',
              padding: '15px', marginBottom: '10px', borderRadius: '4px', color: '#000'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                <strong>{msg.name} <span style={{fontWeight:'normal', color:'#666'}}>&lt;{msg.email}&gt;</span></strong>
                <span style={{fontSize:'0.8rem', color:'#666'}}>{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p style={{margin: '10px 0', color: '#333'}}>{msg.message}</p>
              
              <div style={{display:'flex', gap:'10px'}}>
                <button className="sm-btn" onClick={() => markAsRead(msg.id, msg.is_read)}>{msg.is_read ? 'Mark Unread' : 'Mark Read'}</button>
                <button className="sm-btn danger" onClick={() => deleteMessage(msg.id)}>Delete</button>
                
                {/* FIX: Straight Reply via Email */}
                <a 
                    href={`mailto:${msg.email}?subject=Re: Inquiry via Portfolio&body=Hi ${msg.name},%0D%0A%0D%0AThank you for your message regarding: "${msg.message.substring(0, 30)}..."`} 
                    className="sm-btn" 
                    style={{textDecoration:'none', background:'#000', color:'#fff'}}
                >
                    Reply via Email ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// 3. ARTWORK MANAGER (With Edit Action)
// ------------------------------------------------------------------
export const ArtworkManager = () => {
  const [view, setView] = useState('list'); 
  const [loading, setLoading] = useState(false);
  const [artworks, setArtworks] = useState([]);
  
  // State handles both New and Edit (id is null for new)
  const [formData, setFormData] = useState({ id: null, title: '', category: 'Illustration', description: '', published: true });
  const [file, setFile] = useState(null);

  useEffect(() => { fetchArtworks(); }, []);

  const fetchArtworks = async () => {
    setLoading(true);
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (data) setArtworks(data);
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if ((!file && !formData.id) || !formData.title) return alert('Please enter a title and select a file.');
    
    try {
      setLoading(true);
      let publicUrl = '';

      // Upload Image logic (only if new file exists)
      if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('portfolio-images').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
      } else if (formData.id) {
          // If editing and no new file, keep old URL
          const existing = artworks.find(a => a.id === formData.id);
          publicUrl = existing.image_url;
      }

      const payload = { 
          title: formData.title, 
          category: formData.category, 
          description: formData.description, 
          image_url: publicUrl, 
          published: formData.published 
      };

      if (formData.id) {
          // UPDATE EXISTING
          const { error } = await supabase.from('artworks').update(payload).eq('id', formData.id);
          if (error) throw error;
          alert('Artwork updated successfully!');
      } else {
          // INSERT NEW
          const { error } = await supabase.from('artworks').insert([payload]);
          if (error) throw error;
          alert('Artwork uploaded successfully!');
      }

      setFormData({ id: null, title: '', category: 'Illustration', description: '', published: true });
      setFile(null);
      setView('list'); 
      fetchArtworks(); 
    } catch (error) { alert('Error: ' + error.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('Delete this artwork?')) return;
    try {
      setLoading(true);
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('portfolio-images').remove([fileName]);
      }
      await supabase.from('artworks').delete().eq('id', id);
      setArtworks(artworks.filter(item => item.id !== id));
    } catch (error) { alert('Error: ' + error.message); } finally { setLoading(false); }
  };

  // FIX: Edit Handler
  const handleEdit = (art) => {
      setFormData({
          id: art.id,
          title: art.title,
          category: art.category || 'Illustration',
          description: art.description || '',
          published: art.published
      });
      setView('form');
  };

  return (
    <div className="admin-panel fade-in">
      <div className="panel-header">
        <h2>Artwork Management</h2>
        <button className="primary-btn" onClick={() => { setView(view === 'list' ? 'form' : 'list'); setFormData({id:null, title:'', category:'Illustration', description:'', published:true}); }}>
          {view === 'list' ? '+ Add Artwork' : '← Back to List'}
        </button>
      </div>
      {view === 'list' ? (
        <div className="artwork-list">
            <table className="admin-table">
            <thead><tr><th>Preview</th><th>Title</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
                {artworks.map((art) => (
                  <tr key={art.id}>
                    <td><img src={art.image_url} alt={art.title} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} /></td>
                    <td><strong>{art.title}</strong></td>
                    <td>{art.category}</td>
                    <td>
                        {/* FIX: Added Edit Button */}
                        <button className="sm-btn" onClick={() => handleEdit(art)}>Edit</button>
                        <button className="sm-btn danger" onClick={() => handleDelete(art.id, art.image_url)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
            </table>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="artwork-form">
            <h3 style={{marginTop:0}}>{formData.id ? 'Edit Artwork' : 'Upload New Artwork'}</h3>
            <div className="form-group"><label>Title</label><input type="text" className="admin-input" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
            <div className="form-group"><label>Category</label><select className="admin-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}><option>Illustration</option><option>UI/UX Design</option><option>Branding</option><option>Concept Art</option></select></div>
            <div className="form-group"><label>Description</label><textarea className="admin-input" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea></div>
            <div className="form-group"><label>Image {formData.id && '(Leave empty to keep current)'}</label><input type="file" className="admin-input" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></div>
            <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : (formData.id ? 'Update' : 'Upload')}</button>
        </form>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// 4. PROFILE EDITOR 
// ------------------------------------------------------------------
export const ProfileEditor = () => {
  const [loading, setLoading] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profile_data').select('*').limit(1).single();
      if (data) {
        setProfileId(data.id);
        setAboutText(data.about_text || '');
        setImageUrl(data.image_url || '');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    let finalUrl = imageUrl;
    if (newImage) {
      const fileName = `profile-${Date.now()}`;
      const { error } = await supabase.storage.from('portfolio-images').upload(fileName, newImage);
      if (!error) {
        const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        finalUrl = data.publicUrl;
      }
    }
    let error;
    if (profileId) {
      const { error: updateError } = await supabase.from('profile_data').update({ about_text: aboutText, image_url: finalUrl }).eq('id', profileId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('profile_data').insert([{ about_text: aboutText, image_url: finalUrl }]);
      error = insertError;
      if (!insertError) window.location.reload();
    }
    setLoading(false);
    if (error) alert('Error: ' + error.message);
    else { alert('Profile updated!'); setImageUrl(finalUrl); }
  };

  return (
    <div className="admin-panel fade-in">
      <h2>Edit About Me</h2>
      <div style={{display:'flex', gap:'20px', alignItems:'start'}}>
        <div style={{width: '150px'}}>
           <img src={imageUrl || 'https://via.placeholder.com/150'} alt="Profile" style={{width:'100%', borderRadius:'8px', marginBottom:'10px', objectFit: 'cover'}} />
        </div>
        <form onSubmit={handleUpdate} style={{flex:1}}>
            <div className="form-group"><label>Change Profile Picture</label><input type="file" className="admin-input" onChange={(e) => setNewImage(e.target.files[0])} /></div>
            <div className="form-group"><label>About Bio</label><textarea className="admin-input" rows="6" value={aboutText} onChange={(e) => setAboutText(e.target.value)}></textarea></div>
            <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Update Profile'}</button>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 5. REVIEW MANAGER
// ------------------------------------------------------------------
export const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ author: '', quote: '', rating: 5, id: null });
  const [file, setFile] = useState(null);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', {ascending: false});
    setReviews(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        let imageUrl = '';
        if (form.id) {
            const existing = reviews.find(r => r.id === form.id);
            if (existing) imageUrl = existing.image_url;
        }
        if (file) {
          const fileName = `review-${Date.now()}`;
          const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }

        const payload = { author: form.author, quote: form.quote, rating: form.rating, image_url: imageUrl };
        if (form.id) await supabase.from('reviews').update(payload).eq('id', form.id);
        else await supabase.from('reviews').insert([payload]);
        
        alert(form.id ? 'Updated!' : 'Added!');
        setForm({ author: '', quote: '', rating: 5, id: null });
        setFile(null);
        setView('list');
        fetchReviews();
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete?")) return;
    await supabase.from('reviews').delete().eq('id', id);
    fetchReviews();
  };

  return (
    <div className="admin-panel fade-in">
      <div className="panel-header">
        <h2>Manage Reviews</h2>
        <button className="primary-btn" onClick={() => { setView(view === 'list' ? 'form' : 'list'); setForm({ author: '', quote: '', rating: 5, id: null }); }}>
          {view === 'list' ? '+ Add Review' : '← Back'}
        </button>
      </div>
      {view === 'list' ? (
        <table className="admin-table">
            <thead><tr><th>Avatar</th><th>Author</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
            {reviews.map(r => (
                <tr key={r.id}>
                <td><img src={r.image_url || 'https://via.placeholder.com/40'} alt="" style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}}/></td>
                <td>{r.author}</td>
                <td style={{color: '#ffd700'}}>{'★'.repeat(r.rating || 5)}</td>
                <td><button className="sm-btn" onClick={() => { setForm(r); setView('form'); }}>Edit</button><button className="sm-btn danger" onClick={() => handleDelete(r.id)}>Del</button></td>
                </tr>
            ))}
            </tbody>
        </table>
      ) : (
        <form onSubmit={handleSubmit} className="artwork-form">
            <div className="form-group"><label>Author Name</label><input className="admin-input" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required /></div>
            <div className="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" className="admin-input" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} required /></div>
            <div className="form-group"><label>Review Quote</label><textarea className="admin-input" rows="3" value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} required /></div>
            <div className="form-group"><label>Reviewer Photo</label><input type="file" className="admin-input" onChange={e => setFile(e.target.files[0])} /></div>
            <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : (form.id ? 'Update' : 'Add')}</button>
        </form>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// 6. CONTACT LINKS MANAGER (Fixed Spacing & Added "Add New")
// ------------------------------------------------------------------
export const ContactManager = () => {
  const [links, setLinks] = useState([]);
  const [newPlatform, setNewPlatform] = useState({ platform: '', url: '' });

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
      const { data } = await supabase.from('social_links').select('*').order('id');
      setLinks(data || []);
  };

  const handleUpdate = async (id, newUrl) => {
    const { error } = await supabase.from('social_links').update({ url: newUrl }).eq('id', id);
    if (!error) alert('Link updated successfully!');
  };

  // FIX: Add new platform handler
  const handleAddPlatform = async () => {
      if(!newPlatform.platform || !newPlatform.url) return alert("Fill both fields");
      const { error } = await supabase.from('social_links').insert([newPlatform]);
      if(!error) {
          alert("Platform added!");
          setNewPlatform({platform:'', url:''});
          fetchLinks();
      } else {
          alert(error.message);
      }
  }

  const handleDelete = async (id) => {
      if(!confirm("Remove this platform?")) return;
      await supabase.from('social_links').delete().eq('id', id);
      fetchLinks();
  }

  return (
    <div className="admin-panel fade-in">
      <h2>Social Media Links</h2>
      <p className="subtext" style={{marginBottom:'20px'}}>Update existing links or add new platforms.</p>
      
      {/* Existing Links */}
      <div style={{display:'grid', gap:'15px', marginBottom:'40px'}}>
        {links.map(link => (
            <div key={link.id} style={{background:'#f9f9f9', padding:'15px', borderRadius:'8px', border:'1px solid #eee'}}>
                <label className="social-label">{link.platform}</label>
                <div className="social-input-group">
                <input 
                    className="admin-input" 
                    defaultValue={link.url} 
                    id={`input-${link.id}`}
                    placeholder={`https://${link.platform}.com/...`} 
                    style={{margin:0}}
                />
                <button className="primary-btn" style={{margin:0, padding:'0 20px'}} onClick={() => handleUpdate(link.id, document.getElementById(`input-${link.id}`).value)}>Save</button>
                <button className="sm-btn danger" style={{marginLeft:'5px'}} onClick={() => handleDelete(link.id)}>X</button>
                </div>
            </div>
        ))}
      </div>

      {/* FIX: Add New Platform Form */}
      <div style={{borderTop:'2px solid #eee', paddingTop:'20px'}}>
          <h3>Add New Platform</h3>
          <div className="form-group">
              <input className="admin-input" placeholder="Platform Name (e.g. Instagram)" value={newPlatform.platform} onChange={e => setNewPlatform({...newPlatform, platform: e.target.value})} />
              <input className="admin-input" placeholder="Profile URL" value={newPlatform.url} onChange={e => setNewPlatform({...newPlatform, url: e.target.value})} />
              <button className="primary-btn" onClick={handleAddPlatform}>+ Add Platform</button>
          </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 7. PLACEHOLDERS 
// ------------------------------------------------------------------
export const CategoryManager = () => <div className="admin-panel"><h2>Category Management</h2><p>Coming Soon</p></div>;
export const AssetLibrary = () => <div className="admin-panel"><h2>Asset Library</h2><p>Coming Soon</p></div>;
export const AdminSettings = () => <div className="admin-panel"><h2>Settings</h2><p>Coming Soon</p></div>;