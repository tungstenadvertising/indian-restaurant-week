/**
 * Lambda handler for Press Kit Management
 * Handles file uploads, deletions, listing, and ZIP generation
 */

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');
const { PassThrough } = require('stream');

const s3Client = new S3Client({});

const BUCKET_NAME = process.env.S3_BUCKET || 'irw-media-uploads';
const URL_EXPIRATION = 300; // 5 minutes

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

// Simple API Key authentication
const API_KEY = process.env.ADMIN_API_KEY || 'irw-admin-key-2024';

// Press Kit categories and their S3 prefixes
const CATEGORIES = {
  photos: 'press-kit/photos',
  logos: 'press-kit/logos',
  'press-releases': 'press-kit/press-releases',
};

// Photo subcategories
const PHOTO_SUBCATEGORIES = ['interior', 'food', 'chefs'];

// Allowed file types
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
  'image/svg+xml': 'svg',
  'application/postscript': 'eps',
  'application/zip': 'zip',
};

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

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  const { httpMethod, path, queryStringParameters } = event;

  try {
    // PUBLIC ENDPOINT: Metadata (no auth required)
    // This allows the public press-room page to check ZIP availability
    if (path.includes('/press-kit/metadata') && httpMethod === 'GET') {
      return await getMetadata();
    }

    // All other endpoints require authentication
    if (!isAuthorized(event)) {
      return response(401, { error: 'Unauthorized', message: 'Invalid or missing API key' });
    }

    // Route based on path and method
    if (path.includes('/press-kit/files')) {
      if (httpMethod === 'GET') {
        return await listFiles(queryStringParameters);
      }
      if (httpMethod === 'DELETE') {
        return await deleteFile(queryStringParameters);
      }
    }

    if (path.includes('/press-kit/upload') && httpMethod === 'POST') {
      return await getUploadUrl(JSON.parse(event.body));
    }

    if (path.includes('/press-kit/generate-zip') && httpMethod === 'POST') {
      return await generateZip(JSON.parse(event.body));
    }

    return response(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};

/**
 * List files in a category
 */
async function listFiles(params = {}) {
  const { category = 'photos', subcategory } = params;

  if (!CATEGORIES[category]) {
    return response(400, { error: 'Invalid category', allowed: Object.keys(CATEGORIES) });
  }

  let prefix = CATEGORIES[category];
  if (category === 'photos' && subcategory) {
    prefix = `${prefix}/${subcategory}`;
  }

  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${prefix}/`,
  });

  const result = await s3Client.send(command);
  
  const files = (result.Contents || [])
    .filter(obj => !obj.Key.endsWith('/') && !obj.Key.endsWith('.zip'))
    .map(obj => ({
      key: obj.Key,
      name: obj.Key.split('/').pop(),
      size: obj.Size,
      sizeFormatted: formatFileSize(obj.Size),
      lastModified: obj.LastModified,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${obj.Key}`,
    }));

  return response(200, { files, count: files.length, category, subcategory });
}

/**
 * Get presigned URL for file upload
 */
async function getUploadUrl(body) {
  const { category, subcategory, fileName, contentType } = body;

  if (!category || !CATEGORIES[category]) {
    return response(400, { error: 'Invalid category', allowed: Object.keys(CATEGORIES) });
  }

  if (!contentType || !ALLOWED_TYPES[contentType]) {
    return response(400, {
      error: 'Invalid content type',
      allowed: Object.keys(ALLOWED_TYPES),
    });
  }

  if (!fileName) {
    return response(400, { error: 'fileName is required' });
  }

  // Build the S3 key
  let prefix = CATEGORIES[category];
  if (category === 'photos' && subcategory && PHOTO_SUBCATEGORIES.includes(subcategory)) {
    prefix = `${prefix}/${subcategory}`;
  }

  // Sanitize filename and add unique suffix to prevent overwrites
  const extension = fileName.split('.').pop().toLowerCase();
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  const uniqueFileName = `${baseName}-${uuidv4().slice(0, 8)}.${extension}`;
  const key = `${prefix}/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: URL_EXPIRATION,
  });

  const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

  return response(200, {
    uploadUrl,
    publicUrl,
    key,
    expiresIn: URL_EXPIRATION,
  });
}

/**
 * Delete a file
 */
async function deleteFile(params = {}) {
  const { key } = params;

  if (!key) {
    return response(400, { error: 'key parameter is required' });
  }

  // Verify the key is within press-kit folder
  if (!key.startsWith('press-kit/')) {
    return response(400, { error: 'Can only delete files within press-kit folder' });
  }

  // Delete the file
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);

  // Determine the category from the key
  let category = null;
  if (key.startsWith('press-kit/photos/')) {
    category = 'photos';
  } else if (key.startsWith('press-kit/logos/')) {
    category = 'logos';
  } else if (key.startsWith('press-kit/press-releases/')) {
    category = 'press-releases';
  }

  // Update metadata after deletion
  if (category) {
    await updateMetadataAfterDelete(category);
  }

  return response(200, { message: 'File deleted successfully', key });
}

/**
 * Update metadata after file deletion
 */
async function updateMetadataAfterDelete(category) {
  const prefix = CATEGORIES[category];
  
  // Count remaining files
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${prefix}/`,
  });

  const listResult = await s3Client.send(listCommand);
  const files = (listResult.Contents || []).filter(
    obj => !obj.Key.endsWith('/') && !obj.Key.endsWith('.zip')
  );

  const metadataKey = 'press-kit/metadata.json';
  let metadata = {};

  // Try to get existing metadata
  try {
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: metadataKey,
    });
    const result = await s3Client.send(getCommand);
    const metadataStr = await streamToString(result.Body);
    metadata = JSON.parse(metadataStr);
  } catch (error) {
    // File doesn't exist, use empty object
  }

  if (files.length === 0) {
    // No files left - clear the metadata for this category
    metadata[category] = {
      fileCount: 0,
      zipSize: null,
      zipSizeBytes: 0,
      lastUpdated: null,
      zipUrl: null,
    };

    // Also delete the ZIP file
    try {
      const deleteZipCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `press-kit/${category}.zip`,
      });
      await s3Client.send(deleteZipCommand);
    } catch (error) {
      // ZIP might not exist, ignore error
    }
  } else {
    // Files still exist - just update the count
    // The ZIP is now out of date, so clear it until regenerated
    metadata[category] = {
      fileCount: files.length,
      zipSize: null,
      zipSizeBytes: 0,
      lastUpdated: null,
      zipUrl: null,
    };
  }

  // Save updated metadata
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: metadataKey,
    Body: JSON.stringify(metadata, null, 2),
    ContentType: 'application/json',
  });

  await s3Client.send(putCommand);
}

