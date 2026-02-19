/**
 * Lambda handler for Articles API
 * Handles CRUD operations for news articles
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ARTICLES_TABLE || 'irw-articles';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

// Simple API Key authentication (set this in Lambda environment variables)
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

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);
};

// Calculate read time from excerpt
const calculateReadTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
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

  const { httpMethod, path, pathParameters, body, requestContext } = event;
  const isAdmin = path.startsWith('/admin');

  try {
    // Public endpoints
    if (!isAdmin) {
      switch (httpMethod) {
        case 'GET':
          if (pathParameters?.slug) {
            return await getArticleBySlug(pathParameters.slug);
          }
          return await listPublishedArticles(event.queryStringParameters);
        default:
          return response(405, { error: 'Method not allowed' });
      }
    }

    // Admin endpoints - verify API key
    if (!isAuthorized(event)) {
      return response(401, { error: 'Unauthorized', message: 'Invalid or missing API key' });
    }

    switch (httpMethod) {
      case 'GET':
        if (pathParameters?.id) {
          return await getArticleById(pathParameters.id);
        }
        return await listAllArticles(event.queryStringParameters);

      case 'POST':
        return await createArticle(JSON.parse(body));

      case 'PUT':
        if (!pathParameters?.id) {
          return response(400, { error: 'Article ID required' });
        }
        return await updateArticle(pathParameters.id, JSON.parse(body));

      case 'DELETE':
        if (!pathParameters?.id) {
          return response(400, { error: 'Article ID required' });
        }
        return await deleteArticle(pathParameters.id);

      default:
        return response(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};

/**
 * List published articles (public)
 */
async function listPublishedArticles(queryParams = {}) {
  const { limit = 20, category } = queryParams || {};

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'status-index',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'published' },
    Limit: parseInt(limit),
  };

  // Add category filter if provided
  if (category) {
    params.FilterExpression = 'category = :category';
    params.ExpressionAttributeValues[':category'] = category;
  }

  const result = await docClient.send(new QueryCommand(params));

  // Sort by date descending
  const articles = (result.Items || []).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return response(200, { articles, count: articles.length });
}

/**
 * List all articles (admin)
 */
async function listAllArticles(queryParams = {}) {
  const { limit = 50, status } = queryParams || {};

  let params = {
    TableName: TABLE_NAME,
    Limit: parseInt(limit),
  };

  // Filter by status if provided
  if (status) {
    params = {
      ...params,
      IndexName: 'status-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': status },
    };
    const result = await docClient.send(new QueryCommand(params));
    const articles = (result.Items || []).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return response(200, { articles, count: articles.length });
  }

  // Get all articles
  const result = await docClient.send(new ScanCommand(params));
  const articles = (result.Items || []).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return response(200, { articles, count: articles.length });
}

/**
 * Get article by slug (public)
 */
async function getArticleBySlug(slug) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'slug-index',
    KeyConditionExpression: 'slug = :slug',
    ExpressionAttributeValues: { ':slug': slug },
  };

  const result = await docClient.send(new QueryCommand(params));
  const article = result.Items?.[0];

  if (!article || article.status !== 'published') {
    return response(404, { error: 'Article not found' });
  }

  return response(200, { article });
}

/**
 * Get article by ID (admin)
 */
async function getArticleById(id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };

  const result = await docClient.send(new GetCommand(params));

  if (!result.Item) {
    return response(404, { error: 'Article not found' });
  }

  return response(200, { article: result.Item });
}

/**
 * Create new article (admin)
 */
async function createArticle(data) {
  const { title, excerpt, source, sourceUrl, category, featured_image, date, status = 'draft' } = data;

  // Validation
  if (!title || !excerpt || !source || !sourceUrl) {
    return response(400, {
      error: 'Missing required fields',
      required: ['title', 'excerpt', 'source', 'sourceUrl'],
    });
  }

  const id = uuidv4();
  const slug = generateSlug(title);
  const now = new Date().toISOString();

  const article = {
    id,
    slug,
    title,
    excerpt,
    source,
    sourceUrl,
    category: category || 'News',
    featured_image: featured_image || null,
    date: date || now.split('T')[0],
    readTime: calculateReadTime(excerpt),
    status,
    created_at: now,
    updated_at: now,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: article,
  };

  await docClient.send(new PutCommand(params));

  return response(201, { article, message: 'Article created successfully' });
}

/**
 * Update article (admin)
 */
async function updateArticle(id, data) {
  // First, get existing article
  const getResult = await docClient.send(
    new GetCommand({ TableName: TABLE_NAME, Key: { id } })
  );

  if (!getResult.Item) {
    return response(404, { error: 'Article not found' });
  }

  const existingArticle = getResult.Item;
  const now = new Date().toISOString();

  // Build update expression
  const updateFields = ['title', 'excerpt', 'source', 'sourceUrl', 'category', 'featured_image', 'date', 'status'];
  const expressionParts = [];
  const expressionNames = {};
  const expressionValues = { ':updated_at': now };

  updateFields.forEach((field) => {
    if (data[field] !== undefined) {
      expressionParts.push(`#${field} = :${field}`);
      expressionNames[`#${field}`] = field;
      expressionValues[`:${field}`] = data[field];
    }
  });

  // Update slug if title changed
  if (data.title && data.title !== existingArticle.title) {
    expressionParts.push('#slug = :slug');
    expressionNames['#slug'] = 'slug';
    expressionValues[':slug'] = generateSlug(data.title);
  }

  // Update readTime if excerpt changed
  if (data.excerpt) {
    expressionParts.push('#readTime = :readTime');
    expressionNames['#readTime'] = 'readTime';
    expressionValues[':readTime'] = calculateReadTime(data.excerpt);
  }

  expressionParts.push('#updated_at = :updated_at');
  expressionNames['#updated_at'] = 'updated_at';

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW',
  };

  const result = await docClient.send(new UpdateCommand(params));

  return response(200, { article: result.Attributes, message: 'Article updated successfully' });
}

/**
 * Delete article (admin)
 */
async function deleteArticle(id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };

  await docClient.send(new DeleteCommand(params));

  return response(200, { message: 'Article deleted successfully' });
}
