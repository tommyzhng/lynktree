const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// Path to the Python script you want to run
const pythonScriptPath = path.join(__dirname, "../python/main.py");

// Spawn the Python process that runs main.py
const pythonProcess = spawn("python", [pythonScriptPath]);

// Handle the close event for the Python process
pythonProcess.on("close", (code) => {
  console.log(`Python process exited with code ${code}`);
});

// Serve static files for the React app
app.use(express.static(path.join(__dirname, "../python/build")));

// This will handle all requests to your React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../python/build", "index.html"));
});

// Start the Express server (you can use any port for the API server)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

