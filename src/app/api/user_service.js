import api from './config/api';

/**
 * Fetch all users with pagination and filtering
 * @param {number} page - The page number to fetch
 * @param {number} limit - The number of items per page
 * @param {Object} filter - Filter criteria for users
 * @returns {Promise} Promise object representing the API response
 */
export const getUsers = async (page = 1, limit = 10, filter = {}) => {
  try {
    const response = await api.get('/users', {
      params: { 
        page, 
        limit,
        filter: Object.keys(filter).length > 0 ? JSON.stringify(filter) : undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Update a user by ID
 * @param {string|number} userId - The ID of the user to update
 * @param {object} userData - Updated user data
 * @returns {Promise} Promise object representing the API response
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put('/users/update', {
      userId,
      ...userData
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user by ID
 * @param {string|number} userId - The ID of the user to delete
 * @returns {Promise} Promise object representing the API response
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete('/users/delete', {
      data: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// getUserById
/**
 * Fetch a user by ID
 * @param {string|number} userId - The ID of the user to fetch
 * @returns {Promise} Promise object representing the API response
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
