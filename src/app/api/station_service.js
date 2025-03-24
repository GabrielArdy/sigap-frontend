import api from "./config/api";

/**
 * Station Service - handles all API calls related to stations
 */
const StationService = {
    addNewStation: async (data) => {
        try {
            const response = await api.post('/stations/', data);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    getAll: async () => {
        try {
            const response = await api.get('/stations/');
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
    deleteStation: async (stationId) => {
        try {
            console.log('Station ID being sent to API:', stationId); // Debug the stationId
            
            if (!stationId) {
                return {
                    status: "error",
                    message: "Station ID is undefined or empty"
                };
            }
            
            // Pass the stationId in the request body with the correct property name
            const response = await api.delete('/stations/', {
                data: { stationId: stationId }  // Use stationId key instead of id
            });
            console.log('Delete station response:', response);
            return response.data;
        } catch (error) {
            console.error('Delete station error:', error);
            return error.response ? error.response.data : { status: "error", message: error.message };
        }
    },
    fetchQRCode: async (data) => {
        try {
            const response = await api.get(`/qr/generate`, { stationId: data });
            return response.data;
        } catch (error) {
            return error.response ? error.response.data : { 
                success: false, 
                message: error.message || "Failed to fetch QR code" 
            };
        }
    }
}

export default StationService;