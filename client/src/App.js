import React, { useEffect, useState } from 'react';

const LatestImage = () => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // Dynamically determine WebSocket URL based on the environment
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';  // Use wss for production
        const port = process.env.PORT || 5000; // Use Heroku port or 5000 locally
        const socketUrl = `${protocol}://${window.location.hostname}:${port}`; // WebSocket URL

        // Create WebSocket connection
        const socket = new WebSocket(socketUrl);

        console.log(socketUrl);

        // Handle WebSocket messages
        socket.onmessage = (event) => {
            console.log('Received WebSocket message');
            const data = JSON.parse(event.data);
            if (data.imageUrl) {
                setImageUrl(data.imageUrl); // Update the state with the image URL
            }
        };

        return () => {
            console.log('Socket close');
            socket.close(); // Clean up the WebSocket connection on component unmount
        };
    }, []);

    return (
        <div>
            {imageUrl ? (
                <img src={imageUrl} alt="Latest Upload" style={{ maxWidth: '100%' }} />
            ) : (
                <p>No image found.</p>
            )}
        </div>
    );
};

export default LatestImage;
