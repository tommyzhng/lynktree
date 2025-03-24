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
                <h2>Fire Danger Level:</h2>
                <p>{ffmcNum}</p>
            </div>
        </div>
    );
}

export default AdminComponent;