/**
 * Generate ZIP file for a category
 */
async function generateZip(body) {
  const { category } = body;

  if (!category || !CATEGORIES[category]) {
    return response(400, { error: 'Invalid category', allowed: Object.keys(CATEGORIES) });
  }

  const prefix = CATEGORIES[category];
  const zipKey = `press-kit/${category}.zip`;

  try {
    // List all files in the category
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${prefix}/`,
    });

    const listResult = await s3Client.send(listCommand);
    const files = (listResult.Contents || []).filter(
      obj => !obj.Key.endsWith('/') && !obj.Key.endsWith('.zip')
    );

    if (files.length === 0) {
      return response(400, { error: 'No files to zip in this category' });
    }

    // Download all files first
    const fileBuffers = [];
    for (const file of files) {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.Key,
      });

      const fileData = await s3Client.send(getCommand);
      const fileBuffer = await streamToBuffer(fileData.Body);
      const relativePath = file.Key.replace(`${prefix}/`, '');
      fileBuffers.push({ name: relativePath, buffer: fileBuffer });
    }

    // Create archive and collect data
    const zipBuffer = await new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 5 } });
      const chunks = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err) => reject(err));

      // Add all files to archive
      for (const file of fileBuffers) {
        archive.append(file.buffer, { name: file.name });
      }

      archive.finalize();
    });

    // Upload ZIP to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: zipKey,
      Body: zipBuffer,
      ContentType: 'application/zip',
    });

    await s3Client.send(putCommand);

    // Update metadata
    await updateMetadata(category, files.length, zipBuffer.length);

    const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${zipKey}`;

    return response(200, {
      message: 'ZIP generated successfully',
      category,
      fileCount: files.length,
      zipSize: formatFileSize(zipBuffer.length),
      zipUrl: publicUrl,
    });
  } catch (error) {
    console.error('Error generating ZIP:', error);
    return response(500, { error: 'Failed to generate ZIP', message: error.message });
  }
}

/**
 * Get metadata for all categories
 */
async function getMetadata() {
  const metadataKey = 'press-kit/metadata.json';

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: metadataKey,
    });

    const result = await s3Client.send(command);
    const metadataStr = await streamToString(result.Body);
    const metadata = JSON.parse(metadataStr);

    return response(200, { metadata });
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      // Return default metadata if file doesn't exist
      return response(200, {
        metadata: {
          photos: { fileCount: 0, zipSize: null, lastUpdated: null },
          logos: { fileCount: 0, zipSize: null, lastUpdated: null },
          'press-releases': { fileCount: 0, zipSize: null, lastUpdated: null },
        },
      });
    }
    throw error;
  }
}

/**
 * Update metadata JSON in S3
 */
async function updateMetadata(category, fileCount, zipSize) {
  const metadataKey = 'press-kit/metadata.json';
  let metadata = {};

  // Try to get existing metadata
  try {
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: metadataKey,
    });
    const result = await s3Client.send(getCommand);
    const metadataStr = await streamToString(result.Body);
    metadata = JSON.parse(metadataStr);
  } catch (error) {
    // File doesn't exist, use empty object
  }

  // Update the specific category
  metadata[category] = {
    fileCount,
    zipSize: formatFileSize(zipSize),
    zipSizeBytes: zipSize,
    lastUpdated: new Date().toISOString(),
    zipUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/press-kit/${category}.zip`,
  };

  // Save updated metadata
  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: metadataKey,
    Body: JSON.stringify(metadata, null, 2),
    ContentType: 'application/json',
  });

  await s3Client.send(putCommand);
}

/**
 * Helper: Convert stream to buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Helper: Convert stream to string
 */
async function streamToString(stream) {
  const buffer = await streamToBuffer(stream);
  return buffer.toString('utf-8');
}

/**
 * Helper: Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
