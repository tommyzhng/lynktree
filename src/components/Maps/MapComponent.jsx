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

// Subcomponent for the card content
const ModuleCard = ({ key, moduleData }) => {
  const statusMessages = {
    0: "Connected ✅",
    1: "No Data ❌",
    2: "Disconnected ❌",
  };

  return (
    <div className="landmark-card">
      <h3 className="module-title">Module {key}:</h3>
      <div className="module-data">
        {(() => {
          const status = moduleData.status_error_code;
          return (
            <p>Status: {statusMessages[status] || "Unknown Status ❓"}</p>
          );
        })()}
        <p>Temperature: {moduleData.temperature || "N/A"}</p>
        <p>Humidity: {moduleData.humidity || "N/A"}</p>
        <p>Wind Speed: {moduleData.wind_speed || "N/A"}</p>
        <p>FWI: {moduleData.fwi || "N/A"}</p>
        <p>Last Update Time: {moduleData.time || "N/A"}</p>
      </div>
    </div>
  );
};

const CustomOverlay = ({ position, isOpen, moduleKey, numbers }) => {
  const map = useMap();
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Initialize popup only once
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

    // Open or close based on isOpen
    if (isOpen) {
      popupRef.current.setLatLng(position).openOn(map);
    } else if (popupRef.current.isOpen()) {
      map.closePopup(popupRef.current);
    }

    // Cleanup on unmount only
    return () => {
      
    };
  }, [map, isOpen, position]); // Dependencies ensure instant response to isOpen

  if (!containerRef.current) return null;

  const moduleData = numbers?.[moduleKey] || {};
  return ReactDOM.createPortal(
    <ModuleCard key={moduleKey} moduleData={moduleData} />,
    containerRef.current
  );
};

const MapComponent = ({ locations, curr_pos, numbers }) => {
  const centerPosition = curr_pos;
  const [activeMarker, setActiveMarker] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  const getColor = (fwi) => {
    const ratio = Math.min(Math.max(fwi, 0), 100) / 100;
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, 0)`;
  };

  const MapClickHandler = () => {
    useMapEvent("click", () => {
      if (!isClicked) {
        setActiveMarker(null);
      }
    });
    return null;
  };

  const handleMarkerClick = (key) => {
    if (isClicked && activeMarker === key) {
      setActiveMarker(null);
      setIsClicked(false);
    } else if (isClicked && activeMarker !== key) {
      setActiveMarker(key);
    } else {
      setActiveMarker(key);
      setIsClicked(true);
    }
  };

  const handleMouseOver = (key) => {
    if (!isClicked) {
      // console.log(`Mouse over marker ${key}`);
      setActiveMarker(key);
    }
  };

  const handleMouseOut = (key) => {
    if (!isClicked) {
      // console.log(`Mouse out from marker ${key}`);
      setActiveMarker(null);
    }
  };

  return (
    <div className="map-wrapper">
      <MapContainer center={centerPosition} zoom={20} className="map-container">
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        // a marker for your location and put aput a tiny cirlce around it. You a red dot icon for the marker
        <Marker position={centerPosition} icon={L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
          <Circle
            center={centerPosition}
            radius={20}
            pathOptions={{
              color: "red",
              fillColor: "red",
              fillOpacity: 0.3,
              weight: 2,
            }}
          />  
        </Marker>

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
                  click: () => handleMarkerClick(key),
                  mouseover: () => handleMouseOver(key),
                  mouseout: () => handleMouseOut(key),
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

              <CustomOverlay
                position={position}
                isOpen={activeMarker === key}
                moduleKey={key}
                numbers={numbers}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;