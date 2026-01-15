/**
 * Netlify Function: Form Submissions
 * Fetches form submissions from Netlify Forms API
 * Called from admin dashboard
 */

const FORM_NAME = 'press-inquiry';

export async function handler(event) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check admin API key
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
  const expectedKey = process.env.ADMIN_API_KEY || process.env.PUBLIC_ADMIN_API_KEY || 'irw-admin-secret-2024';

  if (apiKey !== expectedKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  // Get env vars
  const accessToken = process.env.NETLIFY_ACCESS_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;

  if (!accessToken || !siteId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: Missing Netlify credentials' }),
    };
  }

  // Parse query params
  const params = event.queryStringParameters || {};
  const page = parseInt(params.page || '1', 10);
  const perPage = parseInt(params.perPage || '20', 10);

  try {
    // Get all forms for the site
    const formsResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!formsResponse.ok) {
      throw new Error(`Failed to fetch forms: ${formsResponse.status}`);
    }

    const forms = await formsResponse.json();
    const targetForm = forms.find((f) => f.name === FORM_NAME);

    if (!targetForm) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Form "${FORM_NAME}" not found`, submissions: [], total: 0 }),
      };
    }

    // Get submissions for the form
    const submissionsResponse = await fetch(
      `https://api.netlify.com/api/v1/forms/${targetForm.id}/submissions?per_page=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!submissionsResponse.ok) {
      throw new Error(`Failed to fetch submissions: ${submissionsResponse.status}`);
    }

    const allSubmissions = await submissionsResponse.json();

    // Apply client-side search/filter if needed
    let filtered = allSubmissions;
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.data?.name || '').toLowerCase().includes(search) ||
          (s.data?.message || '').toLowerCase().includes(search)
      );
    }
    if (params.source) {
      filtered = filtered.filter((s) => s.data?.source === params.source);
    }

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    // Normalize response
    const submissions = paginated.map((s) => ({
      id: s.id,
      name: s.data?.name || 'Anonymous',
      message: s.data?.message || '',
      source: s.data?.source || 'unknown',
      createdAt: s.created_at,
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ submissions, total, page, perPage }),
    };
  } catch (error) {
    console.error('Form submissions error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
}
