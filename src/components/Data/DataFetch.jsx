// src/components/DataFetch.jsx
import React, { useEffect } from "react";

const DataFetch = ({ setNumbers }) => {
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:3001/api/numbers")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setNumbers(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setNumbers(null);
        });
    };

    // Initial fetch
    fetchData();
    // Set up interval polling
    const intervalId = setInterval(fetchData, 500);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [setNumbers]);

  return null; // This component doesn't render anything
};

export default DataFetch;