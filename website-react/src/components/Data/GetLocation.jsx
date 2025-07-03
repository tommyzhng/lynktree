import e from "cors";
import React, { useEffect } from "react";

const LocationService = ({ setCurr_pos }) => {
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Updated device location:", latitude, longitude);
          setCurr_pos([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true, // optional: better GPS but more battery
          maximumAge: 10000,        // optional: how long to cache location (ms)
          timeout: 20000            // optional: how long to wait (ms)
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.warn("Geolocation is not available in this browser.");
    }
  }, [setCurr_pos]);

  return null;
};

export default LocationService;
