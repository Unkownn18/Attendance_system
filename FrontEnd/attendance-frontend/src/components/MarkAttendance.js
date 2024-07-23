import React, { useState, useRef, useEffect } from 'react';
import { markAttendance } from '../services/api';
import { Outlet, Link } from 'react-router-dom';

const MarkAttendance = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [location, setLocation] = useState('');
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);

    const campusCenter = {
        latitude: 17.372764270454574, // nsakcet latitude   17.373348458026587,
        longitude: 78.49381373597083, // nsakcet longitude  78.49350653376338
    };
    const allowedRadius = 15000; // Example: 100 meters

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degree) => degree * (Math.PI / 180);
        const R = 6371e3; // Earth radius in meters
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    const handleAttendance = async () => {
        if (!rollNumber || !location) {
            setMessage('Please fill all fields and get your location before submitting.');
            return;
        }

        try {
            setLoading(true);
            setMessage('');
            const image = await captureImageFromCamera();

            const [latString, longString] = location.replace('Lat: ', '').split(', Long: ');
            const latitude = parseFloat(latString);
            const longitude = parseFloat(longString);

            const distance = calculateDistance(
                latitude,
                longitude,
                campusCenter.latitude,
                campusCenter.longitude
            );

            if (distance > allowedRadius) {
                setMessage('You are not at the location, go to nsakcet campus.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('roll_number', rollNumber);
            formData.append('image', image);
            formData.append('location', location);

            const response = await markAttendance(formData);
            console.log('Response from mark attendance:', response);

            if (response && response.success) {
                setMessage('Attendance marked successfully');
                setAttendanceMarked(true);
            } else if (response && response.error) {
                setMessage(response.error); // Display error from server
            } else {
                setMessage('Unknown response from server');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            if (error.error) {
                setMessage(error.error); // Display specific error from server
            } else {
                setMessage('Failed to mark attendance. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(`Lat: ${latitude}, Long: ${longitude}`);
            },
            (error) => {
                console.error('Error getting location:', error);
                setMessage('Unable to get location. Please check your permissions.');
            }
        );
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.autoplay = true;
                videoRef.current.muted = true;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play().catch((error) => {
                            console.error('Error playing video:', error);
                        });
                    }
                };
                setCameraActive(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setMessage('Failed to access camera. Please check your device settings.');
        }
    };

    const captureImageFromCamera = async () => {
        if (!videoRef.current) {
            throw new Error('Camera not initialized');
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg');
        });
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();

            tracks.forEach((track) => {
                track.stop();
            });

            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    };

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            startCamera();
        } else {
            console.error('getUserMedia not supported in this browser');
            setMessage('Camera access not supported in this browser');
        }

        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="container mt-5">
            <h1>Mark Attendance</h1>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Roll Number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                />
            </div>
            <div className="form-group">
                <button className="btn btn-secondary" onClick={handleLocation}>Get Location</button>
                <p>{location}</p>
            </div>
            <div className="camera-container">
                <video ref={videoRef} className="camera-view" />
            </div>
            <button
                className="btn btn-primary"
                onClick={handleAttendance}
                disabled={loading || !cameraActive}
            >
                Mark Attendance
            </button>
            {loading && <p className="mt-3">Loading...</p>}
            {message && (
                <div className="mt-3">
                    <p className={`text-${message.includes('successfully') ? 'success' : 'danger'}`}>{message}</p>
                    {message === 'Attendance marked successfully' && (
                        <Link to="/AttendanceCalendar" className="btn btn-success">
                            View Attendance Calendar
                        </Link>
                    )}
                    {message === 'Attendance already marked for today' && (
                        <Link to="/AttendanceCalendar" className="btn btn-info">
                            View Attendance Calendar
                        </Link>
                    )}
                    {message === 'Student not found, please register' && (
                        <Link to="/" className="btn btn-warning">
                            Register Now
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
