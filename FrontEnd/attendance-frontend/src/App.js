import React from 'react';
import RegisterStudent from './components/RegisterStudent';
import MarkAttendance from './components/MarkAttendance';
import AttendanceCalendar from './components/AttendanceCalendar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <div className="App container mt-5">
            <BrowserRouter>
                <Routes>
                    <Route index element={<RegisterStudent />} />
                    <Route path="MarkAttendance" element={<MarkAttendance />} />
                    <Route path="AttendanceCalendar" element={<AttendanceCalendar />} />
                    <Route path="*" element={<h2>404 - Page Not Found</h2>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
