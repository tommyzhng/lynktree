import React, { useState } from "react";
import MapComponent from "./components/MapComponent";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ffmcNum] = useState(85);

  const handleLogin = () => {
    setIsAdmin(!isAdmin);
    alert(isAdmin ? "Logged out" : "Logged in as Admin");
  };

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
            <p className="text-xl">{ffmcNum}</p>
          </div>
      </div>
    </div>
  </div>
  );
};

export default App;