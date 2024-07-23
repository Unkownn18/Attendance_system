import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getAttendance } from '../services/api';
import './AttendanceCalendar.css';
import { Link, Outlet } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AttendanceCalendar = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState('');
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const [presentDays, setPresentDays] = useState(0);
    const [totalDays, setTotalDays] = useState(0);
    const [isRegistered, setIsRegistered] = useState(null);

    const fetchAttendance = async () => {
        try {
            const response = await getAttendance(rollNumber);
            console.log('API Response:', response);

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.attendance && response.attendance.length > 0) {
                const records = response.attendance.map(record => ({
                    date: new Date(record.timestamp).toDateString(),
                    status: record.status,
                }));

                // Calculate present days
                const presentCount = records.filter(record => record.status === 'present').length;

                // Calculate total days from the first record to today
                const uniqueDates = [...new Set(records.map(record => record.date))];
                const firstDate = new Date(uniqueDates[0]);
                const today = new Date();
                const daysCount = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;

                setStudentName(response.studentName || '');
                setAttendanceRecords(records);
                setPercentage((presentCount / daysCount) * 100 || 0);
                setPresentDays(presentCount);
                setTotalDays(daysCount);
                setIsDataFetched(true);
                setIsRegistered(true);
            } else {
                setError('No attendance records found.');
                setIsDataFetched(true);
                setIsRegistered(true);
                setPresentDays(0);
                setTotalDays(0);
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            setAttendanceRecords([]);
            setStudentName('');
            setError(error.message || 'Failed to fetch attendance data.');
            setIsDataFetched(true);
            setIsRegistered(false);
            setPresentDays(0);
            setTotalDays(0);
        }
    };

    const handleInputChange = (event) => {
        setRollNumber(event.target.value);
    };

    const handleSearch = () => {
        if (rollNumber.trim() !== '') {
            setError('');
            setAttendanceRecords([]);
            setStudentName('');
            setIsDataFetched(false);
            setIsRegistered(null);
            setPresentDays(0);
            setTotalDays(0);

            fetchAttendance();
        } else {
            setError('Please enter a roll number.');
            setAttendanceRecords([]);
            setStudentName('');
            setIsDataFetched(false);
            setIsRegistered(null);
            setPresentDays(0);
            setTotalDays(0);
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const record = attendanceRecords.find(
                (record) => new Date(record.date).toDateString() === date.toDateString()
            );
            return record ? (record.status === 'present' ? 'present' : 'absent') : null;
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const record = attendanceRecords.find(
                (record) => new Date(record.date).toDateString() === date.toDateString()
            );
            return record ? (
                <div className={record.status === 'present' ? 'present-content' : 'absent-content'}>
                    {record.status}
                </div>
            ) : null;
        }
    };

    return (
        <div className="container mt-5">
            <h1>Attendance Calendar</h1>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Roll Number"
                    value={rollNumber}
                    onChange={handleInputChange}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {studentName && <h2>Attendance for {studentName}</h2>}
            {error && <p className="text-danger">{error}</p>}
            
            {isRegistered === true ? (
                <div className="calendar-container">
                    <div className="calendar">
                        {isDataFetched && <Calendar tileClassName={tileClassName} tileContent={tileContent} />}
                    </div>
                    <div className="progress-bar">
                        {isDataFetched && (
                            <div style={{ width: 150, height: 150 }}>
                                <CircularProgressbar
                                    value={percentage}
                                    text={`${presentDays}/${totalDays}\n(${percentage.toFixed(2)}%)`}
                                    styles={buildStyles({
                                        pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
                                        textColor: '#000',
                                        textSize: '12px',
                                        trailColor: '#d6d6d6',
                                    })}
                                />
                            </div>
                        )}
                        {isDataFetched && (
                            <div className="attendance-summary">
                                <p>Present Days: {presentDays}</p>
                                <p>Total Days: {totalDays}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : isRegistered === false ? (
                <p className="text-warning">You are not registered. Please register to view the attendance calendar.</p>
            ) : null}

            <nav className="mt-4">
                <ul>
                    <li><Link to="/">Register</Link></li>
                    <li><Link to="/MarkAttendance">Mark Your Attendance</Link></li>
                </ul>
            </nav>
            <Outlet />
        </div>
    );
};

export default AttendanceCalendar;
