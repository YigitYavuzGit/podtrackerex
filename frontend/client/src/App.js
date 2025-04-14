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
    setSelectedFile(e.target.files[0]);
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
    <div className="app-container">
      <header>
        <h1>Plant Pod Tracker</h1>
      </header>
      
      <section className="new-pod-form">
        <h2>Add New Plant Pod</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Pod Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newPod.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="plant_type">Plant Type:</label>
            <input
              type="text"
              id="plant_type"
              name="plant_type"
              value={newPod.plant_type}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="planting_date">Planting Date:</label>
            <input
              type="date"
              id="planting_date"
              name="planting_date"
              value={newPod.planting_date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={newPod.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pod-image">Initial Image (Optional):</label>
            <input
              type="file"
              id="pod-image"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <button type="submit" className="submit-btn">Add Pod</button>
        </form>
      </section>
      
      <section className="pods-list">
        <h2>Your Plant Pods</h2>
        
        {loading ? (
          <div className="loading">Loading pods...</div>
        ) : pods.length === 0 ? (
          <div className="no-pods">No plant pods yet. Add one above!</div>
        ) : (
          <div className="pods-grid">
            {pods.map(pod => (
              <div key={pod.id} className="pod-card">
                <h3>{pod.name}</h3>
                <div className="pod-details">
                  <p><strong>Type:</strong> {pod.plant_type}</p>
                  <p><strong>Planted:</strong> {pod.planting_date}</p>
                  {pod.description && (
                    <p><strong>Description:</strong> {pod.description}</p>
                  )}
                  <p><strong>Created:</strong> {formatDate(pod.created_at)}</p>
                </div>
                
                <div className="pod-images">
                  <h4>Growth Progress Images:</h4>
                  {pod.images.length === 0 ? (
                    <p>No images yet</p>
                  ) : (
                    <div className="images-grid">
                      {pod.images.map(image => (
                        <div key={image.id} className="image-container">
                          <img 
                            src={`${API_URL}/api/uploads/${image.filename}`} 
                            alt={`${pod.name} progress`} 
                          />
                          <span className="image-date">{formatDate(image.upload_date)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="add-image">
                  <label htmlFor={`add-image-${pod.id}`} className="add-image-label">
                    Add Progress Image
                  </label>
                  <input
                    type="file"
                    id={`add-image-${pod.id}`}
                    accept="image/*"
                    className="add-image-input"
                    onChange={(e) => handleAddImage(pod.id, e)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;