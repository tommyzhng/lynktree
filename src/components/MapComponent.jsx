import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = () => {
  const position = [43.6622993431624, -79.39552899809453];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={position}
        zoom={20}
        className="map-container"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <style jsx>{`
        .map-wrapper {
          height: calc(100vh - 2rem); /* Full height minus top/bottom margin */
          width: 70vw;
          overflow: hidden;
          border-radius: 40px;
          margin: 0 auto;
          position: absolute;
          margin-left: 2rem; /* Adds space from the left edge */
          margin-top: 1rem; /* Optional: adds space from the top */
          margin-bottom: 1rem; /* Optional: adds space from the bottom */
        }

        .map-container {
          height: 100% !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;