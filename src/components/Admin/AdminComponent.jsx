import React from "react";
import "./AdminComponent.css";

const AdminComponent = ({ isAdmin, setIsAdmin, ffmcNum}) => {
    const handleLogin = () => {
        setIsAdmin(!isAdmin);
    };

    return (
        <div className="control-panel">
            <button className="login-button" onClick={handleLogin}> 
                {isAdmin ? "Logout" : "Login"}
            </button>
            <div className="info-box">
                <p className="text-lg">
                    Backend Status: {numbers && Object.keys(numbers).length > 0 ? (
                    <span className="text-green-600 font-semibold">Running ✅</span>
                    ) : (
                    <span className="text-red-600 font-semibold">Not Running ❌</span>
                    )}
                </p>

                <h3 className="module-1" style={{ marginBottom: '0' }}>
                    Module 1: 
                </h3>
                <p className="text-lg" style={{ marginLeft: '10px', marginTop: '10px' }}>
                    Temperature: {numbers?.["1"]?.temperature || "N/A"}
                    <br />
                    Humidity: {numbers?.["1"]?.humidity || "N/A"}
                    <br />
                    Wind Speed: {numbers?.["1"]?.wind_speed || "N/A"}
                    <br />  
                    FFMC: {numbers?.["1"]?.ffmc || "N/A"}
                    <br />
                    DMC: {numbers?.["1"]?.dmc || "N/A"}
                    <br />
                    DC: {numbers?.["1"]?.dc || "N/A"}
                    <br />
                    Status: {numbers?.["1"]?.error_code === 0 ? "Updating ✅" : numbers?.["1"]?.error_code === 1 ? "Lost Connection ❌" : numbers?.["1"]?.error_code === -1 ? "No Connection ❌" : "Error ❌"}
                </p>

                <h3 className="module-2" style={{ marginBottom: '0' }}>
                    Module 2:
                </h3>
                <p className="text-lg" style={{ marginLeft: '10px', marginTop: '10px' }}>
                    Temperature: {numbers?.["2"]?.temperature || "N/A"}
                    <br />
                    Humidity: {numbers?.["2"]?.humidity || "N/A"}
                    <br />
                    Wind Speed: {numbers?.["2"]?.wind_speed || "N/A"}
                    <br />
                    FFMC: {numbers?.["2"]?.ffmc || "N/A"}
                    <br />
                    DMC: {numbers?.["2"]?.dmc || "N/A"}
                    <br />
                    DC: {numbers?.["2"]?.dc || "N/A"}
                    <br />
                    Status: {numbers?.["2"]?.error_code === 0 ? "Updating ✅" : numbers?.["2"]?.error_code === 1 ? "Lost Connection ❌" : numbers?.["2"]?.error_code === -1 ? "No Connection ❌" : "Error ❌"}
                </p>
            </div>
        </div>
    );
}

export default AdminComponent;