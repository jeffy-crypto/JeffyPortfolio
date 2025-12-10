import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path if needed

export default function AdminPanel({ isOpen, onClose }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [artworks, setArtworks] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  // 1. Check Session & Fetch Data on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchArtworks();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchArtworks();
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Existing Artworks
  const fetchArtworks = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setArtworks(data);
  };

  // 3. Login Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: e.target.email.value,
      password: e.target.password.value,
    });
    setLoading(false);
    if (error) alert(error.message);
  };

  // 4. Upload Logic
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert('Please select a file and enter a title.');

    try {
      setLoading(true);
      
      // A. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // B. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      // C. Insert into DB
      const { error: dbError } = await supabase
        .from('artworks')
        .insert([{ title, image_url: publicUrl }]);

      if (dbError) throw dbError;

      alert('Uploaded successfully!');
      setTitle('');
      setFile(null);
      fetchArtworks(); // Refresh list
      
      // Optional: Refresh main page logic if needed
      // window.location.reload(); 

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Delete Logic
  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Are you sure you want to delete this?')) return;

    try {
      // A. Delete from Storage (Extract filename from URL)
      const fileName = imageUrl.split('/').pop();
      await supabase.storage.from('portfolio-images').remove([fileName]);

      // B. Delete from DB
      const { error } = await supabase.from('artworks').delete().eq('id', id);

      if (error) throw error;
      
      // Remove from local state immediately
      setArtworks(artworks.filter(item => item.id !== id));

    } catch (error) {
      console.error('Error deleting:', error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Admin Dashboard</h2>
          <button onClick={onClose} style={styles.closeBtn}>Close</button>
        </div>

        {!session ? (
          // --- LOGIN FORM ---
          <form onSubmit={handleLogin} style={styles.form}>
            <input name="email" type="email" placeholder="Email" style={styles.input} required />
            <input name="password" type="password" placeholder="Password" style={styles.input} required />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          // --- DASHBOARD ---
          <div style={styles.dashboard}>
            
            {/* Upload Section */}
            <div style={styles.section}>
              <h3>Add New Artwork</h3>
              <form onSubmit={handleUpload} style={styles.form}>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Artwork Title" 
                  style={styles.input} 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  style={styles.fileInput} 
                />
                <button type="submit" disabled={loading} style={styles.button}>
                  {loading ? 'Uploading...' : 'Upload Artwork'}
                </button>
              </form>
            </div>

            <hr style={{width: '100%', borderColor: '#444', margin: '20px 0'}}/>

            {/* List Section */}
            <div style={styles.section}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3>Gallery Items ({artworks.length})</h3>
                <button onClick={() => supabase.auth.signOut()} style={styles.logoutBtn}>Logout</button>
              </div>
              
              <div style={styles.grid}>
                {artworks.map((item) => (
                  <div key={item.id} style={styles.card}>
                    <img src={item.image_url} alt={item.title} style={styles.thumbnail} />
                    <div style={styles.cardInfo}>
                      <span>{item.title}</span>
                      <button onClick={() => handleDelete(item.id, item.image_url)} style={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {artworks.length === 0 && <p style={{color: '#888'}}>No artworks found.</p>}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES (Dark Mode Optimized) ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
    zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  container: {
    width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
    background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px',
    padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', color: 'white'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: {
    padding: '12px', background: '#2a2a2a', border: '1px solid #444',
    color: 'white', borderRadius: '6px', fontSize: '16px'
  },
  fileInput: { color: 'white' },
  button: {
    padding: '12px', background: '#fff', color: '#000', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px'
  },
  logoutBtn: {
    background: '#330000', color: '#ff6666', border: '1px solid #ff6666', 
    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'
  },
  card: {
    background: '#2a2a2a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333'
  },
  thumbnail: {
    width: '100%', height: '120px', objectFit: 'cover'
  },
  cardInfo: {
    padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px'
  },
  deleteBtn: {
    background: 'red', color: 'white', border: 'none', padding: '4px 8px', 
    borderRadius: '4px', cursor: 'pointer', fontSize: '10px'
  }
};