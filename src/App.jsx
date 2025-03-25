// src/App.jsx
import React, { useState } from "react";
import MapComponent from "./components/Maps/MapComponent";
import AdminComponent from "./components/Admin/AdminComponent";
import DataFetch from "./components/Data/DataFetch";
import "./App.css";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [numbers, setNumbers] = useState(null);
  const location = "University of Toronto";

  const ffmcNum = numbers?.["1"]?.ffmc || "N/A";

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
          <MapComponent numbers={numbers} isAdmin={isAdmin} />
          {!isAdmin && (
            <button
              className="map-login-button"
              onClick={() => setIsAdmin(true)}
            >
              Admin Log In
            </button>
          )}
          <DataFetch setNumbers={setNumbers} />
        </div>
        {isAdmin && (
          <div className="control-section">
            <AdminComponent
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              ffmcNum={ffmcNum}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;