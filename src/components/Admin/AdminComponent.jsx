import React from "react";
import "./AdminComponent.css";
import { LocationAdd } from "../Data/DataFetch";

const AdminComponent = ({ isAdmin, setIsAdmin, data, curr_pos, setLocations}) => {
    const handleLogin = () => {
        setIsAdmin(!isAdmin);
    };

    const handleAddModule = async () => {
        await LocationAdd({ curr_pos, setLocations })
    };

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
                                <span>Total Users:</span> <span>420</span>
                            </div>
                            <div className="stat-item">
                                <span>Active Sessions:</span> <span>45</span>
                            </div>
                            <div className="stat-item">
                                <span>Module Usage:</span> <span>69%</span>
                            </div>
                        </div>
                        <div className="Module Info:">
                            <h2>Module Errors:</h2>
                            <div className="module-errors">
                                <span>
                                    
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminComponent;