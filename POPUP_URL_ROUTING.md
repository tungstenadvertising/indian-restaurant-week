# Popup URL Routing Implementation

This document explains the URL routing functionality implemented for the Indian Restaurant Week website, similar to the Ogilvy website's popup system.

## Overview

The website now supports individual URLs for each popup (chef and dish popups), allowing users to:
- **Share direct links** to specific popups with friends
- **Bookmark popup content** for easy access
- **Use browser back/forward navigation** seamlessly
- **Refresh the page** while maintaining the popup state
- **Visit URLs directly** - when someone opens a popup URL, the popup automatically opens

## URL Structure

### Chef Popups
- **Pattern**: `/chef/[chef-name]`
- **Examples**:
  - `/chef/ashish-tiwari` - Shows Chef Ashish Tiwari's popup
  - `/chef/pujan-sarkar` - Shows Chef Pujan Sarkar's popup
  - `/chef/thomas-george` - Shows Chef Thomas George's popup

### Restaurant Popups
- **Pattern**: `/restaurant/[restaurant-name]`
- **Examples**:
  - `/restaurant/rooh` - Shows ROOH's restaurant popup
  - `/restaurant/tiya` - Shows Tiya's restaurant popup
  - `/restaurant/bombay-brasserie` - Shows Bombay Brasserie's restaurant popup
  - `/restaurant/amber-india` - Shows Amber India's restaurant popup
  - `/restaurant/new-delhi-restaurant` - Shows New Delhi Restaurant's popup

## Technical Implementation

### 1. PopupRouter Class
- Manages URL state and browser history
- Handles initial URL parsing on page load
- Manages browser back/forward navigation
- Updates URLs when popups are opened/closed

### 2. Updated Popup Classes
- **ChefPopup**: Now includes `showPopupWithURL()` and `hidePopupWithURL()` methods
- **DishPopup**: Now includes `showPopupWithURL()` and `hidePopupWithURL()` methods
- Both classes integrate with the PopupRouter for URL management
- Restaurant names are converted to URL-friendly format (lowercase, spaces to hyphens)
- Chef names are converted to URL-friendly format (lowercase, spaces to hyphens, "Chef" prefix removed)

### 3. Server Configuration
- **Development**: Vite configured with `historyApiFallback: true`
- **Production**: Netlify `_redirects` file handles client-side routing

## How It Works

1. **Opening a Popup**:
   - User clicks on a chef or dish element
   - `showPopupWithURL()` is called
   - PopupRouter updates the URL using `history.pushState()`
   - Popup is displayed

2. **Closing a Popup**:
   - User clicks close button, overlay, or presses Escape
   - `hidePopupWithURL()` is called
   - PopupRouter updates URL back to main page
   - Popup is hidden

3. **Browser Navigation**:
   - Back/forward buttons trigger `popstate` event
   - PopupRouter handles the event and shows/hides appropriate popup
   - URL is updated accordingly

4. **Direct URL Access**:
   - User visits a popup URL directly (e.g., shared by a friend)
   - PopupRouter waits for restaurants data to load
   - PopupRouter checks initial URL and finds the popup pattern
   - Appropriate popup is automatically shown
   - User sees the popup immediately without any additional clicks

## Files Modified

- `src/script.js` - Added PopupRouter class and updated popup classes
- `vite.config.ts` - Added historyApiFallback for development
- `public/_redirects` - Added Netlify redirects for production
- `POPUP_URL_ROUTING.md` - This documentation file

## Important Notes

### Data Loading Fix
- **Issue**: When visiting direct URLs (like `/restaurant/rooh`), the restaurants.json data wasn't loading due to relative path issues
- **Solution**: Changed data loading paths to use absolute paths (`/src/data/restaurants.json` instead of `src/data/restaurants.json`)
- **Result**: Data now loads correctly regardless of the current URL path

## Testing

To test the functionality:

1. **Development**: Run `npm run dev` and visit:
   - `http://localhost:3000/chef/pujan-sarkar`
   - `http://localhost:3000/restaurant/tiya`
   - `http://localhost:3000/restaurant/amber-india`
   - `http://localhost:3000/restaurant/new-delhi-restaurant`

2. **Production**: Deploy and visit:
   - `https://your-domain.com/chef/pujan-sarkar`
   - `https://your-domain.com/restaurant/tiya`
   - `https://your-domain.com/restaurant/amber-india`
   - `https://your-domain.com/restaurant/new-delhi-restaurant`

3. **Browser Navigation**:
   - Open a popup, then use browser back button
   - Use forward button to return to popup
   - Refresh page while popup is open

4. **Direct URL Sharing**:
   - Copy a popup URL (e.g., `http://localhost:3005/chef/pujan-sarkar` or `http://localhost:3005/restaurant/amber-india`)
   - Share it with a friend
   - When they open the URL, the popup should automatically appear
   - Test with different chef and restaurant URLs

## Browser Support

- Modern browsers with History API support
- Graceful fallback to direct popup functionality if router is unavailable
- No impact on existing functionality

## Debugging

Console logs are added for debugging:
- `PopupRouter: Checking initial URL: [path]`
- `PopupRouter: Showing chef/restaurant popup for: [id/name]`
- `PopupRouter: Updated URL to: [url]`

Remove these logs in production by deleting the `console.log` statements.
