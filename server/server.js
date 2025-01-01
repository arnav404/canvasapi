const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const http = require('http').createServer(app);
const wss = new WebSocket.Server({ server: http });

console.log(wss);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle requests to the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Set up multer storage destination and filename format
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Navigating to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Unique filename
        cb(null, `frame-${uniqueSuffix}.jpeg`);
    }
});

const upload = multer({ storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

var prev = 'frame.jpeg';

app.post('/upload', upload.single('image'), (req, res) => {
    const uploadedFileName = req.file.filename; // Get the filename of the new file
    const previousFilePath = path.join(__dirname, '../uploads', prev); // Path to the previous file

    console.log(previousFilePath);

    // Delete the previous file if it exists
    fs.unlink(previousFilePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error deleting previous file:', err);
            return res.status(500).json({ message: 'Error deleting previous file' });
        }

        // Notify all connected clients about the new image
        const imageUrl = `/uploads/${uploadedFileName}`;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                prev = uploadedFileName;
                client.send(JSON.stringify({ imageUrl }));
            }
        });

        // Respond to the client
        res.status(200).json({ message: 'File uploaded successfully', imageUrl });
    });
});

// Start the HTTP server
const PORT = process.env.PORT || 5000; // Use the PORT from Heroku or default to 5000
http.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
