# Indian Restaurant Week

A beautiful, responsive landing page for Indian Restaurant Week, built with **Astro 7**, **Tailwind CSS v4**, and modern web technologies.

## ✨ Features

### 🎯 **Interactive Restaurant Carousel**
- **Dynamic Restaurant Showcase**: Circular carousel with animated dish images
- **Logo Transitions**: Smooth logo crossfade when switching restaurants
- **Click-to-View**: Interactive popups for chef stories and menus

### 👨‍🍳 **Chef & Restaurant Profiles**
- **6 Featured Chefs**: Each with unique stories and culinary heritage
- **Chef Popups**: Detailed biographies with image sliders (Swiper.js)
- **Menu Popups**: Full menu previews with reservation links
- **URL-based Navigation**: Shareable links to chef/restaurant popups

### 🗺️ **Interactive Map**
- **Mapbox Integration**: Restaurant locations with custom markers
- **Click-to-Navigate**: Map pins link to restaurant popups
- **Responsive Design**: Adapts to all screen sizes

### 📱 **Mobile-First Design**
- **Responsive Navigation**: Slide-out menu for mobile devices
- **Touch-Friendly**: Optimized for both desktop and mobile
- **Smooth Animations**: GSAP-powered transitions

### 🚀 **Modern Stack**
- **Astro 7**: Static site generation with a Rust compiler and Vite 8 / Rolldown
- **Tailwind CSS v4**: Utility-first CSS with custom design tokens
- **Vite 8**: HMR in development; Rolldown for production bundling
- **Image Optimization**: Automatic WebP conversion and responsive images

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Astro 7.2** | Static site framework (Rust compiler) |
| **Tailwind CSS v4** | Styling |
| **Vite 8 / Rolldown** | Dev server and production bundler |
| **GSAP** | Animations |
| **Swiper.js** | Touch sliders |
| **Mapbox GL** | Interactive maps |
| **Sharp** | Image processing |

## 📁 Project Structure

```
IndianRestaurantWeek/
├── astro.config.mjs        # Astro + Vite/Rolldown build config
├── netlify.toml            # Netlify build command, dist/, Node 24
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies & scripts
├── public/
│   ├── _redirects          # Netlify redirects
│   ├── data/
│   │   └── restaurants.json    # Restaurant data
│   ├── fonts/              # Custom fonts (Ysabeau)
│   └── images/
│       ├── chefs/          # Chef/restaurant images
│       ├── global/         # Site-wide assets
│       └── ui/             # UI elements
├── src/
│   ├── components/
│   │   ├── Navigation.astro
│   │   ├── PopupWrapper.astro
│   │   └── WaveDivider.astro
│   ├── content/
│   │   ├── config.ts       # Content collections
│   │   └── media/          # Blog/media posts
│   ├── images/             # Astro-optimized images
│   ├── layouts/
│   │   └── Layout.astro    # Base layout
│   ├── pages/
│   │   ├── index.astro     # Home page
│   │   └── media/          # Media section
│   ├── script.js           # Main JavaScript
│   └── style.css           # Global styles
├── scripts/
│   └── convert-images-to-webp.js
└── dist/                   # Production build
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 22.12+** (Astro 7). Local and Netlify are on **Node 24**.
- npm 9.6.5+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd IndianRestaurantWeek

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will open at `http://localhost:3000` with hot module replacement.

## ⚙️ Build system

Production builds run through **Astro 7** on **Vite 8** (Rolldown), not the older Vite 7 / Rollup pipeline.

| Piece | Where |
|-------|--------|
| Framework & HTML compiler | `astro.config.mjs` (`output: 'static'`) |
| Tailwind | `@tailwindcss/vite` plugin in `astro.config.mjs` |
| Vendor chunks (GSAP, Swiper, Mapbox) | `vite.environments.client.build.rolldownOptions` |
| Minify | Terser (`minify: 'terser'`) |
| HTML whitespace | `compressHTML: true` (same as Astro 5/6, not the v7 JSX default) |
| Host Node version | `netlify.toml` → `NODE_VERSION = "24"` |

```bash
npm run build    # astro build, then WebP conversion
```

