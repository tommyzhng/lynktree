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
          height: calc(100% - 2rem); /* Full height minus top/bottom margin */
          width: calc(100% - 2rem);
          overflow: hidden;
          border-radius: 40px;
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