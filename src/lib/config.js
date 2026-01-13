/**
 * Application Configuration
 * Environment-based settings for API and AWS services
 */

// API Configuration
export const API_CONFIG = {
  // Set to your API Gateway URL after deployment
  // For development, uses mock data
  baseUrl: import.meta.env.PUBLIC_API_URL || '',

  // Enable mock data when no API URL is configured
  useMockData: !import.meta.env.PUBLIC_API_URL,

  // Admin API key for authentication
  adminApiKey: import.meta.env.PUBLIC_ADMIN_API_KEY || 'irw-admin-secret-2024',
};

// S3 Configuration
export const S3_CONFIG = {
  bucket: import.meta.env.PUBLIC_S3_BUCKET || 'irw-media-uploads',
  region: import.meta.env.PUBLIC_S3_REGION || 'us-west-2',
};

// Article Categories
export const ARTICLE_CATEGORIES = [
  'Featured',
  'Chefs',
  'Culture',
  'Events',
  'Guide',
  'Trends',
  'News',
];

// Article Status Options
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};
