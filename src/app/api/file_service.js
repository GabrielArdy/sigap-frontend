import api from "./config/api";

const fileService = {
    uploadFile: async (data) => {
        try {
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('filepath', data.filepath);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
    
}