import type { Handler, HandlerEvent } from "@netlify/functions";

/**
 * Netlify Function: Form Submissions
 * GET - Fetches form submissions from Netlify API
 * DELETE - Removes a submission by ID
 *
 * Required environment variables:
 * - NETLIFY_ACCESS_TOKEN: Personal access token from Netlify dashboard
 * - SITE_ID: Your Netlify site ID (auto-available in Netlify environment)
 */

interface NetlifyFormSubmission {
  id: string;
  number: number;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  summary?: string;
  body?: string;
  data: {
    name?: string;
    message?: string;
    source?: string;
    page?: string;
    email?: string;
    ip?: string;
    user_agent?: string;
    referrer?: string;
  };
  created_at: string;
  site_url: string;
  form_id: string;
  form_name: string;
}

interface NetlifyForm {
  id: string;
  site_id: string;
  name: string;
  paths: string[];
  submission_count: number;
  fields: string[];
  created_at: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const NETLIFY_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
  const SITE_ID = process.env.SITE_ID;

  if (!NETLIFY_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "NETLIFY_ACCESS_TOKEN not configured",
        hint: "Add NETLIFY_ACCESS_TOKEN to your Netlify environment variables"
      }),
    };
  }

  if (!SITE_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "SITE_ID not available",
        hint: "This should be auto-available when deployed to Netlify"
      }),
    };
  }

  // Handle DELETE request
  if (event.httpMethod === "DELETE") {
    const submissionId = event.queryStringParameters?.id;

    if (!submissionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing submission ID" }),
      };
    }

    try {
      const deleteResponse = await fetch(
        `https://api.netlify.com/api/v1/submissions/${submissionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${NETLIFY_TOKEN}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete: ${deleteResponse.status}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, deletedId: submissionId }),
      };
    } catch (error) {
      console.error("Error deleting submission:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Failed to delete submission",
          details: error instanceof Error ? error.message : "Unknown error"
        }),
      };
    }
  }

  // Handle GET request
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // First, get all forms to find the press-inquiry form ID
    const formsResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`,
      {
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
        },
      }
    );

    if (!formsResponse.ok) {
      throw new Error(`Failed to fetch forms: ${formsResponse.status}`);
    }

    const forms: NetlifyForm[] = await formsResponse.json();

    // Find the press-inquiry form
    const inquiryForm = forms.find((f) => f.name === "press-inquiry");

    if (!inquiryForm) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          submissions: [],
          total: 0,
          message: "No press-inquiry form found. Submit a form first to create it."
        }),
      };
    }

    // Fetch submissions for this form
    const submissionsResponse = await fetch(
      `https://api.netlify.com/api/v1/forms/${inquiryForm.id}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
        },
      }
    );

    if (!submissionsResponse.ok) {
      throw new Error(`Failed to fetch submissions: ${submissionsResponse.status}`);
    }

    const rawSubmissions: NetlifyFormSubmission[] = await submissionsResponse.json();

    // Transform submissions to a cleaner format
    const submissions = rawSubmissions.map((sub) => ({
      id: sub.id,
      number: sub.number,
      name: sub.data?.name || sub.name || "Anonymous",
      email: sub.data?.email || sub.email || "",
      message: sub.data?.message || sub.body || "",
      source: sub.data?.source || "unknown",
      ip: sub.data?.ip || "",
      userAgent: sub.data?.user_agent || "",
      createdAt: sub.created_at,
      formName: sub.form_name,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        submissions,
        total: submissions.length,
        formId: inquiryForm.id,
        formName: inquiryForm.name,
      }),
    };

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch submissions",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
    };
  }
};

export { handler };
