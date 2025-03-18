import api from "../config/api";
/**
   * Login user with email and password
   * @param {object} data - User data for login
   * @returns {Promise} - Promise that resolves to user data with token
   */
const AuthService = {
    login: async (data) => {
        try {
            const response = await api.post('/auth/login', data);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },

    /**
     * Register new user
     * @param {object} data - User's data for registration
     * @returns {Promise} - Promise that resolves to user data with token
     */
    register: async (data) => {
        try {
            const response = await api.post('/auth/register', data);
            return response.data;
        } catch (error) {
            return error.response.data;
        }
    },
}

export default AuthService;