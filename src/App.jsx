import React, { useState } from "react";
import axios from "axios";
import './App.css';
import FileUpload from "./components/FileUpload";

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (formData) => {
    setLoading(true);
    setError('');
    axios.post('http://localhost:3002/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      if (response.data.analysis) {
        setResults(response.data.analysis);
      } else {
        console.warn("No analysis found in response:", response.data);
      }
      setLoading(false);
    })
    .catch(error => {
      setError('File upload failed: ' + (error.response ? error.response.data.message : error.message));
      setLoading(false);
    });
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="hero">
        <h1>Transform Your Hiring Process</h1>
        <p>Leverage AI to find the best candidates faster and with more confidence.</p>
        <a href="#upload" className="cta-button">Get Started</a>
      </div>

      {/* Upload Form and Results */}
      <FileUpload onSubmit={handleSubmit} loading={loading} results={results} error={error} />

      {/* Footer */}
      <div className="footer">
        &copy; 2024 Job Match - Powered by AI
      </div>
    </div>
  );
}

export default App;