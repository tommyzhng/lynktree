import React, { useEffect } from "react";

const DataFetch = ({ setNumbers1, setNumbers2 }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch result from function_a endpoint
        const resA = await fetch("http://localhost:5000/api/function_a");
        if (!resA.ok) {
          throw new Error(`HTTP error! Status: ${resA.status}`);
        }
        const dataA = await resA.json();
        console.log("Fetched dataA from API:", dataA);

        // Fetch result from function_b endpoint
        const resB = await fetch("http://localhost:5000/api/function_b");
        if (!resB.ok) {
          throw new Error(`HTTP error! Status: ${resB.status}`);
        }
        const dataB = await resB.json();
        console.log("Fetched dataB from API:", dataB);

        // Set the separate state values
        setNumbers1(dataA);  // ✅ Remove .result (Make sure API returns JSON correctly)
        setNumbers2(dataB);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNumbers1(null);
        setNumbers2(null);
      }
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [setNumbers1, setNumbers2]);

  return null;
};

export default DataFetch;
