/**
 * Upload a file to the server's public directory
 * 
 * @param {File} file - The file to upload
 * @param {string} directory - The directory to save the file to (relative to public)
 * @returns {Promise<{success: boolean, filepath: string, error: string}>}
 */
export async function uploadFile(file, directory = 'leave/evidence') {
  try {
    if (!file) return { success: false, error: 'No file provided' };
    
    // Generate a unique filename with timestamp and random string
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileExt = file.name.split('.').pop().toLowerCase();
    const newFilename = `${timestamp}_${randomStr}.${fileExt}`;
    
    // Create the full path
    const filePath = `/${directory}/${newFilename}`;
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filepath', filePath);
    
    // Send the file to our API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload file');
    }
    
    return {
      success: true,
      filepath: filePath
    };
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during upload'
    };
  }
}
