import React from "react";
import "./AdminComponent.css";

const AdminComponent = ({ isAdmin, setIsAdmin, ffmcNum}) => {
    const handleLogin = () => {
        setIsAdmin(!isAdmin);
    };

    const handleAddModule = () => {
        console.log("Add Module clicked");
    }

    return (
        <div className="control-panel">
            <div className="button-container">
            <button className="login-button" onClick={handleLogin}>
                {isAdmin ? "Logout" : "Login"}
            </button>
            <button className="add-module-button" onClick={handleAddModule}>
                Add Module
            </button>
            </div>
            {isAdmin && (
                <div className="admin-details">
                    <div className="statistics-page">
                        <h2>Statistics</h2>
                        <div className="stats">
                            <div className="stat-item">
                                <span>Total Users:</span> <span>123</span>
                            </div>
                            <div className="stat-item">
                                <span>Active Sessions:</span> <span>45</span>
                            </div>
                            <div className="stat-item">
                                <span>Module Usage:</span> <span>67%</span>
                            </div>
                        </div>

                    </div>
                    <div className="device-info-page">
                        <h2>Current Device Info</h2>
                        <div className="device-details">
                            <div className="device-item">
                                <span>Device Name:</span> <span>My Device</span>
                            </div>
                            <div className="device-item">
                                <span>Status:</span> <span>Online</span>
                            </div>
                            <div className="device-item">
                                <span>FWI Value:</span> <span>{ffmcNum ? ffmcNum : "N/A"}</span>
                            </div>
                            <div className="device-item">
                                <span>Status:</span> <span>{ffmcNum ? "Online" : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminComponent;