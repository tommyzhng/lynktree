// src/components/Maps/MapComponent.jsx
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

const landmarkPosition = [43.6625, -79.3955];

const CustomOverlay = ({ position, isOpen, children }) => {
  const map = useMap();
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!map || !isOpen) return;

    // Create a real DOM container
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

    // Delay rendering portal until Leaflet has inserted the container
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



const MapComponent = ({ numbers }) => {
  const centerPosition = [43.6622993431624, -79.39552899809453];
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const fwi = numbers?.["1"]?.ffmc || 0;
  const getColor = (fwi) => {
    const ratio = Math.min(Math.max(fwi, 0), 100) / 100;
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r}, ${g}, 0)`;
  };

  const MapClickHandler = () => {
    useMapEvent("click", () => {
      if (!isClicked) setIsCardOpen(false);
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

        <Marker
          position={landmarkPosition}
          eventHandlers={{
            mouseover: () => {
              if (!isClicked) setIsCardOpen(true);
            },
            mouseout: () => {
              if (!isClicked) setIsCardOpen(false);
            },
            click: () => {
              setIsClicked(!isClicked);
              setIsCardOpen(!isClicked);
            },
          }}
        />

        <Circle
          center={landmarkPosition}
          radius={100}
          pathOptions={{
            color: getColor(fwi),
            fillColor: getColor(fwi),
            fillOpacity: 0.3,
            weight: 2,
          }}
        />

        {isCardOpen && (
          <CustomOverlay position={landmarkPosition} isOpen={isCardOpen}>
            <div className="landmark-card">
              <p className="status">
                Backend Status:{" "}
                {numbers && Object.keys(numbers).length > 0 ? (
                  <span className="text-green-600 font-semibold">Running ✅</span>
                ) : (
                  <span className="text-red-600 font-semibold">Not Running ❌</span>
                )}
              </p>
              <h3 className="module-title">Module 1:</h3>
              <div className="module-data">
                <p>Temperature: {numbers?.["1"]?.temp || "N/A"}</p>
                <p>Humidity: {numbers?.["1"]?.humidity || "N/A"}</p>
                <p>Wind Speed: {numbers?.["1"]?.wind_speed || "N/A"}</p>
                <p>FFMC: {numbers?.["1"]?.ffmc || "N/A"}</p>
                <p>DMC: {numbers?.["1"]?.dmc || "N/A"}</p>
                <p>DC: {numbers?.["1"]?.dc || "N/A"}</p>
              </div>
            </div>
          </CustomOverlay>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
