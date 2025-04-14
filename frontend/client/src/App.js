import React, { useState, useEffect } from 'react';

function App() {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPod, setNewPod] = useState({
    name: '',
    plant_type: '',
    planting_date: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // API base URL
  const API_URL = 'http://localhost:8000';

  // Fetch all pods
  const fetchPods = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/pods`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();

      setPods(data);

      setError(null);

    } catch (err) {

      setError(`Error fetching pods: ${err.message}`);
      console.error('Error fetching pods:', err);

    } finally {

      setLoading(false);
    }
  };

  // Load pods on component mount
  useEffect(() => {
    fetchPods();
  }, []);

  // Handle input changes for new pod form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for pod creation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setSelectedFileName(file ? file.name : '');
  };

  // Submit handler for creating a new pod
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      
      // Add pod data to form
      Object.entries(newPod).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add image if selected
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      
      const response = await fetch(`${API_URL}/api/pods`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Reset form
      setNewPod({
        name: '',
        plant_type: '',
        planting_date: '',
        description: ''
      });
      setSelectedFile(null);
      setSelectedFileName('');
      
      // Refresh pods list
      fetchPods();
      
    } catch (err) {
      setError(`Error creating pod: ${err.message}`);
      console.error('Error creating pod:', err);
    }
  };

  // Handler for adding a new image to an existing pod
  const handleAddImage = async (podId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/api/pods/${podId}/images`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh pods to show the new image
      fetchPods();
      
    } catch (err) {
      setError(`Error adding image: ${err.message}`);
      console.error('Error adding image:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Plant Pod Tracker</h1>
      </header>
      
      <div style={styles.contentContainer}>
        <section style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Add New Plant Pod</h2>
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.formLabel}>Pod Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newPod.name}
                onChange={handleInputChange}
                required
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="plant_type" style={styles.formLabel}>Plant Type:</label>
              <input
                type="text"
                id="plant_type"
                name="plant_type"
                value={newPod.plant_type}
                onChange={handleInputChange}
                required
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="planting_date" style={styles.formLabel}>Planting Date:</label>
              <input
                type="date"
                id="planting_date"
                name="planting_date"
                value={newPod.planting_date}
                onChange={handleInputChange}
                required
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="description" style={styles.formLabel}>Description:</label>
              <textarea
                id="description"
                name="description"
                value={newPod.description}
                onChange={handleInputChange}
                rows="3"
                style={styles.formTextarea}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="pod-image" style={styles.formLabel}>
                Initial Image (Optional):
              </label>
              <div style={styles.fileInputContainer}>
                <input
                  type="file"
                  id="pod-image"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                <label htmlFor="pod-image" style={styles.fileInputLabel}>
                  {selectedFileName || 'Choose an image'}
                </label>
              </div>
            </div>
            
            <button type="submit" style={styles.submitButton}>Add Pod</button>
          </form>
        </section>
        
        <section style={styles.podsSection}>
          <h2 style={styles.sectionTitle}>Your Plant Pods</h2>
          
          {loading ? (
            <div style={styles.loadingMessage}>
              <div style={styles.loadingSpinner}></div>
              <span>Loading pods...</span>
            </div>
          ) : pods.length === 0 ? (
            <div style={styles.noPods}>No plant pods yet. Add one above!</div>
          ) : (
            <div style={styles.podsGrid}>
              {pods.map(pod => (
                <div key={pod.id} style={styles.podCard}>
                  <h3 style={styles.podTitle}>{pod.name}</h3>
                  <div style={styles.podDetails}>
                    <p style={styles.detailItem}><span style={styles.detailLabel}>Type:</span> {pod.plant_type}</p>
                    <p style={styles.detailItem}><span style={styles.detailLabel}>Planted:</span> {formatDate(pod.planting_date)}</p>
                    {pod.description && (
                      <p style={styles.detailItem}><span style={styles.detailLabel}>Description:</span> {pod.description}</p>
                    )}
                    <p style={styles.detailItem}><span style={styles.detailLabel}>Created:</span> {formatDate(pod.created_at)}</p>
                  </div>
                  
                  <div style={styles.podImagesSection}>
                    <h4 style={styles.imagesTitle}>Progress Images:</h4>
                    {pod.images.length === 0 ? (
                      <p style={styles.noImages}>No images yet</p>
                    ) : (
                      <div style={styles.imagesGrid}>
                        {pod.images.map(image => (
                          <div key={image.id} style={styles.imageContainer}>
                            <img 
                              src={`${API_URL}/api/uploads/${image.filename}`} 
                              alt={`${pod.name} progress`} 
                              style={styles.podImage}
                            />
                            <span style={styles.imageDate}>{formatDate(image.upload_date)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.addImageSection}>
                    <input
                      type="file"
                      id={`add-image-${pod.id}`}
                      accept="image/*"
                      style={styles.addImageInput}
                      onChange={(e) => handleAddImage(pod.id, e)}
                    />
                    <label htmlFor={`add-image-${pod.id}`} style={styles.addImageLabel}>
                      Add Image
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Inline styles
const styles = {
  appContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  
  header: {
    backgroundColor: '#3c8a5f',
    padding: '20px 30px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  
  headerTitle: {
    color: 'white',
    margin: 0,
    fontSize: '28px',
    fontWeight: 600,
  },
  
  contentContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  
  formSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  
  podsSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  
  sectionTitle: {
    color: '#2c6e49',
    marginTop: 0,
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e9ecef',
    fontSize: '22px',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  
  formLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
  },
  
  formInput: {
    padding: '10px 15px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outlineColor: '#3c8a5f',
  },
  
  formTextarea: {
    padding: '10px 15px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outlineColor: '#3c8a5f',
    resize: 'vertical',
    minHeight: '80px',
  },
  
  fileInputContainer: {
    position: 'relative',
  },
  
  fileInput: {
    position: 'absolute',
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    zIndex: '-1',
  },
  
  fileInputLabel: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    border: '1px solid #ced4da',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  
  submitButton: {
    backgroundColor: '#3c8a5f',
    color: 'white',
    border: 'none',
    padding: '12px 15px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  
  errorMessage: {
    padding: '10px 15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '6px',
    marginBottom: '15px',
  },
  
  podsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '15px',
  },
  
  podCard: {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    fontSize: '14px',
  },
  
  podTitle: {
    backgroundColor: '#e9ecef',
    margin: 0,
    padding: '10px 12px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#3c8a5f',
  },
  
  podDetails: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8px',
  },
  
  detailItem: {
    marginRight: '15px',
  },
  
  detailLabel: {
    fontWeight: 600,
    color: '#495057',
  },
  
  podImagesSection: {
    padding: '10px 12px',
    borderTop: '1px solid #e9ecef',
  },
  
  imagesTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 10px 0',
    color: '#495057',
  },
  
  imagesGrid: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    gap: '8px',
    paddingBottom: '5px',
  },
  
  imageContainer: {
    position: 'relative',
    borderRadius: '6px',
    overflow: 'hidden',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  
  podImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  
  imageDate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '5px 8px',
    fontSize: '12px',
    textAlign: 'center',
  },
  
  addImageSection: {
    padding: '10px 12px',
    borderTop: '1px solid #e9ecef',
    textAlign: 'center',
  },
  
  addImageInput: {
    position: 'absolute',
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    zIndex: '-1',
  },
  
  addImageLabel: {
    display: 'inline-block',
    padding: '8px 12px',
    backgroundColor: '#3c8a5f',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },
  
  loadingMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: '15px',
  },
  
  loadingSpinner: {
    width: '24px',
    height: '24px',
    border: '4px solid #e9ecef',
    borderTopColor: '#3c8a5f',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  noPods: {
    padding: '40px 0',
    textAlign: 'center',
    color: '#6c757d',
    fontSize: '16px',
  },
  
  noImages: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
};

export default App;