import api from "./config/api";

const LeaveRequestService = {
    createNewRequest: async (data) => {
        try {
            const response = await api.post('/leaves/requests', data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getAllRequests: async () => {
        try {
            const response = await api.get('/leaves/requests/list', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getRequestById: async (id) => {
        try {
            const response = await api.get(`/leaves/requests/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getRequestByUserId: async (userId) => {
        try {
            const response = await api.get(`/leaves/user/${userId}/requests`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    changeStatusRequest: async (requestId, data) => {
        try {
            const response = await api.patch(`/leaves/requests/${requestId}/status`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    changeApprovalStatus: async (requestId, data) => {
        try {
            const response = await api.patch(`/leaves/requests/${requestId}/approval`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
}

export default LeaveRequestService;