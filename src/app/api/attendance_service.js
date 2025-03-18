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
    }
}

export default AttendanceService;