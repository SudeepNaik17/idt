import React, { useState, useEffect } from 'react';
import './App.css';

// The base URL where your Node.js server is running
const API_BASE_URL = ' https://idt-a8aa.onrender.com/api/places';
const PORT = 5000;

function App() {
  const [placeType, setPlaceType] = useState('');
  const [city, setCity] = useState('Mangalore'); // Fixed to Mangalore
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format the type for the CSS class (e.g., "Tourist Place" -> "type-tourist-place")
  const getCssType = (type) => {
    // Ensures the string is lowercase and spaces are replaced with hyphens
    return type.toLowerCase().replace(/\s/g, '-');
  }

  useEffect(() => {
    if (placeType) {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${API_BASE_URL}?type=${placeType}&city=${city}`;
      
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setError("Failed to fetch data. Ensure your Node.js server is running on port " + PORT);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [placeType, city]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Find Your Spot 🗺️</h1>
          <p>Discover colleges, hospitals, and tourist places in the city of Mangalore</p>
        </div>
        
      </header>
      
      <div className="selector-container">
        {/* Selection Box 1: Place Type */}
        <div className="select-box">
          <label htmlFor="place-type">Select Type:</label>
          <div className="input-group">
            <select 
              id="place-type" 
              value={placeType} 
              onChange={(e) => setPlaceType(e.target.value)}
            >
              <option value="" disabled>-- Choose Type --</option>
              <option value="Hospital">Hospital</option>
              <option value="College">College</option>
              <option value="Tourist Place">Tourist Place</option>
            </select>
            <span className="select-icon">▼</span>
          </div>
        </div>

        {/* Selection Box 2: City (Fixed) */}
        <div className="select-box city-select">
          <label htmlFor="city-select">Select City:</label>
          <div className="input-group">
            <input 
              type="text" 
              id="city-select" 
              value={city} 
              readOnly 
              disabled 
              className="disabled-input"
            />
          </div>
        </div>
      </div>

      <main className="results-container">
        <h2 className="results-title">
          {placeType ? `${placeType}s in ${city}` : 'Select a Place Type to view results'}
        </h2>
        
        {/* Display Status Messages */}
        {loading && <p className="status-message loading">Loading data...</p>}
        {error && <p className="status-message error-message">{error}</p>}

        {/* Display Results */}
        {!loading && !error && results.length > 0 ? (
          <div className="results-grid">
            {results.map((place) => (
              <div key={place._id} className="result-card">
                <div className="card-image-container">
                  <img 
                    src={place.imageUrl || 'https://via.placeholder.com/400x250?text=Image+Not+Available'} 
                    alt={place.name} 
                    className="card-image" 
                    // Added onError handler for local image serving fallback
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x250?text=Image+Load+Failed"; }}
                  />
                </div>
                <div className="card-content">
                  <span className={`card-type type-${getCssType(place.type)}`}>
                    {place.type}
                  </span>
                  <h3>{place.name}</h3>
                  <div className="card-footer">
                    <p className="location">📍 {place.location}</p>
                    <p className="rating">⭐ {place.rating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && placeType && !error && <p className="no-results">No results found for {placeType} in {city}.</p>
        )}
      </main>
    </div>
  );
}

export default App;