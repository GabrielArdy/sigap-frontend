import api from './config/api';

const AttendanceService = {
    getUserDashboard: async (userId) => {
        try {
            const response = await api.get(`/attendances/dashboard?id=${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    recordCheckInTime: async (attendanceData) => {
        try {
            const response = await api.post('/attendances/checkIn', attendanceData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    recordCheckOutTime: async (attendanceData) => {
        try {
            const response = await api.post('/attendances/checkOut', attendanceData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },

    getUserReport: async (userId, month, year) => {
        try {
            const response = await api.get(`/attendances/${userId}?month=${month}&year=${year}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
}

export default AttendanceService;