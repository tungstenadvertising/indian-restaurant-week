import type { APIRoute } from 'astro';

export const prerender = false;

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const DEFAULT_FORM_NAME = 'press-inquiry';
const MAX_PER_PAGE = 50;

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const getAdminKey = () =>
  import.meta.env.ADMIN_API_KEY ||
  import.meta.env.PUBLIC_ADMIN_API_KEY ||
  'irw-admin-secret-2024';

const normalizeSubmission = (submission: any) => {
  const data = submission?.data && typeof submission.data === 'object' ? submission.data : {};

  return {
    id: submission?.id,
    createdAt: submission?.created_at || submission?.createdAt || null,
    name: data.name || '',
    email: data.email || '',
    message: data.message || '',
    source: data.source || 'unknown',
  };
};

const fetchNetlify = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Netlify API error (${response.status})`);
  }

  return response.json();
};

const getFormIdByName = async (siteId: string, token: string, formName: string) => {
  const formsUrl = `${NETLIFY_API_BASE}/sites/${siteId}/forms`;
  const forms = await fetchNetlify(formsUrl, token);
  const form = Array.isArray(forms) ? forms.find((entry) => entry?.name === formName) : null;
  return form?.id || null;
};

export const GET: APIRoute = async ({ request, url }) => {
  const token = import.meta.env.NETLIFY_ACCESS_TOKEN;
  const siteId = import.meta.env.NETLIFY_SITE_ID;

  if (!token || !siteId) {
    return jsonResponse(500, { error: 'Netlify API credentials are not configured.' });
  }

  const adminKey = getAdminKey();
  const incomingKey = request.headers.get('x-api-key');
  if (!incomingKey || incomingKey !== adminKey) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const formName = url.searchParams.get('formName') || DEFAULT_FORM_NAME;
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number.parseInt(url.searchParams.get('perPage') || '20', 10))
  );
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  const source = (url.searchParams.get('source') || '').trim().toLowerCase();

  try {
    const formId = await getFormIdByName(siteId, token, formName);
    if (!formId) {
      return jsonResponse(404, { error: `Form '${formName}' not found.` });
    }

    const submissionsUrl = `${NETLIFY_API_BASE}/forms/${formId}/submissions?page=${page}&per_page=${perPage}`;
    const submissions = await fetchNetlify(submissionsUrl, token);

    let normalized = Array.isArray(submissions)
      ? submissions.map(normalizeSubmission)
      : [];

    if (source) {
      normalized = normalized.filter((entry) => entry.source.toLowerCase() === source);
    }

    if (search) {
      normalized = normalized.filter((entry) => {
        const haystack = `${entry.name} ${entry.email} ${entry.message} ${entry.source}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    normalized.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return jsonResponse(200, {
      submissions: normalized,
      page,
      perPage,
      count: normalized.length,
      formName,
    });
  } catch (error: any) {
    return jsonResponse(500, {
      error: error?.message || 'Failed to fetch submissions.',
    });
  }
};
