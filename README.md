# Indian Restaurant Week Landing Page

A beautiful, responsive landing page for Indian Restaurant Week, built with **Tailwind CSS v4** and **Vite** for modern development experience.

## ✨ Features

### 🎯 **Hero Section with Interactive Elements**
- **6 Interactive Food Elements**: Hover over each food icon to see detailed descriptions
- **Responsive Design**: Adapts beautifully to all screen sizes
- **Gradient Background**: Warm, inviting colors that represent Indian cuisine

### 👨‍🍳 **Chef Showcase**
- **6 Chef Profiles**: Each with unique stories and culinary expertise
- **Interactive Popups**: Click on any chef to see their detailed biography
- **Beautiful Imagery**: Professional chef photos with hover effects

### 📱 **Mobile-First Design**
- **Responsive Navigation**: Burger menu for mobile devices
- **Touch-Friendly**: Optimized for both desktop and mobile interactions
- **Smooth Animations**: CSS transitions and JavaScript animations

### 🚀 **Modern Development Stack**
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **Vite**: Lightning-fast build tool with HMR
- **Live Reload**: Automatic browser refresh on file changes
- **Image Optimization**: Built-in image compression and optimization

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS v4, Vanilla JavaScript
- **Build Tool**: Vite 5.0
- **CSS Framework**: Tailwind CSS v4
- **Image Optimization**: vite-plugin-imagemin
- **Development Server**: Vite Dev Server with HMR

## 📁 Project Structure

```
IndianRestaurantWeek/
├── index.html              # Vite entry point
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies and scripts
├── src/
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Tailwind CSS import
│   └── script.js           # Interactive functionality
├── dist/                   # Production build (generated)
└── README.md               # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IndianRestaurantWeek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Development server will automatically open at `http://localhost:3000`
   - Live reload is enabled - changes will refresh automatically

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:prod` | Production build with optimizations |
| `npm run preview` | Preview production build locally |
| `npm run serve` | Serve production build on port 4173 |
| `npm run clean` | Remove build directory |

## 🔧 Development Features

### **Live Reload & HMR**
- **Hot Module Replacement**: Instant updates without page refresh
- **File Watching**: Automatic detection of file changes
- **Browser Sync**: Real-time synchronization across devices

### **Image Optimization**
- **Automatic Compression**: JPEG, PNG, GIF, SVG optimization
- **Quality Control**: Configurable compression settings
- **Format Conversion**: WebP support for modern browsers

### **Build Optimization**
- **Tree Shaking**: Remove unused CSS and JavaScript
- **Minification**: Compress CSS, JS, and HTML
- **Asset Optimization**: Optimize and hash assets for caching
- **Source Maps**: Debug-friendly development experience

## 🎨 Tailwind CSS v4 Features

- **Utility-First**: Rapid UI development with utility classes
- **Responsive Design**: Mobile-first responsive utilities
- **Custom Colors**: Indian-themed color palette
- **Modern CSS**: Latest CSS features and animations
- **Zero Runtime**: No JavaScript overhead

## 📱 Responsive Breakpoints

- **Mobile**: `< 768px` (default)
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`
- **Large Desktop**: `> 1280px`

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS 14+, Android 10+)

## 🚀 Performance Features

- **Fast Loading**: Optimized bundle sizes
- **Image Optimization**: Compressed and optimized images
- **CSS Purging**: Remove unused Tailwind classes
- **Lazy Loading**: Efficient resource loading
- **Caching**: Optimized asset caching strategies

## 🔧 Customization

### **Colors**
Modify the color scheme in `src/style.css`:
```css
@import "tailwindcss";

/* Custom color palette */
:root {
  --color-primary: #d63031;    /* Indian Red */
  --color-secondary: #ff6b6b;  /* Coral */
  --color-accent: #ffeaa7;     /* Golden Yellow */
}
```

### **Content**
- **Chef Information**: Update chef data in `src/script.js`
- **Hero Elements**: Modify food items in `src/index.html`
- **Text Content**: Edit all text content directly in HTML

### **Images**
- Replace placeholder images with actual chef photos
- Images are automatically optimized during build
- Supported formats: JPG, PNG, GIF, SVG, WebP

## 📦 Build Process

### **Development Build**
```bash
npm run dev
# Features: HMR, live reload, source maps, fast refresh
```

### **Production Build**
```bash
npm run build
# Features: Minification, optimization, asset hashing
```

### **Build Output**
- **HTML**: Minified and optimized
- **CSS**: Purged, minified, and optimized
- **JavaScript**: Minified and tree-shaken
- **Images**: Compressed and optimized
- **Assets**: Hashed for cache busting

## 🔍 SEO & Performance

- **Semantic HTML**: Proper heading hierarchy and structure
- **Meta Tags**: Optimized for search engines
- **Image Alt Text**: Descriptive alt attributes for accessibility
- **Performance**: Optimized Core Web Vitals
- **Mobile-First**: Responsive design for all devices

## 🚀 Deployment

### **Static Hosting**
```bash
npm run build
# Deploy the `dist/` folder to any static host
```

### **Netlify/Vercel**
- Connect your repository
- Build command: `npm run build`
- Publish directory: `dist`

### **Traditional Hosting**
- Upload `dist/` contents to your web server
- Configure server for SPA routing if needed

## 🐛 Troubleshooting

### **Common Issues**

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Build errors**
   ```bash
   npm run clean
   npm install
   npm run build
   ```

3. **Image optimization issues**
   - Check image formats (JPG, PNG, GIF, SVG, WebP)
   - Ensure images are not corrupted
   - Verify file permissions

## 🔮 Future Enhancements

- [ ] Newsletter subscription form
- [ ] Restaurant location map integration
- [ ] Event calendar functionality
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Advanced animations and micro-interactions
- [ ] PWA capabilities
- [ ] Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For questions or issues:
- Check the troubleshooting section
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ using Tailwind CSS v4 and Vite**
