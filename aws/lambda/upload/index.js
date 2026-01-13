/**
 * Lambda handler for S3 Upload
 * Generates presigned URLs for direct S3 uploads
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({});

const BUCKET_NAME = process.env.S3_BUCKET || 'irw-media-uploads';
const URL_EXPIRATION = 300; // 5 minutes

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

// Simple API Key authentication
const API_KEY = process.env.ADMIN_API_KEY || 'irw-admin-key-2024';

function isAuthorized(event) {
  const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];
  return apiKey === API_KEY;
}

// Response helper
const response = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

// Allowed file types
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  // Verify API key
  if (!isAuthorized(event)) {
    return response(401, { error: 'Unauthorized', message: 'Invalid or missing API key' });
  }

  try {
    const body = JSON.parse(event.body);
    const { contentType, fileName } = body;

    // Validate content type
    if (!contentType || !ALLOWED_TYPES[contentType]) {
      return response(400, {
        error: 'Invalid content type',
        allowed: Object.keys(ALLOWED_TYPES),
      });
    }

    // Generate unique file name
    const extension = ALLOWED_TYPES[contentType];
    const uniqueFileName = `articles/${uuidv4()}.${extension}`;

    // Create presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION,
    });

    // Construct the public URL (assuming bucket is configured for public read)
    const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`;

    return response(200, {
      uploadUrl,
      publicUrl,
      key: uniqueFileName,
      expiresIn: URL_EXPIRATION,
    });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Failed to generate upload URL', message: error.message });
  }
};
