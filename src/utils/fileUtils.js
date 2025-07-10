// Utility functions for file operations with Cloudinary

/**
 * Download a file from Cloudinary URL
 * @param {string} cloudinaryUrl - The Cloudinary URL of the file
 * @param {string} filename - The original filename
 */
export const downloadFile = (cloudinaryUrl, filename) => {
  if (!cloudinaryUrl) {
    console.error('No Cloudinary URL provided');
    return;
  }

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = cloudinaryUrl;
  link.download = filename || 'download';
  link.target = '_blank';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Open a file in a new tab
 * @param {string} cloudinaryUrl - The Cloudinary URL of the file
 */
export const openFile = (cloudinaryUrl) => {
  if (!cloudinaryUrl) {
    console.error('No Cloudinary URL provided');
    return;
  }

  window.open(cloudinaryUrl, '_blank');
};

/**
 * Get file type icon based on MIME type or file extension
 * @param {string} mimeType - The MIME type of the file
 * @param {string} filename - The filename (fallback for extension)
 * @returns {string} Bootstrap icon class
 */
export const getFileIcon = (mimeType, filename) => {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'bi-file-earmark-image';
    if (mimeType.startsWith('video/')) return 'bi-file-earmark-play';
    if (mimeType.startsWith('audio/')) return 'bi-file-earmark-music';
    if (mimeType === 'application/pdf') return 'bi-file-earmark-pdf';
    if (mimeType.includes('word')) return 'bi-file-earmark-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'bi-file-earmark-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'bi-file-earmark-ppt';
    if (mimeType === 'text/plain') return 'bi-file-earmark-text';
  }

  // Fallback to file extension
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'bi-file-earmark-pdf';
      case 'doc':
      case 'docx': return 'bi-file-earmark-word';
      case 'xls':
      case 'xlsx': return 'bi-file-earmark-excel';
      case 'ppt':
      case 'pptx': return 'bi-file-earmark-ppt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'bi-file-earmark-image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'bi-file-earmark-play';
      case 'mp3':
      case 'wav': return 'bi-file-earmark-music';
      case 'txt': return 'bi-file-earmark-text';
      default: return 'bi-file-earmark';
    }
  }

  return 'bi-file-earmark';
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 * @param {string} mimeType - The MIME type of the file
 * @param {string} filename - The filename (fallback)
 * @returns {boolean} True if file is an image
 */
export const isImage = (mimeType, filename) => {
  if (mimeType && mimeType.startsWith('image/')) return true;
  
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  }
  
  return false;
};

/**
 * Check if file is a video
 * @param {string} mimeType - The MIME type of the file
 * @param {string} filename - The filename (fallback)
 * @returns {boolean} True if file is a video
 */
export const isVideo = (mimeType, filename) => {
  if (mimeType && mimeType.startsWith('video/')) return true;
  
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext);
  }
  
  return false;
};

/**
 * Check if file is a document
 * @param {string} mimeType - The MIME type of the file
 * @param {string} filename - The filename (fallback)
 * @returns {boolean} True if file is a document
 */
export const isDocument = (mimeType, filename) => {
  if (mimeType) {
    return mimeType === 'application/pdf' || 
           mimeType.includes('word') || 
           mimeType.includes('excel') || 
           mimeType.includes('powerpoint') ||
           mimeType === 'text/plain';
  }
  
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);
  }
  
  return false;
}; 