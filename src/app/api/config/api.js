import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const api = axios.create({
    baseURL: 'https://sigap-backend-968z.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

export default api;