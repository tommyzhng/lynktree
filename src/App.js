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
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      margin: 0, // Reset default margins
      padding: 0 // Reset default padding
    }}>
      <MapComponent />
     {/* Floating Controls (to the right of map's right edge) */}
     <div className="absolute top-4 z-[1000] flex flex-col gap-4" >
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

    <style jsx>{`
      /* Ensure controls stay above map */
      .absolute {
        position: absolute;
        top: 2rem; /* Adds space from the top */
        left: 75vw; /* Aligns with right edge of map */

      }
    `}</style>
  </div>
  );
};
export default App;
