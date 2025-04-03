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
    getReportData : async (month, year) => {
        try {
            if (!month || !year) {
                const currentDate = new Date();
                month = currentDate.getMonth() + 1; // Months are 0-indexed
                year = currentDate.getFullYear();
            }

            const response = await api.get(`/admin/report?month=${month}&year=${year}`);
            
            // No need for complex transformations, just return the data as-is
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    }
}

export default ReportInfo;