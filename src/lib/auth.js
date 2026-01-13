/**
 * Authentication Module
 * Simple API Key based authentication for admin panel
 */

import { API_CONFIG } from './config.js';

const API_KEY_STORAGE = 'irw_admin_api_key';
const USER_KEY = 'irw_admin_user';

// Admin credentials - in production, this should validate against a backend
const ADMIN_CREDENTIALS = {
  email: 'admin@indianrestaurantweek.com',
  password: 'Admin123!IRW',
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signIn(email, password) {
  // Simple credential check
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const user = { email, name: 'Admin', role: 'admin' };

    // Store API key for backend calls
    const apiKey = API_CONFIG.adminApiKey || 'irw-admin-secret-2024';
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, user };
  }

  return { success: false, error: 'Invalid email or password' };
}

/**
 * Sign out current user
 */
export function signOut() {
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const apiKey = localStorage.getItem(API_KEY_STORAGE);
  const user = localStorage.getItem(USER_KEY);
  return !!(apiKey && user);
}

/**
 * Get API key for backend calls
 * @returns {string|null}
 */
export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE);
}

/**
 * Get current access token (alias for getApiKey for compatibility)
 * @returns {string|null}
 */
export function getAccessToken() {
  return getApiKey();
}

/**
 * Get current user info
 * @returns {object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
