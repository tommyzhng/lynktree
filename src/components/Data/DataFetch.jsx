import React, { useEffect } from "react";

const DataFetch = ({ setData }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch result from function_a endpoint
        const res = await fetch("http://localhost:5000/api/get_data");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const module_data = await res.json();
        console.log("Fetched module_data from API:", module_data);

        // Fetch result from function_b endpoint
        // const resB = await fetch("http://localhost:5000/api/get_locations");
        // if (!resB.ok) {
        //   throw new Error(`HTTP error! Status: ${resB.status}`);
        // }
        // const dataB = await resB.json();
        // console.log("Fetched dataB from API:", dataB);

        // Set the separate state values
        setData(module_data);  // ✅ Remove .result (Make sure API returns JSON correctly)
        // setLocations(dataB);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(null);
        // setLocations(null);
      }
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
    // return () => {}; // Cleanup on unmount
  }, [setData]);

  return null;
};

const LocationFetch = ({ setLocations }) => {
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/get_locations");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched data from API:", data);
        setLocations(data);
        clearInterval(intervalId); // Stop polling once the fetch succeeds
      } catch (error) {
        console.error("Error fetching data:", error);
        setLocations({ 0: { lat: 0, long: 0 } });
      }
    };

    fetchLocations(); // Initial fetch
    const intervalId = setInterval(fetchLocations, 2000); // Polling every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [setLocations]);

  return null;
};

const LocationAdd = async ({ curr_pos, setLocations }) => {
  try {
    const res = await fetch("http://localhost:5000/api/add_location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: curr_pos[0],
        long: curr_pos[1],
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    setLocations(data);
    console.log("Location added successfully.");
  } catch (error) {
    console.error("Error adding location:", error);
  }
};

export {LocationFetch, LocationAdd};

export default DataFetch;
