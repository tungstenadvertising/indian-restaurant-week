/**
 * API Client Module
 * Handles all API requests to the AWS backend
 */

import { API_CONFIG } from './config.js';
import { getApiKey } from './auth.js';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const apiKey = getApiKey();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add API key for admin endpoints
  if (apiKey && endpoint.startsWith('/admin')) {
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
// PUBLIC API (No authentication required)
// ============================================

/**
 * Fetch published articles for public display
 * @param {object} params - Query parameters
 * @returns {Promise<{articles: Array, count: number}>}
 */
export async function fetchPublicArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/articles${query ? `?${query}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Fetch single article by slug
 * @param {string} slug
 * @returns {Promise<{article: object}>}
 */
export async function fetchArticleBySlug(slug) {
  return apiRequest(`/articles/${slug}`);
}

// ============================================
// ADMIN API (Authentication required)
// ============================================

/**
 * Fetch all articles (including drafts) for admin
 * @param {object} params - Query parameters
 * @returns {Promise<{articles: Array, count: number}>}
 */
export async function fetchAdminArticles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/admin/articles${query ? `?${query}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Fetch single article by ID for admin
 * @param {string} id
 * @returns {Promise<{article: object}>}
 */
export async function fetchArticleById(id) {
  return apiRequest(`/admin/articles/${id}`);
}

/**
 * Create new article
 * @param {object} data - Article data
 * @returns {Promise<{article: object, message: string}>}
 */
export async function createArticle(data) {
  return apiRequest('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update existing article
 * @param {string} id - Article ID
 * @param {object} data - Updated article data
 * @returns {Promise<{article: object, message: string}>}
 */
export async function updateArticle(id, data) {
  return apiRequest(`/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete article
 * @param {string} id - Article ID
 * @returns {Promise<{message: string}>}
 */
export async function deleteArticle(id) {
  return apiRequest(`/admin/articles/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get presigned URL for S3 upload
 * @param {string} contentType - File MIME type
 * @param {string} fileName - Original file name
 * @returns {Promise<{uploadUrl: string, publicUrl: string, key: string}>}
 */
export async function getUploadUrl(contentType, fileName) {
  return apiRequest('/admin/upload', {
    method: 'POST',
    body: JSON.stringify({ contentType, fileName }),
  });
}

/**
 * Upload file to S3 using presigned URL
 * @param {File} file - File to upload
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadFile(file) {
  // Get presigned URL
  const { uploadUrl, publicUrl } = await getUploadUrl(file.type, file.name);

  // Upload to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file');
  }

  return publicUrl;
}
