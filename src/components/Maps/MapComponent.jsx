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
import { memo } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// const landmarkPosition = [43.66079512969152, -79.39653684895607];
// const locations = {1: {lat: 43.66079512969152, long: -79.39653684895607}, 
//                    2: {lat: 43.66, long: -79.39}};


// Memoized CustomOverlay to prevent unnecessary re-renders of the popup structure
const CustomOverlay = memo(({ position, isOpen, children }) => {
  const map = useMap();
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Initialize the popup only once
    if (!popupRef.current) {
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
        .setContent(container);

      popupRef.current = popup;
    }

    // Open or close the popup based on isOpen
    if (isOpen) {
      popupRef.current.setLatLng(position).openOn(map);
    } else {
      map.closePopup(popupRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
      }
      containerRef.current = null;
      popupRef.current = null;
    };
  }, [map, isOpen, position]); // Only re-run if map, isOpen, or position changes

  if (!containerRef.current) return null;

  // Render children into the persistent container without re-creating the popup
  return ReactDOM.createPortal(children, containerRef.current);
}, (prevProps, nextProps) => {
  // Only re-render if isOpen or position changes (not children)
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.position[0] === nextProps.position[0] &&
    prevProps.position[1] === nextProps.position[1]
  );
});

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
                    if (isClicked && activeMarker === key) {
                      setActiveMarker(null);
                      setIsClicked(false);
                    } else if (isClicked && activeMarker !== key) {
                      setActiveMarker(key);
                    } else {
                      setActiveMarker(key);
                      setIsClicked(true);
                    }
                  },
                }}
              />

              {/* Recenter the map on curr_pos change */}
              {/* <RecenterMap curr_pos={curr_pos} />

              <CircleMarker
                center={curr_pos}
                radius={8}
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.6,
                }}
              >
                <Popup>You are here</Popup>
              </CircleMarker> */}

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