Output is `dist/`. The Rust compiler requires valid HTML (void elements like `<img>` must not have a closing `</img>`).

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro dev server with HMR |
| `npm run build` | Build for production + optimize images |
| `npm run preview` | Preview production build locally |
| `npm run serve` | Serve production build on port 4173 |
| `npm run clean` | Remove build directory |

## 🎨 Customization

### Seasonal Switching (Holi / Diwali)

The site supports biannual seasonal themes controlled by a single field in `public/data/restaurants.json`:

```json
"activeSeason": "holi"   // or "diwali"
```

Changing this value and rebuilding switches the following automatically:

| Element | Holi | Diwali |
|---------|------|--------|
| **Body text** | "This Holi..." / "spirit of Holi" | "This Diwali..." / "spirit of Diwali" |
| **Hero background** | Purple gradient with spring overlay | Dark maroon/burgundy gradient |
| **Round image** | `holi-round-image.png` (color powders) | `candles.png` (Diwali diyas) |
| **Explosion animation** | GSAP scroll-triggered burst + pin | Disabled (static hero) |
| **Restaurant menus** | `seasonalMenus.holi` entries | Default `menu` entries |

**How it works:**
- `activeSeason` is read at build time in the Astro frontmatter and injected client-side as `window.__ACTIVE_SEASON__`
- The homepage derives `seasonName`, `roundImage`, `heroBgColor`, and `heroPatternColor` from the active season
- A `season-{name}` CSS class on the hero section toggles the spring overlay in `style.css`
- The GSAP explosion animation checks `window.__ACTIVE_SEASON__` at runtime
- Restaurant menus use `getActiveMenu()` from `src/scripts/shared.js` to select seasonal or default menus

### Restaurant Data
Edit `public/data/restaurants.json` to update:
- Chef profiles and bios
- Restaurant information
- Menu items and prices
- Images and reservation links
- Seasonal menus (add entries under `popup.seasonalMenus.holi` or `popup.seasonalMenus.diwali`)

### Styling
The project uses Tailwind CSS v4 with custom design tokens in `src/style.css`:

```css
/* Custom color palette */
--color-irw-red: #C0372C;
--color-irw-orange: #E78824;
--color-irw-amber: #FFA444;
--color-irw-sand: #FDEFDA;
```

### Images
- Place chef images in `public/images/chefs/{chef-slug}/`
- Required images per chef:
  - `profile.png` - Chef portrait
  - `dish.png` - Featured dish
  - `logo.webp` / `logo-176.webp` - Restaurant logo
  - `chef-popup-header.jpg` - Popup header
  - `menu-image.jpg` - Menu preview
  - `slides/slide-{1,2,3}.jpg` - Gallery images

## 📱 Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile | `< 768px` |
| Tablet | `768px - 1024px` |
| Desktop | `> 1024px` |
| Large Desktop | `> 1280px` |

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS 14+, Android 10+)

## 🚀 Deployment

### Netlify (Recommended)
The project includes `_redirects` for SPA-style routing:

```bash
npm run build
# Deploy the dist/ folder
```

Build settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js**: `24` (set in `netlify.toml` and the Netlify UI)

### Other Static Hosts
Upload the `dist/` folder contents to any static hosting service.

## 🔧 Key Features Explained

### URL-Based Popup Routing
Popups support shareable URLs:
- `/chef/{chef-slug}` - Opens chef bio popup
- `/restaurant/{chef-slug}` - Opens menu popup

### Image Optimization Pipeline
1. Source images in `public/images/`
2. Build-time WebP conversion via `scripts/convert-images-to-webp.js`
3. Responsive srcsets for different viewport sizes
4. Astro's `<Image>` component for build-time optimization

### Performance Optimizations
- **Code Splitting**: Rolldown vendor chunks for GSAP, Swiper, Mapbox
- **Font Loading**: Preloaded with `font-display: swap`
- **Image Loading**: Lazy loading with LQIP blur-up
- **Static Generation**: Pre-rendered HTML at build time

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

If the Astro compiler errors on unexpected tokens or closing tags, check for invalid HTML (for example `</img>` on a void element).

### Image Issues
- Ensure images are valid JPG/PNG/WebP
- Check file permissions
- Verify paths in `restaurants.json`

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ using Astro 7, Tailwind CSS v4, and Vite 8**
