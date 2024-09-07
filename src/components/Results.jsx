import React from 'react';

function Results({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div>
      <h2>Results</h2>
      {results.map((result, index) => (
        <div key={index}>
          <p>{result}</p>
        </div>
      ))}
    </div>
  );
}

export default Results;
