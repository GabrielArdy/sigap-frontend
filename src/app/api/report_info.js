import api from "./config/api";

const ReportInfo = {
    getReportInfo: async () => {
        try {
            const response = await api.get('/report/');
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    createOrUpdateReport: async (data) => {
        try {
            const response = await api.post('/report/', data);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getReportData : async () => {
        try {
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const response = await api.get(`/admin/report?month=${month}&year=${year}`);
            
            // No need for complex transformations, just return the data as-is
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
}

export default ReportInfo;