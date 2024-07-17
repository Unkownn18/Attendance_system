import React, { useState } from 'react';
import { registerStudent } from '../services/api';

const RegisterStudent = () => {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
        } else {
            // Handle invalid file type (show error message, clear input, etc.)
            console.error('Invalid file type. Please select an image file.');
        }
    };

    const handleRegister = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_number', rollNumber);
        formData.append('image', image);

        try {
            setLoading(true); // Set loading to true before request

            const response = await registerStudent(formData);
            console.log(response);  // Check response in console
            if (response.data && response.data.success) {
                setMessage(response.data.success);
            } else {
                setMessage('Unknown response from server');
            }
        } catch (error) {
            console.error('Error registering student:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setMessage(error.response.data.error);
            } else {
                setMessage('An error occurred while registering. Please try again later.');
            }
        } finally {
            setLoading(false); // Set loading to false after request
        }
    };

    return (
        <div className="container mt-5">
            <h1>Register Student</h1>
            <div className="form-group">
                <input type="text" className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <input type="text" className="form-control" placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
            </div>
            <div className="form-group">
                <input type="file" className="form-control" onChange={handleImageChange} />
            </div>
            <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>Register</button>
            {loading && <p className="mt-3">Loading...</p>}
            {message && <p className="mt-3">{message}</p>}
        </div>
    );
};

export default RegisterStudent;
