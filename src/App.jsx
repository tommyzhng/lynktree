import React, { useState } from "react";
import MapComponent from "./components/Maps/MapComponent";
import AdminComponent from "./components/Admin/AdminComponent";
import DataFetch from "./components/Data/DataFetch";
import "./App.css";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [numbers1, setNumbers1] = useState(null);
  const [numbers2, setNumbers2] = useState(null);
  const location = "University of Toronto";

  return (
    <div className="app-container">
      <div className="header">
        {isAdmin ? (
          <h1 className="title">Lynktree Dashboard</h1>
        ) : (
          <>
            <h1 className="title">Wildfire risk at {location}</h1>
            <p className="subtitle">powered by lynktree</p>
          </>
        )}
      </div>

      <div className="content">
        <div className={`map-section ${isAdmin ? "split" : "full"}`}>
          <MapComponent numbers={numbers1} isAdmin={isAdmin} />
          {!isAdmin && (
            <button className="map-login-button" onClick={() => setIsAdmin(true)}>
              Admin Log In
            </button>
          )}
          
          <DataFetch setNumbers1={setNumbers1} setNumbers2={setNumbers2} />
        </div>

        {isAdmin && (
          <div className="control-section">
            <AdminComponent isAdmin={isAdmin} setIsAdmin={setIsAdmin} numbers={numbers1} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
