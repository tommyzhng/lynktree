const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());

// Start the Python process
const pythonProcess = spawn('python', ['python/main.py']);
let latestData = null;

// Listen to stdout from the Python process
pythonProcess.stdout.on('data', (data) => {
  // If your Python script prints multiple lines or extra whitespace,
  // you might need to process the data further.
  try {
    // Assume each print is a complete JSON string
    const output = data.toString().trim();
    latestData = JSON.parse(output);
  } catch (err) {
    console.error('Error parsing Python output:', err);
  }
});

// Optional: listen to stderr for debugging
pythonProcess.stderr.on('data', (data) => {
  console.error(`Python stderr: ${data}`);
});

// API endpoint that returns the latest data
app.get('/api/numbers', (req, res) => {
  if (latestData) {
    res.json(latestData);
  } else {
    res.json({}); // or send an error/status indicating no data yet
  }
});

// Gracefully handle server shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    // Kill the Python process
    pythonProcess.kill();  // Kill the Python process
    latestData = {};
    
    // Wait 5 seconds before exiting
    setTimeout(() => {
        console.log('Exited after 1 seconds');
        process.exit();  // Gracefully exit the server after 5 seconds
    }, 1000);
});


const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
