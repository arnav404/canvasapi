import React, { useEffect, useState } from 'react';

const LatestImage = () => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // Establish WebSocket connection
        const socket = new WebSocket('ws://https://canvasapi-26caa84d499e.herokuapp.com');

        // Listen for messages
        socket.onmessage = (event) => {
            console.log('ping');
            const data = JSON.parse(event.data);
            if (data.imageUrl) {
                setImageUrl(`https://canvasapi-26caa84d499e.herokuapp.com${data.imageUrl}`);
            }
        };

        return () => {
            socket.close(); // Clean up the socket connection on component unmount
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
