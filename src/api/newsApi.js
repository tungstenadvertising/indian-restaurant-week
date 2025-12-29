/**
 * News API Module
 * Currently using fake/mock data - replace with real API endpoint in production
 */

// Mock news articles data
const mockNewsArticles = [
  {
    id: 1,
    title: "Indian Restaurant Week Returns to San Francisco This Diwali",
    excerpt: "Six acclaimed chefs unite for a week-long celebration of Indian cuisine, offering exclusive tasting menus that blend tradition with innovation.",
    source: "SF Chronicle",
    sourceUrl: "https://sfchronicle.com",
    date: "2025-09-15",
    image: "/images/media/news-1.jpg",
    category: "Featured",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Meet the Chefs Behind Indian Restaurant Week 2025",
    excerpt: "From ROOH's modern gastronomy to Bombay Brasserie's coastal flavors, discover the culinary visionaries crafting this year's menus.",
    source: "Eater SF",
    sourceUrl: "https://sf.eater.com",
    date: "2025-09-20",
    image: "/images/media/news-2.jpg",
    category: "Chefs",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "A Culinary Journey Through India's Regional Flavors",
    excerpt: "Indian Restaurant Week showcases the incredible diversity of Indian cuisine, from Bengal's seafood traditions to Punjab's hearty classics.",
    source: "Food & Wine",
    sourceUrl: "https://foodandwine.com",
    date: "2025-09-25",
    image: "/images/media/news-3.jpg",
    category: "Culture",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "Why Indian Restaurant Week is Bay Area's Must-Attend Food Event",
    excerpt: "With exclusive prix-fixe menus and behind-the-scenes chef experiences, this celebration of Diwali through food is not to be missed.",
    source: "7x7 Magazine",
    sourceUrl: "https://7x7.com",
    date: "2025-10-01",
    image: "/images/media/news-4.jpg",
    category: "Events",
    readTime: "4 min read"
  },
  {
    id: 5,
    title: "The Art of Diwali Feasting: A Guide to Indian Restaurant Week",
    excerpt: "Everything you need to know about reservations, menus, and making the most of San Francisco's premier Indian dining celebration.",
    source: "KQED",
    sourceUrl: "https://kqed.org",
    date: "2025-10-03",
    image: "/images/media/news-5.jpg",
    category: "Guide",
    readTime: "7 min read"
  },
  {
    id: 6,
    title: "From Street Food to Fine Dining: Indian Cuisine's Evolution",
    excerpt: "Indian Restaurant Week highlights how traditional recipes are being reimagined by a new generation of innovative chefs.",
    source: "Bon Appétit",
    sourceUrl: "https://bonappetit.com",
    date: "2025-10-05",
    image: "/images/media/news-6.jpg",
    category: "Trends",
    readTime: "5 min read"
  }
];

/**
 * Simulates API delay for realistic async behavior
 * @param {number} ms - milliseconds to delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all news articles
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of articles to return
 * @param {string} options.category - Filter by category
 * @returns {Promise<Array>} Array of news articles
 */
export async function fetchNewsArticles({ limit = 6, category = null } = {}) {
  // Simulate network delay (remove in production)
  await delay(300);

  let articles = [...mockNewsArticles];

  // Filter by category if specified
  if (category) {
    articles = articles.filter(article =>
      article.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Apply limit
  articles = articles.slice(0, limit);

  return articles;
}

/**
 * Fetch a single news article by ID
 * @param {number} id - Article ID
 * @returns {Promise<Object|null>} Article object or null if not found
 */
export async function fetchNewsArticleById(id) {
  await delay(200);
  return mockNewsArticles.find(article => article.id === id) || null;
}

/**
 * Get all available categories
 * @returns {Promise<Array<string>>} Array of category names
 */
export async function fetchCategories() {
  await delay(100);
  const categories = [...new Set(mockNewsArticles.map(article => article.category))];
  return categories;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatArticleDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Export mock data for SSR/build-time use
export { mockNewsArticles };

