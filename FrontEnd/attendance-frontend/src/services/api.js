import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export const getStudents = () => {
    return axios.get(`${API_URL}students/`)
        .then(response => response.data)
        .catch(error => {
            throw error.response.data;  // Throw the specific error response data
        });
};


export const registerStudent = (studentData) => {
    return axios.post(`${API_URL}register/`, studentData)
        .then(response => response.data)
        .catch(error => {
            throw error.response.data;  // Throw the specific error response data
        });
};


export const markAttendance = (attendanceData) => {
    console.log('Sending attendance data:', attendanceData);
    return axios.post(`${API_URL}mark-attendance/`, attendanceData)
        .then(response => {
            console.log('Response from mark attendance:', response.data);
            return response.data;
        })
        .catch(error => {
            console.error('Error marking attendance:', error);
            throw error.response.data;  // Throw the specific error response data
        });
};


export const getAttendance = (rollNumber) => {
    return axios.get(`${API_URL}attendance/${rollNumber}/`);
};
