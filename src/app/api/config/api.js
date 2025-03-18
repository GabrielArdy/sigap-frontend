import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const api = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api;