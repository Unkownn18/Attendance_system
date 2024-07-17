import React from 'react';
import RegisterStudent from './components/RegisterStudent';
import MarkAttendance from './components/MarkAttendance';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="App container mt-5">
            <RegisterStudent />
            <MarkAttendance />
        </div>
    );
}

export default App;
