/**
 * Press Kit API Client
 * Handles all API requests for Press Kit management
 */

import { API_CONFIG } from './config.js';
import { getApiKey } from './auth.js';

/**
 * Make an authenticated API request to Press Kit endpoints
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
async function pressKitRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const apiKey = getApiKey();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// PRESS KIT API FUNCTIONS
// ============================================

/**
 * List files in a category
 * @param {string} category - photos, logos, or press-releases
 * @param {string} [subcategory] - For photos: interior, food, or chefs
 * @returns {Promise<{files: Array, count: number}>}
 */
export async function listPressKitFiles(category, subcategory = null) {
  const params = new URLSearchParams({ category });
  if (subcategory) {
    params.set('subcategory', subcategory);
  }
  return pressKitRequest(`/admin/press-kit/files?${params}`);
}

/**
 * Get presigned URL for file upload
 * @param {object} params
 * @param {string} params.category - photos, logos, or press-releases
 * @param {string} params.subcategory - For photos: interior, food, or chefs
 * @param {string} params.fileName - Original file name
 * @param {string} params.contentType - MIME type
 * @returns {Promise<{uploadUrl: string, publicUrl: string, key: string}>}
 */
export async function getPressKitUploadUrl({ category, subcategory, fileName, contentType }) {
  return pressKitRequest('/admin/press-kit/upload', {
    method: 'POST',
    body: JSON.stringify({ category, subcategory, fileName, contentType }),
  });
}

/**
 * Upload a file to Press Kit
 * @param {File} file - File to upload
 * @param {string} category - photos, logos, or press-releases
 * @param {string} [subcategory] - For photos: interior, food, or chefs
 * @param {function} [onProgress] - Progress callback (not supported with presigned URLs)
 * @returns {Promise<{publicUrl: string, key: string}>}
 */
export async function uploadPressKitFile(file, category, subcategory = null, onProgress = null) {
  // Get presigned URL
  const { uploadUrl, publicUrl, key } = await getPressKitUploadUrl({
    category,
    subcategory,
    fileName: file.name,
    contentType: file.type,
  });

  // Upload to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to S3');
  }

  return { publicUrl, key };
}

/**
 * Delete a file from Press Kit
 * @param {string} key - S3 key of the file
 * @returns {Promise<{message: string}>}
 */
export async function deletePressKitFile(key) {
  const params = new URLSearchParams({ key });
  return pressKitRequest(`/admin/press-kit/files?${params}`, {
    method: 'DELETE',
  });
}

/**
 * Generate ZIP for a category
 * @param {string} category - photos, logos, or press-releases
 * @returns {Promise<{message: string, zipUrl: string, fileCount: number, zipSize: string}>}
 */
export async function generatePressKitZip(category) {
  return pressKitRequest('/admin/press-kit/generate-zip', {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
}

/**
 * Get metadata for all press kit categories
 * @returns {Promise<{metadata: object}>}
 */
export async function getPressKitMetadata() {
  return pressKitRequest('/admin/press-kit/metadata');
}

// ============================================
// MOCK DATA (for development without API)
// ============================================

const mockFiles = {
  photos: {
    interior: [
      { key: 'press-kit/photos/interior/restaurant-1.jpg', name: 'restaurant-1.jpg', size: 2048576, sizeFormatted: '2 MB', lastModified: '2026-01-20T10:00:00Z' },
      { key: 'press-kit/photos/interior/restaurant-2.jpg', name: 'restaurant-2.jpg', size: 1548576, sizeFormatted: '1.48 MB', lastModified: '2026-01-20T10:00:00Z' },
    ],
    food: [
      { key: 'press-kit/photos/food/dish-1.jpg', name: 'dish-1.jpg', size: 1024000, sizeFormatted: '1 MB', lastModified: '2026-01-21T10:00:00Z' },
    ],
    chefs: [
      { key: 'press-kit/photos/chefs/chef-1.jpg', name: 'chef-1.jpg', size: 512000, sizeFormatted: '500 KB', lastModified: '2026-01-19T10:00:00Z' },
    ],
  },
  logos: [
    { key: 'press-kit/logos/irw-logo.png', name: 'irw-logo.png', size: 102400, sizeFormatted: '100 KB', lastModified: '2026-01-15T10:00:00Z' },
    { key: 'press-kit/logos/irw-logo.svg', name: 'irw-logo.svg', size: 10240, sizeFormatted: '10 KB', lastModified: '2026-01-15T10:00:00Z' },
  ],
  'press-releases': [
    { key: 'press-kit/press-releases/irw-2026-announcement.pdf', name: 'irw-2026-announcement.pdf', size: 512000, sizeFormatted: '500 KB', lastModified: '2026-01-10T10:00:00Z' },
  ],
};

const mockMetadata = {
  photos: { fileCount: 4, zipSize: '5.5 MB', lastUpdated: '2026-01-21T10:00:00Z', zipUrl: '#' },
  logos: { fileCount: 2, zipSize: '110 KB', lastUpdated: '2026-01-15T10:00:00Z', zipUrl: '#' },
  'press-releases': { fileCount: 1, zipSize: '500 KB', lastUpdated: '2026-01-10T10:00:00Z', zipUrl: '#' },
};

/**
 * Mock list files (for development)
 */
export async function mockListPressKitFiles(category, subcategory = null) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (category === 'photos' && subcategory) {
    return { files: mockFiles.photos[subcategory] || [], count: (mockFiles.photos[subcategory] || []).length };
  }
  
  if (category === 'photos') {
    const allPhotos = [
      ...mockFiles.photos.interior,
      ...mockFiles.photos.food,
      ...mockFiles.photos.chefs,
    ];
    return { files: allPhotos, count: allPhotos.length };
  }
  
  return { files: mockFiles[category] || [], count: (mockFiles[category] || []).length };
}

/**
 * Mock get metadata (for development)
 */
export async function mockGetPressKitMetadata() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { metadata: mockMetadata };
}

/**
 * Mock upload file (for development)
 */
export async function mockUploadPressKitFile(file, category, subcategory = null) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const key = `press-kit/${category}${subcategory ? '/' + subcategory : ''}/${file.name}`;
  return { publicUrl: '#mock-url', key };
}

/**
 * Mock delete file (for development)
 */
export async function mockDeletePressKitFile(key) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { message: 'File deleted (mock)' };
}

/**
 * Mock generate ZIP (for development)
 */
export async function mockGeneratePressKitZip(category) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { 
    message: 'ZIP generated (mock)', 
    zipUrl: '#', 
    fileCount: mockMetadata[category]?.fileCount || 0,
    zipSize: mockMetadata[category]?.zipSize || '0 KB',
  };
}
