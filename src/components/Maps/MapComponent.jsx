import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvent,
} from "react-leaflet";
import ReactDOM from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// const landmarkPosition = [43.66079512969152, -79.39653684895607];
// const locations = {1: {lat: 43.66079512969152, long: -79.39653684895607}, 
//                    2: {lat: 43.66, long: -79.39}};


const CustomOverlay = ({ position, isOpen, children }) => {
  const map = useMap();
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map || !isOpen) return;

    const container = L.DomUtil.create("div", "custom-popup-container");
    containerRef.current = container;

    const popup = L.popup({
      offset: [0, -40],
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      className: "leaflet-custom-popup",
    })
      .setLatLng(position)
      .setContent(container)
      .openOn(map);

    setTimeout(() => {
      setReady(true);
    }, 0);

    return () => {
      map.closePopup(popup);
      containerRef.current = null;
      setReady(false);
    };
  }, [map, isOpen, position]);

  if (!ready || !containerRef.current) return null;

  return ReactDOM.createPortal(children, containerRef.current);
};

const MapComponent = ({ numbers, locations, curr_pos}) => {
  const centerPosition = curr_pos;
  const [activeMarker, setActiveMarker] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const statusMessages = {
    0: "Connected ✅",
    1: "No Data ❌",
    2: "Disconnected ❌",
  };
  const devicestatusMessages = {
    0: "Connected ✅",
    1: "No Data ❌",
    2: "Disconnected ❌",
    3: "Reconnecting 🔄",
    4: "Timeout ⏳",
    5: "Error ⚠️"
  };

  const fwi = numbers?.["1"]?.fwi || 0;
  const getColor = (fwi) => {
    const ratio = Math.min(Math.max(fwi, 0), 100) / 100;
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, 0)`;
  };

  const MapClickHandler = () => {
    useMapEvent("click", () => {
      if (!isClicked) setActiveMarker(null);
    });
    return null;
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={centerPosition}
        zoom={20}
        className="map-container"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {Object.keys(locations).map((key) => {
          if (key == 0) return null;

          const position = [locations[key].lat, locations[key].long];
          const moduleData = numbers?.[key] || {};
          const fwi = moduleData.fwi || 0;

          return (
            <React.Fragment key={key}>
              <Marker
                position={position}
                eventHandlers={{
                  mouseover: () => {
                    if (!isClicked) setActiveMarker(key);
                  },
                  mouseout: () => {
                    if (!isClicked) setActiveMarker(null);
                  },
                  click: () => {
                    if (activeMarker === key) {
                      setActiveMarker(null);
                      setIsClicked(false);
                    } else {
                      setActiveMarker(key);
                      setIsClicked(true);
                    }
                  },
                }}
              />

              <Circle
                center={position}
                radius={100}
                pathOptions={{
                  color: getColor(fwi),
                  fillColor: getColor(fwi),
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />

              {activeMarker === key && (
                <CustomOverlay position={position} isOpen={activeMarker === key}>
                  <div className="landmark-card">
                    <p className="status">
                      Backend Status:{" "}
                      {numbers && Object.keys(numbers).length > 0 ? (
                        <span className="text-green-600 font-semibold">Running ✅</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Not Running ❌</span>
                      )}
                    </p>
                    <h3 className="module-title">Module {key}:</h3>
                    <div className="module-data">
                      {(() => {
                        const status = moduleData.status_error_code;
                        return <p>Status: {statusMessages[status] || "Unknown Status ❓"}</p>;
                      })()}
                      <p>Temperature: {moduleData.temperature || "N/A"}</p>
                      <p>Humidity: {moduleData.humidity || "N/A"}</p>
                      <p>Wind Speed: {moduleData.wind_speed || "N/A"}</p>
                      <p>FWI: {moduleData.fwi || "N/A"}</p>
                      <p>Last Update Time: {moduleData.time || "N/A"}</p>
                    </div>
                  </div>
                </CustomOverlay>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
