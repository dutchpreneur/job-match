import React, { useState } from "react";

function FileUpload({ onSubmit, loading, results, error }) {
  const [jobFile, setJobFile] = useState(null);
  const [cvFiles, setCvFiles] = useState([]);

  const handleJobFileChange = (e) => {
    setJobFile(e.target.files[0]);
  };

  const handleCvFilesChange = (e) => {
    setCvFiles(Array.from(e.target.files));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!jobFile || cvFiles.length === 0) {
      alert("Please upload a job description and at least one CV.");
      return;
    }

    const formData = new FormData();
    formData.append("jobFile", jobFile);
    cvFiles.forEach((file) => {
      formData.append("cvFiles", file);
    });

    onSubmit(formData);
  };

  return (
    <div>
      <form className="upload-form" onSubmit={handleFormSubmit} id="upload">
        <div className="form-section">
          <h2>Upload Job Description</h2>
          <input
            type="file"
            onChange={handleJobFileChange}
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <h2>Upload Candidate CVs</h2>
          <input
            type="file"
            multiple
            onChange={handleCvFilesChange}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      
      {results && (
        <div className="results-box">
          <h2>Analysis Results</h2>
          <pre>{results}</pre>
        </div>
      )}
    </div>
  );
}

export default FileUpload;