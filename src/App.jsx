import React, { useState } from "react";
import MapComponent from "./components/Maps/MapComponent";
import AdminComponent from "./components/Admin/AdminComponent";
import DataFetch, {LocationFetch} from "./components/Data/DataFetch";
import LocationService from "./components/Data/GetLocation";
import "./App.css";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState(null);
  const [locations, setLocations] = useState({0: {lat: 0, long: 0}});
  const [curr_pos, setCurr_pos] = useState([43.66070000706279, -79.39648789994064]);
  const location = "University of Toronto";
  const [info, setInfo] = useState(false);

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
      <LocationService setCurr_pos={setCurr_pos} />

      <div className="content">
        <div className={`map-section ${isAdmin ? "split" : "full"}`}>
          <DataFetch setData={setData}/>
          <LocationFetch setLocations={setLocations} />
          <MapComponent numbers={data} locations = {locations} curr_pos={curr_pos} isAdmin={isAdmin}/>
          {!isAdmin && (
            <button className="map-login-button" onClick={() => setIsAdmin(true)}>
              Admin Log In
            </button>
          )}
          {!info &&(
            <button className="map-info-button" onClick={() => setInfo(true)}>
              Info
            </button>
          )}
          {info && (
            <div className="info">
              <button className="map-info-button" onClick={() => setInfo(false)}>
                Close
              </button>
            </div>
          )
          }
        </div>

        {isAdmin && (
          <div className="control-section">
            <AdminComponent isAdmin={isAdmin} setIsAdmin={setIsAdmin} data={data} setLocations={setLocations} curr_pos={curr_pos} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
