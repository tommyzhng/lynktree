import React, { useState, useEffect, setNumbers } from "react";
import MapComponent from "./components/MapComponent";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ffmcNum] = useState(85);
  const [numbers, setNumbers] = useState(null);

  const handleLogin = () => {
    setIsAdmin(!isAdmin);
    alert(isAdmin ? "Logged out" : "Logged in as Admin");
  };

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
        });
    };

    // Initial fetch
    fetchData();
    // Set up interval polling
    const intervalId = setInterval(fetchData, 5000); // adjust interval as needed

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        display: "flex", // Use flexbox for side-by-side layout
        overflow: "hidden",
        backgroundColor: "#255957",
      }}
    >
      {/* Left Section: Map (70% width) */}
      <div
        style={{
          width: "70%", // 70% of the viewport width
          height: "100%",
          position: "relative",
          display: "flex",
          justifyContent: "center", // Center the map vertically
          alignItems: "center", // Center the map horizontally
        }}
      >
        <MapComponent />
      </div>

      {/* Right Section: Controls (30% width) */}
      <div
        style={{
          width: "30%", // 30% of the viewport width
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "calc(100% - 2rem)",
            height: "calc(100% - 2rem)",
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",

            justifyContent: "flex-start",
            alignItems: "left",
            backgroundColor: "#ffffff",
            
            // padding to inside components
            padding: "2rem", // Add padding inside the container
            boxSizing: "border-box", // Include padding in the width/height

            // prevent scrollbars
            overflow: "hidden", 
          }}
        >
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleLogin}
          >
            {isAdmin ? "Logout Admin" : "Login Admin"}
          </button>
          <div className="p-4 bg-white rounded shadow">
            <p className="text-lg font-semibold">FFMC Num</p>
            {/* <p className="text-xl">{data.1}</p>*/}
            {/* ✅ Display first temperature value */}
            {numbers && numbers["1"] && (
              <p className="text-lg">Temperature: {numbers["1"].temp}°C</p>
            )}
          </div>
      </div>
    </div>
  </div>
  );
};

export default App;