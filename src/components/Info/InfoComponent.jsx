import React from "react";
import "./InfoComponent.css";

const InfoComponent = ({ setInfo }) => {
    return (
        <div className="info-overlay">
            <div className="info-content-box">
                <h2>Information</h2>
                <p>
                    This is a wildfire risk map powered by Lynktree. The map displays
                    wildfire-prone locations and relevant risk data.
                </p>
                <p>
                    Click markers for details, and use zoom to explore.
                </p>

                <div className="info-content">
                    <h3>How to use the map:</h3>
                    <ul>
                        <li>Click on markers to see risk information.</li>
                        <li>Zoom in/out or pan to explore the region.</li>
                    </ul>

                    <h3>Understanding Fire Risk (FWI):</h3>
                    <p>
                        The Canadian Fire Weather Index (FWI) is used to estimate wildfire risk.
                        It includes:
                    </p>
                    <ul>
                        <li><strong>FFMC</strong>: Surface dryness – affects ease of ignition.</li>
                        <li><strong>DMC</strong>: Subsurface dryness – affects burn depth and smoldering.</li>
                        <li><strong>DC</strong>: Drought Code - rating of average moisture content in deep organic layers.</li>
                        <li><strong>FWI</strong>: Combines spread and fuel to indicate fire intensity.</li>
                        <li><strong>DSR: Daily Serverity Rating - DIfficulty of controlling fires</strong></li>
                    </ul>

                    <h3>Disclaimer:</h3>
                    <p>
                        This map is for informational use only. Always refer to local authorities for official wildfire guidance.
                    </p>

                    <h3>Contact Us:</h3>
                    <p>
                        For feedback or inquiries, reach out to: <br />
                        <strong></strong> <br />
                        <strong>Praxis Team 103C</strong> <br />
                        <strong>University of Toronto</strong> <br />
                    </p>
                </div>

                <button className="info-close-button" onClick={() => setInfo(false)}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default InfoComponent;
