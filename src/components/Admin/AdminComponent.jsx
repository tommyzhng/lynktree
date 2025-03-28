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
                        <h2>More features coming soon!!</h2>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminComponent;