import React, { useState } from 'react';
import { registerStudent } from '../services/api';
import { Outlet, Link } from 'react-router-dom';

const RegisterStudent = () => {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
        } else {
            setMessage('Invalid file type. Please select an image file.');
        }
    };

    const handleRegister = async () => {
        if (!name || !rollNumber || !image) {
            setMessage('Please fill all fields and upload an image.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_number', rollNumber);
        formData.append('image', image);

        try {
            setLoading(true);
            setMessage('');

            const response = await registerStudent(formData);
            console.log(response);

            if (response && response.success) {
                setMessage(response.success);
            } else if (response && response.error) {
                // Handle specific error messages
                if (response.error === 'Student with similar face already exists') {
                    setMessage('A student with a similar face has already been registered.');
                } else if (response.error === 'Student with this roll number already exists') {
                    setMessage('A student with this roll number already exists.');
                } else if (response.error === 'No face detected in the image') {
                    setMessage('No face detected. Please try with a different image.');
                } else {
                    setMessage(response.error);
                }
            } else {
                setMessage('Unknown response from server');
            }
        } catch (error) {
            console.error('Error registering student:', error);

            if (error.error) {
                setMessage(error.error); // Set the message from the thrown error
            } else {
                setMessage('An error occurred while registering. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1>Register Student</h1>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
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
                <input type="file" className="form-control" onChange={handleImageChange} />
            </div>
            <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                Register
            </button>
            {loading && <p className="mt-3">Loading...</p>}
            {message && <p className="mt-3 text-danger">{message}</p>}
            <nav>
                <ul>
                    <li>
                        Already Registered? 
                        <Link to='/MarkAttendance'>Mark Attendance Here</Link>
                    </li>
                    <li>
                        <Link to='/AttendanceCalendar'>Check Your Attendance</Link>
                    </li>
                </ul>
            </nav>
            <Outlet/>
        </div>
    );
};

export default RegisterStudent;
