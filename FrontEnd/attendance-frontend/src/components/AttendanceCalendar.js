import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getAttendance } from '../services/api';
import './AttendanceCalendar.css';  // Add CSS for highlighting

const AttendanceCalendar = ({ rollNumber }) => {
    const [attendanceDates, setAttendanceDates] = useState([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await getAttendance(rollNumber);
                const dates = response.data.map(record => new Date(record.timestamp));
                setAttendanceDates(dates);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchAttendance();
    }, [rollNumber]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month' && attendanceDates.find(d => d.toDateString() === date.toDateString())) {
            return 'highlight';
        }
    };

    return (
        <div>
            <h2>Attendance Calendar</h2>
            <Calendar
                tileClassName={tileClassName}
            />
        </div>
    );
};

export default AttendanceCalendar;
