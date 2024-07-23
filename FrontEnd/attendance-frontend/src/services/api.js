import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Function to get the list of students
export const getStudents = () => {
    return axios.get(`${API_URL}students/`)
        .then(response => response.data)
        .catch(error => {
            // Check if the error has a response and a data object
            if (error.response && error.response.data) {
                throw error.response.data;  // Throw specific error response data
            } else {
                // Throw a generic error message
                throw { error: 'Failed to fetch students due to unexpected error' };
            }
        });
};

// Function to register a student
export const registerStudent = async (studentData) => {
    try {
        const response = await axios.post(`${API_URL}register/`, studentData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;  // Throw specific error response data
        } else {
            throw { error: 'Registration failed due to unexpected error' }; // Generic error message
        }
    }
};

// Function to mark attendance
export const markAttendance = async (attendanceData) => {
    console.log('Sending attendance data:', attendanceData);

    try {
        const response = await axios.post(`${API_URL}mark-attendance/`, attendanceData);
        console.log('Response from mark attendance:', response.data);
        return response.data; // Return response data
    } catch (error) {
        console.error('Error marking attendance:', error);

        if (error.response && error.response.data) {
            // Server-side error
            throw error.response.data;  // Throw specific error response data
        } else if (error.request) {
            // Network error
            throw { error: 'Network error. Please check your connection and try again.' };
        } else {
            // Unknown error
            throw { error: 'Failed to mark attendance due to unexpected error.' };
        }
    }
};
// Function to get attendance for a specific student by roll number// Function to get attendance for a specific student by roll number
export const getAttendance = (rollNumber) => {
    return axios.get(`${API_URL}attendance/${rollNumber}/`)
        .then(response => response.data)
        .catch(error => {
            if (error.response && error.response.status === 404) {
                // Handle 404 error for student not found
                throw { error: 'Student not found, please register.' };
            } else if (error.response && error.response.data) {
                // Handle other errors
                throw error.response.data;
            } else {
                // Handle unexpected errors
                throw { error: 'Failed to fetch attendance due to unexpected error' };
            }
        });
};
