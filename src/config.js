import axios from 'axios';

export const API_URL = 'https://robot-restaurant.onrender.com';
// export const API_URL = 'http://localhost:3001';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
