import React, { useState } from 'react';
import { markAttendance } from '../services/api';
import AttendanceCalendar from './AttendanceCalendar';

const MarkAttendance = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState('');
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [message, setMessage] = useState('');

    const handleAttendance = async () => {
        const formData = new FormData();
        formData.append('roll_number', rollNumber);
        formData.append('image', image);
        formData.append('location', location);

        try {
            const response = await markAttendance(formData);
            setMessage(response.data.success);
            setAttendanceMarked(true);
            } catch (error) {
            setMessage(error.response.data.error);
            }
            };

            const handleLocation = () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation(`Lat: ${latitude}, Long: ${longitude}`);
                    },
                    (error) => {
                        console.error(error);
                    }
                );
            };
            
            return (
                <div className="container mt-5">
                    <h1>Mark Attendance</h1>
                    <div className="form-group">
                        <input type="text" className="form-control" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <input type="file" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
                    </div>
                    <button className="btn btn-secondary" onClick={handleLocation}>Get Location</button>
                    <p>{location}</p>
                    <button className="btn btn-primary" onClick={handleAttendance}>Mark Attendance</button>
                    {message && <p className="mt-3">{message}</p>}
                    {attendanceMarked && <AttendanceCalendar rollNumber={rollNumber} />}
                </div>
            );
        };

        export default MarkAttendance;