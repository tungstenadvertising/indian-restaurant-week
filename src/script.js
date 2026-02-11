// Import GSAP and ScrollTrigger
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Dynamic import functions for heavy libraries
let mapboxgl = null;
let Swiper = null;
let Navigation = null;
let EffectCards = null;

// Function to dynamically load Mapbox GL JS
async function loadMapbox() {
    if (mapboxgl) return mapboxgl;

    try {
        // Load Mapbox CSS dynamically
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
            document.head.appendChild(link);
        }

        // Load Mapbox JS dynamically
        const mapboxModule = await import('mapbox-gl');
        mapboxgl = mapboxModule.default;
        window.mapboxgl = mapboxgl;

        console.log('Mapbox GL JS loaded dynamically');
        return mapboxgl;
    } catch (error) {
        console.error('Failed to load Mapbox GL JS:', error);
        throw error;
    }
}

// Function to dynamically load Swiper
async function loadSwiper() {
    if (Swiper && Navigation && EffectCards) return { Swiper, Navigation, EffectCards };

    try {
        // Load Swiper CSS dynamically
        if (!document.querySelector('link[href*="swiper-bundle.min.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
            document.head.appendChild(link);
        }

        // Load Swiper JS dynamically
        const swiperModule = await import('swiper');
        const navigationModule = await import('swiper/modules');
        const effectCardsModule = await import('swiper/modules');

        Swiper = swiperModule.default;
        Navigation = navigationModule.Navigation;
        EffectCards = effectCardsModule.EffectCards;

        console.log('Swiper loaded dynamically');
        return { Swiper, Navigation, EffectCards };
    } catch (error) {
        console.error('Failed to load Swiper:', error);
        throw error;
    }
}

// Body scroll freeze utilities (global scope)
let scrollPosition = 0;

function freezeBodyScroll() {
    // Store current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Apply styles to freeze scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
}

function unfreezeBodyScroll() {
    // Remove freeze styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Load restaurant data early
    await loadRestaurantData();

    // Progressive image loading: Hero texture blur-up
    const heroTexture = document.querySelector('.hero-texture');
    if (heroTexture) {
        const fullImage = new Image();
        fullImage.onload = () => {
            heroTexture.classList.add('loaded');
        };
        fullImage.src = '/images/global/hero-texture.webp';
    }

// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLogo = document.querySelector('#mobile-logo img');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

gsap.set([mobileLogo, mobileCloseBtn], {
    scale: 0.8,
    x: -50,
    opacity: 0
});
gsap.set(mobileNavLinks, {
    scale: 0.8,
    x: -50,
    opacity: 0
});

function setInitialAnimationStates() {
    gsap.to([mobileLogo, mobileCloseBtn], {
        scale: 0.8,
        x: -50,
        opacity: 0
    });
    gsap.to(mobileNavLinks, {
        scale: 0.8,
        x: -50,
        opacity: 0
    });
}
    if (navToggle && mobileMenu) {
            navToggle.addEventListener('click', (e) => {
            e.preventDefault();

            const isOpen = mobileMenu.classList.contains('translate-x-0');

            if (isOpen) {
                closeMobileMenu();
            } else {

                // Slide burger out of view
                navToggle.style.transform = 'translateX(100px)';
                navToggle.style.opacity = '0';

                // Small delay before opening menu for smooth transition
                setTimeout(() => {
                    mobileMenu.classList.remove('-translate-x-full');
                    mobileMenu.classList.add('translate-x-0');

                   gsap.to(mobileLogo, {
                    scale: 1,
                    x: 0,
                    opacity: 1,
                    duration: 0.5,
                    delay: 0.2,
                    ease: "power2.inOut"
                   });

                   gsap.to(mobileCloseBtn, {
                    scale: 1,
                    x: 0,
                    opacity: 1,
                    duration: 0.5,
                    delay: 0.3,
                    ease: "power2.inOut"
                   });

                    gsap.fromTo(mobileNavLinks,{
                        scale: 0.95,
                        x: -25,
                        opacity: 0
                    }, {
                        scale: 1,
                        x: 0,
                        opacity: 1,
                        duration: 0.5,
                        stagger: 0.1,
                        delay: 0.3,
                        ease: "power2.inOut"
                    });



                    // Freeze body scrolling with scroll position preservation
                    freezeBodyScroll();
                }, 100);

            }
});

        // Function to close mobile menu
        function closeMobileMenu() {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('-translate-x-full');


            // Re-enable page scrolling
            unfreezeBodyScroll();

            // Slide burger back into view
            setTimeout(() => {
                navToggle.style.transform = 'translateX(0)';
                navToggle.style.opacity = '1';
            }, 150);

            setInitialAnimationStates();
        }

        // Close mobile menu when clicking close button
        const mobileCloseBtn = document.getElementById('mobile-close-btn');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', closeMobileMenu);
        }

        // Close mobile menu when clicking on a mobile nav link (but not restaurants dropdown)
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            // Don't close mobile menu if clicking on restaurants dropdown toggle
            if (!link.closest('.mobile-restaurants-dropdown')) {
                link.addEventListener('click', closeMobileMenu);
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('translate-x-0') &&
                !navToggle.contains(e.target) &&
                !mobileMenu.contains(e.target) &&
                !e.target.closest('.mobile-restaurants-dropdown')) {
                closeMobileMenu();
            }
        });

        // Close mobile menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('translate-x-0')) {
                closeMobileMenu();
            }
        });
    } else {
        console.error('Mobile navigation elements not found!');
    }



    // Smooth scrolling for navigation links (only for actual nav links, not all anchor links)
    document.querySelectorAll('nav a[href^="#"], .mobile-nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Global variables to store map and marker references
let map;
let markers = [];
let restaurants = [];

// Function to get restaurant data from global (injected at build time via Layout.astro)
function getRestaurantData() {
    if (restaurants.length === 0) {
        restaurants = window.__RESTAURANTS__ || [];
        console.log('Restaurant data loaded from global:', restaurants.length, 'restaurants');
    }
    return restaurants;
}

// Legacy async wrapper for compatibility (now synchronous)
async function loadRestaurantData() {
    return getRestaurantData();
}

// Get active season from global (injected at build time)
function getActiveSeason() {
    return window.__ACTIVE_SEASON__ || null;
}

// Get the active menu for a restaurant (seasonal or default)
function getActiveMenu(restaurantData) {
    const activeSeason = getActiveSeason();

    // Check if there's a seasonal menu for the active season
    if (activeSeason && restaurantData.popup?.seasonalMenus?.[activeSeason]) {
        return restaurantData.popup.seasonalMenus[activeSeason];
    }

    // Fall back to the default menu
    return restaurantData.popup?.menu || null;
}

// Get menu price - check seasonal menu first, then popup level
function getActiveMenuPrice(restaurantData) {
    const activeMenu = getActiveMenu(restaurantData);

    // If the active menu has its own price, use it
    if (activeMenu?.menuPrice) {
        return activeMenu.menuPrice;
    }

    // Fall back to popup-level price
    return restaurantData.popup?.menuPrice || 'Price';
}

// Function to set up location section animations with ScrollTrigger
function setupLocationAnimations() {
    const locationListItems = document.querySelectorAll('.location-list-item .location-list-item-container');

    if (locationListItems.length === 0) {
        console.warn('No location list items found for animation setup');
        return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // For reduced motion, set final states immediately
        gsap.set(locationListItems, {
            opacity: 1,
            y: 0
        });
        return;
    }


    // Create entrance animations with stagger effect
    gsap.to(locationListItems, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power.inOut",
        scrollTrigger: {
            trigger: "#restaurant-list",
            start: "top 80%",
            toggleActions: "play none none none",
            once: true
        }
    });
}



// Initialize Mapbox Map and Load Restaurant Data
async function initializeMap() {
    try {
        // Load Mapbox dynamically
        const mapbox = await loadMapbox();

        // You'll need to get a Mapbox access token from https://mapbox.com
        // For now, let's use a demo token or you can get your own
        mapbox.accessToken = 'pk.eyJ1IjoidHVuZ3N0ZW5hZHZlcnRpc2luZyIsImEiOiJja2dsZGNyZjAwMXltMnNqbzNrYTIwb210In0.PFX4yyFsRcpGMyQJV3uOkA';

        // Initialize the map
        map = new mapbox.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12', // Using a stable Mapbox style
            center: [-122.4142, 37.7894], // San Francisco center
            zoom: 12,

            antialias: false,
            fadeDuration: 0,
            trackResize: false,
            renderWorldCopies: false

        });


    // Add error handling for map loading
    map.on('error', (e) => {
        console.error('Mapbox error:', e);
        document.getElementById('map').innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-200 rounded-lg">
                <div class="text-center text-gray-600">
                    <p class="text-lg font-semibold mb-2">Map Unavailable</p>
                    <p class="text-sm">Please check your Mapbox token</p>
                </div>
            </div>
        `;
    });

    // Ensure map fills container height
    map.on('load', () => {
        map.resize();
        // Force canvas to fill container
        const canvas = map.getCanvas();
        const container = document.getElementById('map');
        canvas.style.height = '100%';
        canvas.style.width = '100%';
    });



    // Use already loaded restaurant data
    if (restaurants.length === 0) {
        console.log('Restaurant data not yet loaded, loading now...');
        await loadRestaurantData();
    }

        // Add markers for each restaurant
        restaurants.forEach((restaurant, index) => {
            // Create a custom marker element with SVG
            const markerEl = document.createElement('div');
            markerEl.className = 'mapboxgl-marker restaurant-marker';
            markerEl.setAttribute('data-restaurant-id', restaurant.id);
            markerEl.style.cssText = `
                width: 48px;
                height: 48px;
                cursor: pointer;
            `;

            // Add the SVG content
            markerEl.innerHTML = `
                <svg class="restaurant-marker-svg" xmlns="http://www.w3.org/2000/svg" width="27" height="33" fill="#ffffffaa" viewBox="0 0 27 33" style="width: 80%; height: 80%; margin: auto;">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M24.75 14c0 8.75-11.25 16.25-11.25 16.25S2.25 22.75 2.25 14a11.25 11.25 0 1 1 22.5 0Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M13.5 17.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"/>
                </svg>
            `;

            // Create popup content
            const popupContent = `
                <div class="p-3">
                    <h3 class="font-bold text-lg text-gray-800">${restaurant.name}</h3>
                    <p class="text-sm text-gray-500">${restaurant.address}</p>
                </div>
            `;

            // Create marker and store reference
            const marker = new mapbox.Marker(markerEl)
                .setLngLat(restaurant.coordinates)
                .setPopup(new mapbox.Popup({
                    focusAfterOpen: false
                }).setHTML(popupContent))
                .addTo(map);

            // Store marker reference with restaurant data
            markers.push({
                marker: marker,
                element: markerEl,
                restaurant: restaurant,
                index: index
            });

            // Add click event to marker
            markerEl.addEventListener('click', () => {
                // Remove hover class when marker is clicked
                markerEl.classList.remove('hover');
                map.easeTo({
                    center: restaurant.coordinates,
                    zoom: 13,
                    duration: 1000,
                    essential: true
                });
                // Close any existing popups first
                closeAllPopups();
                highlightRestaurantFromMarker(restaurant.id);
            });

            // Add hover events to marker (will be set up after list is populated)
        });

        // Populate restaurant list
        populateRestaurantList(restaurants);

        // Set up location list animations after populating the list
        setupLocationAnimations();

        // Now set up marker hover events after list is populated
        markers.forEach(markerData => {
            const markerEl = markerData.element;
            const restaurant = markerData.restaurant;

            markerEl.addEventListener('mouseenter', () => {
                console.log('Marker hover enter:', restaurant.id);
                // Add hover class to corresponding list item
                const listItem = document.querySelector(`.location-list-item[data-restaurant-id="${restaurant.id}"]`);
                console.log('Found list item:', listItem);
                if (listItem && !listItem.classList.contains('hover')) {
                    listItem.classList.add('hover');
                    console.log('Added hover class to list item');
                }
            });

            markerEl.addEventListener('mouseleave', () => {
                console.log('Marker hover leave:', restaurant.id);
                // Remove hover class from corresponding list item
                const listItem = document.querySelector(`.location-list-item[data-restaurant-id="${restaurant.id}"]`);
                if (listItem) {
                    listItem.classList.remove('hover');
                    console.log('Removed hover class from list item');
                }
            });
        });

        // Debug: Log markers and list items
        console.log('Total markers created:', markers.length);
        console.log('Total list items:', document.querySelectorAll('.location-list-item').length);
    } catch (error) {
        console.error('Failed to initialize map:', error);
        document.getElementById('map').innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-200 rounded-lg">
                <div class="text-center text-gray-600">
                    <p class="text-lg font-semibold mb-2">Map Unavailable</p>
                    <p class="text-sm">Please check your Mapbox token</p>
                </div>
            </div>
        `;
    }
}

// Populate restaurant list
function populateRestaurantList(restaurants) {
    const restaurantList = document.getElementById('restaurant-list');

    restaurantList.innerHTML = `
        <ul class="space-y-4">
            ${restaurants.map(restaurant => `
                <li class="location-list-item block" data-restaurant-id="${restaurant.id}" >
                    <div class="location-list-item-container" style="opacity: 0; transform: translateY(10px);">
                        <div class="location-list-item-name font-extrabold text-white">${restaurant.name}</div>
                        <div class="location-list-item-address text-white/90">${restaurant.address}</div>
                        </div>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;

    // Add click and hover event listeners to restaurant list items
    const listItems = document.querySelectorAll('.location-list-item');
    console.log('Setting up event listeners for', listItems.length, 'list items');
    console.log('List items found:', listItems);

    listItems.forEach((item, index) => {
        console.log(`Setting up events for list item ${index}:`, item);
        console.log(`Restaurant ID:`, item.getAttribute('data-restaurant-id'));

        item.addEventListener('click', (e) => {
            console.log('List item clicked:', item.getAttribute('data-restaurant-id'));
            const restaurantId = item.getAttribute('data-restaurant-id');
            highlightMarkerFromRestaurant(restaurantId);
            listItems.forEach(item => {
                item.classList.remove('active');
            });
           item.classList.add('active');
        });

        // Add hover events for marker scaling
        item.addEventListener('mouseenter', () => {
            const restaurantId = item.getAttribute('data-restaurant-id');
            console.log('List item hover enter:', restaurantId, item);
            scaleMarkerOnHover(restaurantId, true);
            item.classList.add('hover');
        });

        item.addEventListener('mouseleave', () => {
            const restaurantId = item.getAttribute('data-restaurant-id');
            console.log('List item hover leave:', restaurantId);
            scaleMarkerOnHover(restaurantId, false);
            item.classList.remove('hover');
        });
    });
}

// Function to highlight restaurant list item from marker click
function highlightRestaurantFromMarker(restaurantId) {
    // Remove active class from all list items
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to corresponding list item
    const listItem = document.querySelector(`[data-restaurant-id="${restaurantId}"]`);
    if (listItem) {
        listItem.classList.add('active');
        console.log('Added active class to list item', 'restaurantId', restaurantId, 'listItem', listItem);
    }
}

// Function to highlight marker from restaurant list click
function highlightMarkerFromRestaurant(restaurantId) {
    // Remove active and hover classes from all markers
    markers.forEach(markerData => {
        markerData.element.classList.remove('active');
        markerData.element.classList.remove('hover');
    });

    // Find and highlight the corresponding marker
    const markerData = markers.find(m => m.restaurant.id === restaurantId);
    if (markerData) {
        markerData.element.classList.add('active');

        // Close any existing popups first
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            popup.remove();
        });

        // Open popup for the marker
        const popup = markerData.marker.getPopup();
        popup.addTo(map);

        // Pan to the marker location with a subtle animation
        map.easeTo({
            center: markerData.restaurant.coordinates,
            zoom:14,
            duration: 1000,
            essential: false
        });
    }


    // Add active class to clicked list item
    const listItem = document.querySelector(`[data-restaurant-id="${restaurantId}"]`);
    if (listItem) {
        listItem.classList.add('active');
    }
}

// Function to scale marker on hover
function scaleMarkerOnHover(restaurantId, isHovering) {
    const markerData = markers.find(m => m.restaurant.id === restaurantId);
    console.log('scaleMarkerOnHover:', restaurantId, isHovering, markerData);
    if (markerData) {
        if (isHovering) {
            // Only add hover scale if marker is not already active
            if (!markerData.element.classList.contains('hover') && !markerData.element.classList.contains('active')) {
                markerData.element.classList.add('hover');
                console.log('Added hover class to marker');
            }
        } else {
            markerData.element.classList.remove('hover');
            console.log('Removed hover class from marker');
        }
    }
}

// Function to close all popups
function closeAllPopups() {
    document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
        popup.remove();
    });
}

// Function to reset all highlights
function resetHighlights() {
    // Close all popups
    closeAllPopups();

    // Remove active class from all markers
    markers.forEach(markerData => {
        markerData.element.classList.remove('active');
        markerData.element.classList.remove('hover');
    });

    // Remove active and hover classes from all list items
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('hover');
    });

    // Reset map center to specified coordinates
    if (map) {
        map.easeTo({
            center: [-122.4142, 37.7894],
            zoom: 12,
            duration: 1000,
            essential: true
        });
    }
}

// Add click event to map to reset highlights when clicking on empty space
document.addEventListener('DOMContentLoaded', () => {
    // Wait for map to be initialized
    setTimeout(() => {
        if (map) {
            map.on('click', (e) => {
                // Only reset if clicking on the map itself, not on markers
                if (e.originalEvent.target.classList.contains('mapboxgl-canvas')) {
                    resetHighlights();
                }
            });

            // Add mouse leave event to zoom out to level 12
            map.getContainer().addEventListener('mouseleave', () => {
                map.easeTo({
                    zoom: 12,
                    duration: 1000,
                    essential: true
                });

                resetHighlights();
            });

            // Add mouse leave event to restaurant list to reset highlights and zoom out
            const restaurantList = document.getElementById('restaurant-list');
            if (restaurantList) {
                restaurantList.addEventListener('mouseleave', () => {
                    // Reset all highlights
                    resetHighlights();

                    // Zoom map out to level 12
                    map.easeTo({
                        zoom: 12,
                        duration: 1000,
                        essential: true
                    });
                });
            }
        }
    }, 1000);
});

// Initialize map when user scrolls to location section or clicks on it
let mapInitialized = false;

function initializeMapOnDemand() {
    if (!mapInitialized) {
        mapInitialized = true;
        initializeMap();
    }
}

// Set up intersection observer to load map when location section comes into view
document.addEventListener('DOMContentLoaded', () => {
    const locationSection = document.getElementById('location');
    if (locationSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeMapOnDemand();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(locationSection);
    }

    // Also initialize map when user clicks on location navigation
    const locationNavLinks = document.querySelectorAll('a[href="#location"]');
    locationNavLinks.forEach(link => {
        link.addEventListener('click', initializeMapOnDemand);
    });
});


// Function to set up chefs section animations with ScrollTrigger
function setupChefsAnimations() {
    // Animate chef items with stagger effect
    const chefItems = document.querySelectorAll('#chefs-list .chef');
    if (chefItems.length > 0) {

        chefItems.forEach((chefItem, index) => {
            gsap.to(chefItem, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: chefItem,
                    start: "top 70%",
                    toggleActions: "play none none none",
                    once: true
                }
            });
        });

    }
}

// gsap.fromTo('.hero-texture', {
//         y: -30,

//         transformOrigin: "center top",
//     }, {
//         y: 0,

//         duration: 2,
//         ease: "power1.inOut",
//         scrollTrigger: {
//             trigger: '.hero-texture',
//             start: "top 70%",
//             scrub: true
//         }
// });



    // gsap.fromTo('#chefs-title .irw-title', {
    //     opacity: 0,
    //     y: 10,
    // }, {
    //     opacity: 1,
    //     duration: 0.8,
    //     ease: "power2.out",
    //     y: 0,
    //     scrollTrigger: {
    //         trigger: '#chefs',
    //         start: "top bottom",
    //         toggleActions: "play none none none",
    //     }
    // })





// Only run chefs title animation if element exists (not on all pages)
if (document.querySelector('.meet-chefs-title-shape') && document.querySelector('#chefs')) {
    gsap.to('.meet-chefs-title-shape', {
        opacity: 1,
        maxWidth: '100%',
        duration: 1.3,
        ease: "power1.inOut",
        scrollTrigger: {
            trigger: '#chefs',
            start: "top 95%",
            toggleActions: "play none none none",
            once: true
        }
    });
}




// Function to set up candles and courses images scroll animations
function setupImageScrollAnimations() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        console.log('Reduced motion preference detected, skipping image scroll animations');
        return;
    }

    // Animate candles image
    const candlesImgContainer = document.getElementById('candles-img-container');
    if (candlesImgContainer) {
        // Set initial state
        gsap.set(candlesImgContainer, {
            opacity: 0,
            y: 10,
            scale: 0.95
        });

        // Create scroll trigger animation
        gsap.to(candlesImgContainer, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: candlesImgContainer,
                start: "top 80%",
                toggleActions: "play none none none",
                once: true
            }
        });
    }

    // Animate courses image
    const coursesImg = document.getElementById('courses-img');
    if (coursesImg) {
        // Set initial state
        gsap.set(coursesImg, {
            opacity: 0,
            y: 10,
            scale: 0.95
        });

        // Create scroll trigger animation
        gsap.to(coursesImg, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.inOut",
            scrollTrigger: {
                trigger: coursesImg,
                start: "top 80%",
                toggleActions: "play none none none",
                once: true
            }
        });
    }
}

// URL Routing System for Popups
class PopupRouter {
    constructor() {
        this.currentPopup = null;
        this.currentId = null;
        this.init();
    }

    init() {
        // Listen for browser navigation events
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        // Check for initial URL immediately since restaurants data is already loaded
        console.log('PopupRouter: Initializing and checking initial URL');
        this.checkInitialURL();
    }

    checkInitialURL() {
        const url = new URL(window.location);
        const path = url.pathname;

        console.log('PopupRouter: Checking initial URL:', path);
        console.log('PopupRouter: Available restaurants:', restaurants.map(r => ({ id: r.id, name: r.name, chef: r.chef })));

        // Check for chef popup URL pattern: /chef/[chef-name]
        const chefMatch = path.match(/^\/chef\/([^\/]+)$/);
        if (chefMatch) {
            const chefName = chefMatch[1];
            console.log('PopupRouter: Found chef popup URL, chefName:', chefName);
            this.showChefPopupByName(chefName);
            return;
        }

        // Check for restaurant popup URL pattern: /restaurant/[restaurant-name]
        const restaurantMatch = path.match(/^\/restaurant\/([^\/]+)$/);
        if (restaurantMatch) {
            const restaurantName = restaurantMatch[1];
            console.log('PopupRouter: Found restaurant popup URL, restaurantName:', restaurantName);
            this.showRestaurantPopup(restaurantName);
            return;
        }

        console.log('PopupRouter: No popup URL found, staying on main page');
    }

    handlePopState(event) {
        // If there's no state or we're going back to the main page
        if (!event.state || event.state.popup === null) {
            this.closeCurrentPopup();
            return;
        }

        // Handle different popup types
        if (event.state.popup === 'chef') {
            this.showChefPopupByName(event.state.name);
        } else if (event.state.popup === 'restaurant') {
            this.showRestaurantPopup(event.state.name);
        }
    }

    showChefPopup(chefId) {
        console.log('PopupRouter: Showing chef popup for:', chefId);
        this.currentPopup = 'chef';
        this.currentId = chefId;

        // Find chef by ID to get the name
        const chef = restaurants.find(r => r.id === chefId);
        if (!chef) {
            console.error('PopupRouter: Chef not found for ID:', chefId);
            return;
        }

        // Convert chef name to URL-friendly format
        const chefName = chef.chef.toLowerCase().replace(/^chef\s+/i, '').replace(/\s+/g, '-');

        // Update URL without triggering navigation
        const newUrl = `/chef/${chefName}`;
        history.pushState({ popup: 'chef', name: chefName, id: chefId }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

        // Show the popup
        if (window.chefPopup && typeof window.chefPopup.showPopup === 'function') {
            window.chefPopup.showPopup(chefId);
        } else {
            console.warn('PopupRouter: ChefPopup not available');
        }
    }

    showChefPopupByName(chefName) {
        console.log('PopupRouter: Showing chef popup for name:', chefName);
        this.currentPopup = 'chef';
        this.currentId = chefName;

        // Find chef by name (convert URL format back to chef name)
        const chef = restaurants.find(r => {
            const urlFriendlyName = r.chef.toLowerCase().replace(/^chef\s+/i, '').replace(/\s+/g, '-');
            return urlFriendlyName === chefName;
        });

        if (!chef) {
            console.error('PopupRouter: Chef not found for name:', chefName);
            console.log('PopupRouter: Available chefs:', restaurants.map(r => ({
                id: r.id,
                chef: r.chef,
                urlFriendlyName: r.chef.toLowerCase().replace(/^chef\s+/i, '').replace(/\s+/g, '-')
            })));
            return;
        }

        console.log('PopupRouter: Found chef:', chef.chef, 'with ID:', chef.id);

        // Update URL without triggering navigation
        const newUrl = `/chef/${chefName}`;
        history.pushState({ popup: 'chef', name: chefName, id: chef.id }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

        // Show the popup
        if (window.chefPopup && typeof window.chefPopup.showPopup === 'function') {
            console.log('PopupRouter: Calling chefPopup.showPopup with ID:', chef.id);
            window.chefPopup.showPopup(chef.id);
        } else {
            console.warn('PopupRouter: ChefPopup not available');
        }
    }

    showRestaurantPopup(restaurantName) {
        console.log('PopupRouter: Showing restaurant popup for:', restaurantName);
        this.currentPopup = 'restaurant';
        this.currentId = restaurantName;

        // Find restaurant by name to get the ID
        const restaurant = restaurants.find(r => r.name.toLowerCase().replace(/\s+/g, '-') === restaurantName.toLowerCase());
        if (!restaurant) {
            console.error('PopupRouter: Restaurant not found for name:', restaurantName);
            console.log('PopupRouter: Available restaurants:', restaurants.map(r => ({
                id: r.id,
                name: r.name,
                urlFriendlyName: r.name.toLowerCase().replace(/\s+/g, '-')
            })));
            return;
        }

        console.log('PopupRouter: Found restaurant:', restaurant.name, 'with ID:', restaurant.id);

        // Update URL without triggering navigation
        const newUrl = `/restaurant/${restaurantName}`;
        history.pushState({ popup: 'restaurant', name: restaurantName, id: restaurant.id }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

        // Show the popup
        if (window.dishPopup && typeof window.dishPopup.showPopup === 'function') {
            console.log('PopupRouter: Calling dishPopup.showPopup with ID:', restaurant.id);
            window.dishPopup.showPopup(restaurant.id);
        } else {
            console.warn('PopupRouter: DishPopup not available');
        }
    }

    closeCurrentPopup() {
        this.currentPopup = null;
        this.currentId = null;

        // Update URL to main page
        history.pushState({ popup: null }, '', '/');

        // Close any open popups
        if (window.chefPopup && typeof window.chefPopup.hidePopup === 'function') {
            window.chefPopup.hidePopup();
        }
        if (window.dishPopup && typeof window.dishPopup.hidePopup === 'function') {
            window.dishPopup.hidePopup();
        }
    }

    getCurrentPopup() {
        return {
            type: this.currentPopup,
            id: this.currentId
        };
    }
}

// Chef Popup System
class ChefPopup {
    constructor() {
        this.popup = document.getElementById('chef-popup');
        this.closeBtn = document.getElementById('chef-popup-close-container');
        this.overlay = document.querySelector('.chef-popup-overlay');
        this.currentChef = null;
        this.swiper = null;

        this.init();
    }

    init() {
        // Add click event listeners to chef elements
        const chefElements = document.querySelectorAll('[data-chef]');

        chefElements.forEach((chefElement, index) => {

            // Find the chef image container and name container within this chef element
            const chefImageContainer = chefElement.querySelector('.chef-image-container');
            const chefNameContainer = chefElement.querySelector('.chef-name-container');

            // Add click event to chef image container
            if (chefImageContainer) {
                chefImageContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefImageContainer.getAttribute('data-chef');
                    this.showPopupWithURL(chefId);
                });
            }

            // Add click event to chef name container
            if (chefNameContainer) {
                chefNameContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefNameContainer.getAttribute('data-chef');
                    this.showPopupWithURL(chefId);
                });
            }
        });

        // Close popup events (only if elements exist)
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hidePopupWithURL());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.hidePopupWithURL();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopupWithURL();
                }
            }
        });
    }

    showPopupWithURL(chefId) {
        // Use the router to show popup with URL
        if (window.popupRouter && typeof window.popupRouter.showChefPopup === 'function') {
            window.popupRouter.showChefPopup(chefId);
        } else {
            // Fallback to direct popup if router not available
            this.showPopup(chefId);
        }
    }

    hidePopupWithURL() {
        // Use the router to hide popup with URL
        if (window.popupRouter && typeof window.popupRouter.closeCurrentPopup === 'function') {
            window.popupRouter.closeCurrentPopup();
        } else {
            // Fallback to direct popup if router not available
            this.hidePopup();
        }
    }

    async showPopup(chefId) {
        try {

            // Reset slider container state first
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'block';
            }

            // Find chef data from restaurants
            const chefData = restaurants.find(restaurant => restaurant.id === chefId);
            if (!chefData) {
                console.error('Chef not found:', chefId);
                return;
            }


            this.currentChef = chefData;
            await this.populatePopup(chefData);

            // Set initial animation states BEFORE showing popup
            this.setInitialAnimationStates();

            // Show popup in HTML and freeze scroll
            this.popup.classList.remove('hidden');
            freezeBodyScroll();

            // Start animation immediately
            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing chef popup:', error);
        }
    }

    async populatePopup(chefData) {
        // Update chef image
        const chefImage = document.getElementById('chef-popup-image');
        if (chefImage && chefData.images && chefData.images['chef-popup-header']) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${chefData.images['chef-popup-header']}` : `/images/${convertToWebP(chefData.images['chef-popup-header'])}`;
            chefImage.src = imagePath;
            chefImage.alt = chefData.chef;
        }

        // Apply custom header styling if available
        const header = this.popup.querySelector('.chef-popup-header');
        if (header && chefData.popup && chefData.popup.headerStyle) {
            const headerStyle = chefData.popup.headerStyle;
            if (headerStyle.background) {
                header.style.background = headerStyle.background;
            }
            if (headerStyle.height) {
                header.style.height = headerStyle.height;
            }
        }

        // Update chef name and restaurant with custom colors
        const chefNameElement = document.getElementById('chef-popup-name');
        const restaurantNameElement = document.getElementById('chef-popup-restaurant');

        if (chefNameElement) {
            chefNameElement.textContent = chefData.chef;
        }
        if (restaurantNameElement) {
            restaurantNameElement.textContent = chefData.name;
        }

        // Apply custom colors from popup object
        if (chefData.popup) {
            // Apply chef title color to chef name element
            if (chefData.popup.chefTitleColor) {
                chefNameElement.style.color = chefData.popup.chefTitleColor;
            }

            // Apply restaurant name color
            if (chefData.popup.restaurantTitleColor) {
                restaurantNameElement.style.color = chefData.popup.restaurantTitleColor;
            }
        }

        // Update chef story (use chefBio from popup object)
        const storyElement = document.getElementById('chef-popup-story');
        if (storyElement) {
            const rawStoryContent = chefData.popup && chefData.popup.chefBio ? chefData.popup.chefBio : 'No biography available.';
            const formattedStoryContent = formatChefStory(rawStoryContent);
            storyElement.innerHTML = formattedStoryContent;
        } else {
            console.error('Story element not found');
        }

        // Initialize or update the carousel
        await this.initializeCarousel(chefData);
    }


    async initializeCarousel(chefData) {
        const swiperWrapper = document.querySelector('.chef-popup-swiper .swiper-wrapper');

        if (!swiperWrapper) {
            console.error('Swiper wrapper not found');
            return;
        }

        // Clear existing slides
        swiperWrapper.innerHTML = '';

        // Check if chef has slider images
        if (chefData.images && chefData.images.slides && chefData.images.slides.length > 0) {
            try {
                // Load Swiper dynamically
                const { Swiper: SwiperClass, Navigation, EffectCards } = await loadSwiper();

                // Create slides for each image
                chefData.images.slides.forEach((imagePath, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    const isDev = import.meta.env.DEV;
                    const fullImagePath = isDev ? `/images/${imagePath}` : `/images/${convertToWebP(imagePath)}`;
                    slide.innerHTML = `
                        <img
                            src="${fullImagePath}"
                            alt="${chefData.chef} - Image ${index + 1}"
                            loading="lazy" fetchpriority="low" decoding="async"
                            class="object-cover rounded-full border-4 border-irw-amber"
                        >
                    `;
                    swiperWrapper.appendChild(slide);
                });

                // Initialize or reinitialize Swiper
                if (this.swiper) {
                    this.swiper.destroy(true, true);
                }

                this.swiper = new SwiperClass('.chef-popup-swiper', {
                    modules: [Navigation, EffectCards],
                    effect: 'cards',
                    grabCursor: true,
                    cardsEffect: {
                        perSlideOffset: 8,
                        perSlideRotate: 2,
                        rotate: true,
                        slideShadows: true,
                    },
                    navigation: {
                        nextEl: '.chef-popup-swiper-button-next',
                        prevEl: '.chef-popup-swiper-button-prev',
                    },
                    breakpoints: {
                        320: {
                            effect: 'cards',
                            slidesPerView: 'auto',
                        },
                        768: {
                            effect: 'cards',
                            slidesPerView: 'auto',
                        },
                        1024: {
                            effect: 'cards',
                            slidesPerView: 'auto',
                        },
                    }
                });
            } catch (error) {
                console.error('Failed to load Swiper:', error);
                // Show fallback content
                swiperWrapper.innerHTML = `
                    <div class="text-center text-gray-600 p-4">
                        <p>Image carousel unavailable</p>
                    </div>
                `;
            }
        } else {
            // Hide the carousel if no images
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'none';
            }
        }
    }

    hidePopup() {
        // Check if popup is already hidden
        if (this.popup.classList.contains('hidden')) {
            return;
        }

        // Animate popup hide with GSAP
        this.animatePopupHide(() => {
            // Hide the popup after animation completes
            this.popup.classList.add('hidden');
            unfreezeBodyScroll();

            // Reset any GSAP transforms that might interfere
            const popupContainer = this.popup.querySelector('.chef-popup-container');
            const overlay = this.popup.querySelector('.chef-popup-overlay');
            if (popupContainer) {
                gsap.set(popupContainer, { clearProps: "all" });
            }
            if (overlay) {
                gsap.set(overlay, { clearProps: "all" });
            }

            // Then destroy Swiper instance after popup is hidden (prevents visual glitch)
            if (this.swiper) {
                this.swiper.destroy(true, true);
                this.swiper = null;
            }

            // Reset slider container visibility for next time
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'block';
            }
        });
    }

    setInitialAnimationStates() {
        const popupContainer = this.popup.querySelector('.chef-popup-container');
        const overlay = this.popup.querySelector('.chef-popup-overlay');
        const header = this.popup.querySelector('.chef-popup-header');
        const headerImage = this.popup.querySelector('#chef-popup-image');
        const content = this.popup.querySelector('.chef-popup-content');
        const story = this.popup.querySelector('#chef-popup-story');
        const slider = this.popup.querySelector('#chef-popup-slider');
        const closeBtn = this.popup.querySelector('#chef-popup-close-conainer');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // For reduced motion, set final states immediately
            gsap.set([overlay, popupContainer], {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationX: 0,
                borderRadius: '0%'
            });
            if (header) gsap.set(header, { height: 'auto' });
            if (headerImage) gsap.set(headerImage, { opacity: 1, scale: 1.01 });
            if (content) gsap.set(content, { height: 'auto' });
            if (story) {

                // Also set paragraphs to visible for reduced motion
                const storyParagraphs = story.querySelectorAll('p');
                if (storyParagraphs.length > 0) {
                    gsap.set(storyParagraphs, { opacity: 1, y: 0 });
                }
            }
            if (slider) gsap.set(slider, { opacity: 1, y: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 1, y: 0 });
            return;
        }

        // Set initial states for animation
        if (popupContainer) {
            gsap.set(popupContainer, {
                opacity: 0,
                scale: 0,
                rotationX: -15,
                borderRadius: '50%'
            });
        }

        if (overlay) {
            gsap.set(overlay, {
                opacity: 0
            });
        }

        if (header) {
            gsap.set(header, { height: 0 });
        }

        if (headerImage) {
            gsap.set(headerImage, {
                opacity: 0,
                scale: 1.1,
                y: -30
            });
        }

        if (content) {
            gsap.set(content, { height: 0 });
        }

        // Set initial states for content elements
        const contentElements = [slider, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) {
            gsap.set(contentElements, {
                opacity: 0,
                y: 20
            });
        }

        // Set initial states for story paragraphs
        if (story) {
            const storyParagraphs = story.querySelectorAll('p');
            if (storyParagraphs.length > 0) {
                gsap.set(storyParagraphs, {
                    opacity: 0,
                    y: -10
                });
            }
        }
    }

    animatePopupShow() {
        const popupContainer = this.popup.querySelector('.chef-popup-container');
        const overlay = this.popup.querySelector('.chef-popup-overlay');
        const header = this.popup.querySelector('.chef-popup-header');
        const headerImage = this.popup.querySelector('#chef-popup-image');
        const content = this.popup.querySelector('.chef-popup-content');
        const story = this.popup.querySelector('#chef-popup-story');
        const slider = this.popup.querySelector('#chef-popup-slider');
        const closeBtn = this.popup.querySelector('#chef-popup-close-container');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Already set in setInitialAnimationStates, just return empty timeline
            return gsap.timeline();
        }

        // Create timeline for smooth orchestrated animation
        const tl = gsap.timeline({
            ease: "power2.out"
        });

        // Animate overlay first with smoother transition
        tl.to(overlay, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        // Animate popup container with more dramatic entrance
        .to(popupContainer, {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            borderRadius: '0%',
            duration: 0.6,
            ease: "power2.out"
        }, "<50%")
        .to(header, {
            height: 'auto',
            duration: 0.5,
            ease: "power2.out"
        }, "<20%")
        .to(headerImage, {
            opacity: 1,
            scale: 1.01,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "<20%")
        // Stagger animate content elements
        .to(content, {
            height: 'auto',
            duration: 0.6,
            ease: "power2.out"
        }, "<20%")
        // Animate story paragraphs with stagger effect
        // Add stagger animation for individual paragraphs
        .to(story.querySelectorAll('p'), {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.08
        }, "<40%")
        // Animate slider and close button
        .to([slider, closeBtn], {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.2");

        return tl;
    }

    animatePopupHide(callback) {
        const popupContainer = this.popup.querySelector('.chef-popup-container');
        const overlay = this.popup.querySelector('.chef-popup-overlay');
        const header = this.popup.querySelector('.chef-popup-header');
        const headerImage = this.popup.querySelector('#chef-popup-image');
        const content = this.popup.querySelector('.chef-popup-content');
        const story = this.popup.querySelector('#chef-popup-story');
        const slider = this.popup.querySelector('#chef-popup-slider');
        const closeBtn = this.popup.querySelector('#chef-popup-close-container');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simple fade-out for reduced motion
            gsap.set([popupContainer, overlay, header, headerImage, content, story, slider, closeBtn], {
                opacity: 0
            });
            callback();
            return gsap.timeline();
        }

        // Create timeline for smooth exit animation
        const tl = gsap.timeline({
            ease: "power2.in",
            onComplete: callback
        });

        // Animate content elements out first
        tl.to([slider, closeBtn], {
            opacity: 0,
            y: -10,
            duration: 0.2,
            stagger: 0.03,
            ease: "power2.in"
        })
        .to(content, {
            height: 0,
            duration: 0.4,
            ease: "power2.out"
        },"<30%")
        .to(header, {
            height: 0,
            duration: 0.4,
            ease: "power2.out"
        },"<50%")
        // Animate popup container
        .to(popupContainer, {
            opacity: 0,
            scale: 0.9,
            rotationX: 10,
            duration: 0.3,
            ease: "power2.out"
        }, "<10%")
        // Animate overlay out
        .to(overlay, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "<50%");

        return tl;
    }

}

// Helper function to convert image extensions to WebP for production
function convertToWebP(filename) {
    if (!filename) return filename;

    // Get the file extension
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;

    const nameWithoutExt = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex + 1).toLowerCase();

    // Convert common image formats to WebP, keep SVG as-is
    if (extension === 'svg') {
        return filename; // Keep SVG files unchanged
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        return `${nameWithoutExt}.webp`;
    }

    return filename; // Return original if not a recognized format
}

// Helper function to format chef story content by wrapping each sentence in paragraphs
function formatChefStory(content) {
    if (!content) return 'No biography available.';

    // If content already contains HTML tags, preserve them completely
    if (content.includes('<')) {
        return content; // Return as-is if HTML is already present
    } else {
        // For plain text content, split into sentences and wrap each in a paragraph
        const sentences = content
            .split(/(?<=[.!?])\s+/)
            .filter(sentence => sentence.trim().length > 0)
            .map(sentence => sentence.trim());

        if (sentences.length === 0) return 'No biography available.';

        // Wrap each sentence in its own paragraph
        return sentences.map(sentence => `<p>${sentence}</p>`).join('');
    }
}

// Function to populate chefs list dynamically
function populateChefsList() {
    const chefsList = document.getElementById('chefs-list');
    if (!chefsList) {
        // Silently return - element doesn't exist on this page
        return;
    }

    // Clear existing content
    chefsList.innerHTML = '';

    // Create chef elements for each restaurant
    restaurants.forEach((restaurant, index) => {
        // Check if chef image data exists
        if (!restaurant.images || !restaurant.images.profile || !restaurant.images['profile-background']) {
            console.warn(`Missing image data for chef: ${restaurant.chef}`);
            return;
        }

        const chefElement = document.createElement('div');
        // Add alignment class based on index (0-based: odd = right, even = left)
        const alignmentClass = index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row';
        const textAlignmentClass = index % 2 === 0 ? 'md:text-right' : 'md:text-left';
        chefElement.className = `chef relative flex flex-col items-center md:flex-row ${alignmentClass}`;
        chefElement.setAttribute('data-chef', restaurant.id);

        // Create different layouts for left vs right alignment
        const imageBasePath = '/images';
        const isDev = import.meta.env.DEV;

        // Use WebP in production, original format in development
        const chefImagePath = isDev ? restaurant.images.profile : convertToWebP(restaurant.images.profile);
        const chefBgImagePath = isDev ? restaurant.images['profile-background'] : convertToWebP(restaurant.images['profile-background']);

        chefElement.innerHTML = `
                <div class="relative flex-none">
                    <div class="chef-image-container m-auto relative z-0 cursor-pointer" data-chef="${restaurant.id}">
                        <div class="chef-bg-circle rounded-full relative">
                            <img src="${imageBasePath}/${chefImagePath}" alt="${restaurant.chef}" class="chef-image absolute z-10 bottom-0 inset-x-0 m-auto" loading="lazy" fetchpriority="low" decoding="async">
                            <img src="${imageBasePath}/${chefBgImagePath}" alt="${restaurant.chef} Background" class="chef-image-bg object-cover rounded-full w-full h-full relative z-0" loading="lazy" fetchpriority="low" decoding="async">
                        </div>
                    </div>
                    <div class="chef-name-container relative grid place-items-center -mt-10 z-10 cursor-pointer" data-chef="${restaurant.id}">
                        <span class="chef-name absolute font-bold text-white text-lg lg:text-xl">${restaurant.chef}</span>
                        <img src="${imageBasePath}/ui/chefNameShape.svg" alt="Chef Name Decoration" class="chef-name-shape" loading="lazy" fetchpriority="low" decoding="async" width="322" height="73">
                    </div>
                </div>
                <div class="@container w-full hef-excerpt-container mt-2 md:mt-0 px-4 text-center ${textAlignmentClass} flex-1">
                    <h3 class="chef-excerpt-title text-balance font-semibold text-lg sm:text-xl lg:text-2xl xl:text-[28px]">${restaurant.name} — ${restaurant.chef}</h3>
                    <p class="chef-excerpt text-pretty text-lg sm:text-xl lg:text-2xl xl:text-[28px]">${restaurant.excerpt}</p>
                </div>
            `;


        chefsList.appendChild(chefElement);
    });


    // Set up GSAP animations for chefs after they are populated
    setupChefsAnimations();

    // Set up scroll animations for candles and courses images
    setupImageScrollAnimations();


}

// Restaurant Carousel System
class RestaurantCarousel {
    constructor() {
        this.restaurants = [];
        this.currentIndex = 0;
        this.rotationInterval = null;
        this.rotationSpeed = 5000; // 5 seconds
        this.carouselContainer = null;
        this.logoSprite = null;
        this.centralLogo = null;
        this.restaurantItems = [];
        this.totalRotation = 0; // Track total rotation for continuous loop

        this.init();
    }

    async init() {
        // Wait for restaurants data to be loaded
        await this.waitForRestaurantsData();

        if (this.restaurants.length > 0) {
            this.createCarousel();
            this.addEventListeners();
        }
    }

    async waitForRestaurantsData() {
        return new Promise((resolve) => {
            const checkData = () => {
                if (typeof restaurants !== 'undefined' && restaurants.length > 0) {
                    this.restaurants = restaurants;
                    resolve();
                } else {
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
    }

    createCarousel() {
        this.carouselContainer = document.getElementById('carousel-container');
        this.logoDisplay = document.getElementById('logo-display');
        this.centralLogo = document.getElementById('central-logo');

        if (!this.carouselContainer || !this.logoDisplay) {
            console.error('Carousel elements not found');
            return;
        }

        // Add click event listener to central logo
        this.logoDisplay.addEventListener('click', () => {
            if (this.restaurants && this.restaurants[this.currentIndex]) {
                const currentRestaurant = this.restaurants[this.currentIndex];
                if (window.dishPopup && typeof window.dishPopup.showPopupWithURL === 'function') {
                    window.dishPopup.showPopupWithURL(currentRestaurant.id);
                } else {
                    console.error('DishPopup not available or showPopupWithURL method not found');
                }
            }
        });

        // Clear existing content
        this.carouselContainer.innerHTML = '';

        // Create restaurant items in circular positions
        this.restaurants.forEach((restaurant, index) => {
            const item = this.createRestaurantItem(restaurant, index);
            this.carouselContainer.appendChild(item);
            this.restaurantItems.push(item);
        });

        // Preload all logos for optimized transitions
        this.preloadLogos();

        // Set initial active state and position
        this.rotateToRestaurant(0);

        // Start rotation immediately
        this.startRotation();
    }

    createRestaurantItem(restaurant, index) {
        const item = document.createElement('div');
        item.className = 'restaurant-item absolute rounded-full cursor-pointer transition-all duration-1000 ease-smooth';
        item.setAttribute('data-restaurant-id', restaurant.id);
        item.setAttribute('data-index', index);

        // Calculate circular position with responsive radius
        const angle = (index * 60) - 90; // Start from top (12 o'clock position)
        const radius = this.getCarouselRadius(); // Get radius from CSS variable
        const finalX = Math.cos(angle * Math.PI / 180) * radius;
        const finalY = Math.sin(angle * Math.PI / 180) * radius;

        // Position items directly in their final positions
        item.style.left = `calc(50% + ${finalX}px)`;
        item.style.top = `calc(50% + ${finalY}px)`;
        item.style.transform = 'translate(-50%, -50%)';


        // Add restaurant dish image with responsive sizing
        const img = document.createElement('img');
        const chefFolder = this.getChefFolder(restaurant.id);
        const isDev = import.meta.env.DEV;

        // Create srcset with responsive sizes and high-DPI support
        const imageBasePath = '/images';
        const srcset = [
            `${imageBasePath}/chefs/${chefFolder}/dish-105w.webp 105w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-140w.webp 140w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-160w.webp 160w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-180w.webp 180w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-220w.webp 220w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-280w.webp 280w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-350w.webp 350w`,
            `${imageBasePath}/chefs/${chefFolder}/dish-440w.webp 440w`
        ].join(', ');

        img.srcset = srcset;
        img.src = `${imageBasePath}/chefs/${chefFolder}/dish-280w.webp`; // Fallback for 2x displays
        img.alt = restaurant.name;
        img.loading = 'eager';
        img.width = 220; // Intrinsic width for layout calculation
        img.height = 220; // Intrinsic height for layout calculation
        img.sizes = '(max-width: 420px) 105px, (max-width: 580px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 220px'; // Responsive sizes matching carousel breakpoints
        img.className = 'w-full h-full object-contain transition-all duration-[1800ms] ease-smooth';

        // Add error handling for images
        img.onerror = () => {
            console.warn(`Failed to load image for ${restaurant.name}: ${img.src}`);
            // Could set a fallback image here
        };

        item.appendChild(img);

        // Add click event
        item.addEventListener('click', () => {
            this.rotateToRestaurant(index);
            this.resetRotation();

            // Show dish popup
            if (window.dishPopup && typeof window.dishPopup.showPopupWithURL === 'function') {
                window.dishPopup.showPopupWithURL(restaurant.id);
            } else {
                console.error('DishPopup not available or showPopupWithURL method not found');
            }
        });

        return item;
    }


    setActiveRestaurant(index) {
        // Remove active class from all items
        this.restaurantItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });

        // Update central logo
        this.updateCentralLogo(this.restaurants[index]);

        // Console log notification
        const restaurant = this.restaurants[index];

        this.currentIndex = index;
    }

    preloadLogos() {
        // Logo elements are pre-rendered in index.astro with responsive srcset
        // Just query the existing elements
        this.logoElements = Array.from(this.logoDisplay.querySelectorAll('.logo-element'));

        // First logo is already visible (set in HTML), ensure state is correct
        if (this.logoElements.length > 0) {
            this.logoElements[0].style.opacity = '1';
            this.logoElements[0].style.zIndex = '2';
        }
    }

    updateCentralLogo(restaurant) {
        if (!this.logoDisplay || !this.logoElements) return;

        // Find the restaurant index
        const restaurantIndex = this.restaurants.findIndex(r => r.id === restaurant.id);
        if (restaurantIndex === -1) return;

        // Get current and next logo elements
        const currentLogo = this.logoElements.find(el => el.style.opacity === '1' || el.style.opacity === '');
        const nextLogo = this.logoElements[restaurantIndex];

        if (!currentLogo || !nextLogo || currentLogo === nextLogo) return;

        // Set up the next logo for animation
        nextLogo.style.filter = 'blur(10px)';
        nextLogo.style.transform = 'scale(1.1)';
        nextLogo.style.zIndex = '2';

        // Create smooth crossfade animation
        const tl = gsap.timeline({
            onComplete: () => {
                // Reset z-index after animation
                currentLogo.style.zIndex = '1';
                nextLogo.style.zIndex = '1';
            }
        });

        // Fade out current logo and fade in next logo simultaneously
        tl.to(currentLogo, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.inOut"
        })
        .to(nextLogo, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: "power2.inOut"
        }, 0); // Start at the same time as the fade out
    }

    getChefFolder(restaurantId) {
        // Map restaurant IDs to chef folder names
        const chefFolderMap = {
            'ashish_rooh': 'ashish-tiwari',
            'pujan_tiya': 'pujan-sarkar',
            'thomas_bombay_brasserie': 'thomas-george',
            'shibiraj_amber_india': 'shibiraj-saha',
            'ranjan_new_delhi': 'ranjan-dey',
            'srijith_copra': 'srijith-gopinathan'
        };

        return chefFolderMap[restaurantId] || 'ashish-tiwari';
    }

    getDishImagePath(restaurantId) {
        const chefFolder = this.getChefFolder(restaurantId);
        const isDev = import.meta.env.DEV;
        return isDev ? `/images/chefs/${chefFolder}/dish.png` : `/images/chefs/${chefFolder}/dish.webp`;
    }

    startRotation() {
        // Clear any existing interval first
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }

        // Start new rotation interval
        this.rotationInterval = setInterval(() => {
            this.nextRestaurant();
        }, this.rotationSpeed);

    }

    nextRestaurant() {
        // Increment total rotation by 60 degrees for continuous loop
        this.totalRotation -= 60; // Negative for counter-clockwise rotation

        // Update current index for active restaurant tracking
        this.currentIndex = (this.currentIndex + 1) % this.restaurants.length;

        // Apply smooth rotation with GSAP easing
        gsap.to(this.carouselContainer, {
            rotation: this.totalRotation,
            duration: 1,
            ease: "power2.inOut",
            onUpdate: () => {
                // Update counter-rotation for all items to keep images upright during animation
                this.updateCounterRotation();
            },
            onComplete: () => {
                // Update the active restaurant and logo after animation completes
                this.setActiveRestaurant(this.currentIndex);
            }
        });
    }

    rotateToRestaurant(index) {
        // Calculate the rotation angle to bring the selected restaurant to the top
        const rotationAngle = -index * 60; // Negative for counter-clockwise rotation

        // Update total rotation to maintain continuous loop
        this.totalRotation = rotationAngle;

        // Apply smooth rotation with GSAP easing
        gsap.to(this.carouselContainer, {
            rotation: this.totalRotation,
            duration: 0.8,
            ease: "power2.inOut",
            onUpdate: () => {
                // Update counter-rotation for all items to keep images upright during animation
                this.updateCounterRotation();
            },
            onComplete: () => {
                // Update the active restaurant and logo after animation completes
                this.setActiveRestaurant(index);
            }
        });
    }

    resetRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }

        // Start rotation after a small delay to prevent conflicts
        setTimeout(() => {
            this.startRotation();
        }, 100);
    }

    addEventListeners() {
        // Pause rotation on hover
        this.carouselContainer.addEventListener('mouseenter', () => {
            if (this.rotationInterval) {
                clearInterval(this.rotationInterval);
                this.rotationInterval = null;
            }
        });

        // Resume rotation on mouse leave
        this.carouselContainer.addEventListener('mouseleave', () => {
            this.startRotation();
        });

        // Pause rotation when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.rotationInterval) {
                    clearInterval(this.rotationInterval);
                }
            } else {
                this.startRotation();
            }
        });

        // Handle window resize for responsive positioning
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.repositionItems();
            }, 250);
        });

        // Watch for CSS variable changes
        this.observeCSSVariables();
    }

    updateCounterRotation() {
        // Get current rotation from GSAP or use totalRotation as fallback
        const currentRotation = gsap.getProperty(this.carouselContainer, "rotation") || this.totalRotation;

        // Update counter-rotation for all items to keep images upright
        this.restaurantItems.forEach((item, index) => {
            // Only apply counter-rotation if there's actual rotation
            if (currentRotation !== 0) {
                const counterRotation = -currentRotation;
                item.style.transform = `translate(-50%, -50%) rotate(${counterRotation}deg)`;
            } else {
                // No rotation, keep images in natural position
                item.style.transform = 'translate(-50%, -50%)';
            }
        });
    }

    getCarouselRadius() {
        // Get the radius value from CSS variable
        const carouselElement = document.getElementById('restaurant-carousel');
        if (carouselElement) {
            const radiusValue = getComputedStyle(carouselElement).getPropertyValue('--carousel-radius');
            // Convert from CSS value (e.g., "150px") to number
            return parseInt(radiusValue.replace('px', '')) || 150;
        }
        return 150; // Fallback value
    }

    observeCSSVariables() {
        // Create a MutationObserver to watch for CSS variable changes
        const carouselElement = document.getElementById('restaurant-carousel');
        if (!carouselElement) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    // CSS variables might have changed, reposition items
                    this.repositionItems();
                }
            });
        });

        observer.observe(carouselElement, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Also watch for changes in the document's style sheets
        const styleObserver = new MutationObserver(() => {
            this.repositionItems();
        });

        styleObserver.observe(document.head, {
            childList: true,
            subtree: true
        });
    }

    repositionItems() {
        // Get current rotation from GSAP or use totalRotation as fallback
        const currentRotation = gsap.getProperty(this.carouselContainer, "rotation") || this.totalRotation;

        // Reposition all items based on current window size
        this.restaurantItems.forEach((item, index) => {
            const angle = (index * 60) - 90; // Original positioning
            const radius = this.getCarouselRadius();
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            item.style.left = `calc(50% + ${x}px)`;
            item.style.top = `calc(50% + ${y}px)`;

            // Apply counter-rotation to keep images upright
            if (currentRotation !== 0) {
                const counterRotation = -currentRotation;
                item.style.transform = `translate(-50%, -50%) rotate(${counterRotation}deg)`;
            } else {
                item.style.transform = 'translate(-50%, -50%)';
            }
        });
    }

    pause() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        } else {
        }
    }

    resume() {
        if (!this.rotationInterval) {
            this.startRotation();
        } else {
        }
    }

    updateSize() {
        // Manually trigger repositioning (useful for testing)
        this.repositionItems();
    }

    destroy() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }

        // Clean up logo elements
        if (this.logoElements && this.logoDisplay) {
            this.logoElements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            this.logoElements = [];
        }
    }
}

// Dish Popup System
class DishPopup {
    constructor() {
        this.popup = document.getElementById('dish-popup');
        this.closeBtn = document.getElementById('dish-popup-close-container');
        this.overlay = document.querySelector('.dish-popup-overlay');
        this.currentRestaurant = null;

        // Check if required elements exist (silently return if not - element doesn't exist on this page)
        if (!this.popup || !this.closeBtn || !this.overlay) {
            return;
        }

        this.init();
    }

    init() {
        // Close popup events
        this.closeBtn.addEventListener('click', () => this.hidePopupWithURL());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePopupWithURL();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopupWithURL();
                }
            }
        });

        // Price toggler events
    }

    showPopupWithURL(restaurantId) {
        // Use the router to show popup with URL
        if (window.popupRouter && typeof window.popupRouter.showRestaurantPopup === 'function') {
            // Find restaurant by ID to get the name
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (restaurant) {
                const restaurantName = restaurant.name.toLowerCase().replace(/\s+/g, '-');
                window.popupRouter.showRestaurantPopup(restaurantName);
            } else {
                console.error('Restaurant not found for ID:', restaurantId);
                this.showPopup(restaurantId);
            }
        } else {
            // Fallback to direct popup if router not available
            this.showPopup(restaurantId);
        }
    }

    hidePopupWithURL() {
        // Use the router to hide popup with URL
        if (window.popupRouter && typeof window.popupRouter.closeCurrentPopup === 'function') {
            window.popupRouter.closeCurrentPopup();
        } else {
            // Fallback to direct popup if router not available
            this.hidePopup();
        }
    }

    async showPopup(restaurantId) {
        try {
            // Check if popup is already open
            if (!this.popup.classList.contains('hidden')) {
                console.log('Popup already open, closing first');
                this.hidePopup();
                // Wait a bit for the close animation to complete
                setTimeout(() => {
                    this.showPopup(restaurantId);
                }, 400);
                return;
            }

            // Find restaurant data
            const restaurantData = restaurants.find(restaurant => restaurant.id === restaurantId);
            if (!restaurantData) {
                console.error('Restaurant not found:', restaurantId);
                return;
            }

            this.currentRestaurant = restaurantData;
            this.populatePopup(restaurantData);

            // Set initial animation states BEFORE showing popup
            this.setInitialAnimationStates();

            // Show popup in HTML and freeze scroll
            this.popup.classList.remove('hidden');
            this.popup.classList.add('grid', 'place-items-center');
            freezeBodyScroll();

            // Start animation immediately
            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing dish popup:', error);
            // Ensure popup is hidden if there's an error
            this.popup.classList.add('hidden');
            unfreezeBodyScroll();
        }
    }

    populatePopup(restaurantData) {
        // Update restaurant logo with optimized WebP
        const logoElement = document.getElementById('dish-popup-logo');
        if (logoElement && restaurantData.images?.logo) {
            const logoBasePath = `/images/${restaurantData.images.logo.replace(/\/[^/]+$/, '')}`;
            logoElement.src = `${logoBasePath}/logo.webp`;
            logoElement.srcset = `${logoBasePath}/logo-176.webp 176w, ${logoBasePath}/logo.webp 256w`;
            logoElement.sizes = '(max-width: 768px) 64px, 96px';
            logoElement.alt = restaurantData.name;
        }

        // Update chef name and restaurant
        const chefNameElement = document.getElementById('dish-popup-chef');
        const restaurantNameElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        if (chefNameElement) {
            chefNameElement.textContent = restaurantData.chef;
        }
        if (restaurantNameElement) {
            restaurantNameElement.textContent = restaurantData.name;
        }
        if (locationElement) {
            // Use area name if available, otherwise extract from address
            locationElement.textContent = restaurantData.area || restaurantData.address.split(',')[restaurantData.address.split(',').length - 1].trim();
        }

        // Update special menu name (supports seasonal menus)
        const menuNameElement = document.getElementById('dish-popup-menu-name');
        const activeMenu = getActiveMenu(restaurantData);

        if (menuNameElement) {
            menuNameElement.textContent = activeMenu?.menuName || 'Special Menu';

            // Apply color from JSON
            if (activeMenu?.menuNameColor && activeMenu.menuNameColor.trim() !== '') {
                // Remove any existing color classes that might interfere
                menuNameElement.classList.remove('text-teal-800', 'text-gray-800', 'text-black');

                // Apply the color with !important
                menuNameElement.style.setProperty('color', activeMenu.menuNameColor);

            } else {
            }
        }

        // Update dish popup header image - use restaurant-popup-header if available
        const dishPopupHeaderImage = document.getElementById('dish-popup-header-image');
        const dishPopupHeader = document.getElementById('dish-popup-header');

        if (dishPopupHeaderImage && restaurantData.images && restaurantData.images['restaurant-popup-header']) {
            const restaurantHeader = restaurantData.images['restaurant-popup-header'];

            // Check if restaurant-popup-header is an object with headerStyle (like ROOH)
            if (typeof restaurantHeader === 'object' && restaurantHeader.headerStyle) {
                // Apply custom CSS styles from headerStyle to the header image container
                const headerStyle = restaurantHeader.headerStyle;
                if (headerStyle.background) {
                    dishPopupHeaderImage.style.background = headerStyle.background;
                }
                if (headerStyle.height) {
                    dishPopupHeaderImage.style.height = headerStyle.height;
                }
                // Hide the img element since we're using background styling
                const imgElement = dishPopupHeaderImage.querySelector('img');
                if (imgElement) {
                    imgElement.style.display = 'none';
                }
            } else if (typeof restaurantHeader === 'string') {
                // Load image for other restaurants
                const isDev = import.meta.env.DEV;
                const imagePath = isDev ? `/images/${restaurantHeader}` : `/images/${convertToWebP(restaurantHeader)}`;

                const imgElement = dishPopupHeaderImage.querySelector('img');
                if (imgElement) {
                    imgElement.src = imagePath;
                    imgElement.alt = `${restaurantData.name} - Restaurant Header`;
                    imgElement.style.display = 'block';
                }
                // Reset any background styling
                dishPopupHeaderImage.style.background = '';
                dishPopupHeaderImage.style.height = '';
            }
        }

        // Update menu image - use menu image from active menu (seasonal or default)
        const menuImageElement = document.getElementById('dish-popup-menu-image');
        if (menuImageElement && activeMenu?.menuImage) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${activeMenu.menuImage}` : `/images/${convertToWebP(activeMenu.menuImage)}`;
            menuImageElement.src = imagePath;
            menuImageElement.alt = `${restaurantData.name} - ${activeMenu.menuName || 'Special Menu'}`;
        } else if (menuImageElement && restaurantData.images && restaurantData.images.dish) {
            // Fallback to dish image if menu image not available
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${restaurantData.images.dish}` : `/images/${convertToWebP(restaurantData.images.dish)}`;
            menuImageElement.src = imagePath;
            menuImageElement.alt = `${restaurantData.name} - Special Menu`;
        }


        // Update menu content
        this.updateMenuContent(restaurantData);

        // Update reservation link
        const reservationBtn = document.getElementById('dish-popup-reservation');
        if (reservationBtn && restaurantData.reservation) {
            reservationBtn.href = restaurantData.reservation;
            reservationBtn.target = '_blank';
        } else if (reservationBtn && restaurantData.website) {
            // Fallback to website if no reservation link
            reservationBtn.href = restaurantData.website;
            reservationBtn.target = '_blank';
        }

        // Update Reserve Table shape color dynamically
        this.updateReserveTableShapeColor(restaurantData);

        // Update menu price and color dynamically
        this.updateMenuPriceAndColor(restaurantData);
    }


    updateMenuContent(restaurantData) {
        const menuContent = document.getElementById('dish-popup-menu-content');
        if (!menuContent) return;

        // Get active menu (seasonal or default)
        const activeMenu = getActiveMenu(restaurantData);

        // Use menu content from the active menu
        if (activeMenu?.content) {
            menuContent.innerHTML = activeMenu.content;
        } else {
            // Fallback content
            menuContent.innerHTML = `
                <div class="space-y-4">
                    <h4 class="font-bold text-lg text-teal-800">Special Menu</h4>
                    <p>Experience our carefully crafted menu featuring authentic flavors and premium ingredients.</p>
                    <p>Each dish is prepared with traditional techniques and the finest spices to bring you an unforgettable dining experience.</p>
                </div>
            `;
        }
    }

    updateReserveTableShapeColor(restaurantData) {
        // Find the Reserve Table shape SVG path element
        const reservationBtn = document.getElementById('dish-popup-reservation');
        if (!reservationBtn) return;

        // Get the dedicated colors from restaurant data, fallback to defaults
        const shapeColor = restaurantData.popup?.reserveTableShapeColor || '#1E2A78';
        const hoverColor = restaurantData.popup?.reservationLinkFillHover || '#4A5BC7';

        // Update the CSS custom properties for both fill and hover colors
        reservationBtn.style.setProperty('--reservation-link-fill', shapeColor);
        reservationBtn.style.setProperty('--reservation-link-fill-hover', hoverColor);

    }

    updateMenuPriceAndColor(restaurantData) {
        // Find the menu price container and elements
        const menuPriceContainer = document.getElementById('menu-price-container');
        if (!menuPriceContainer) return;

        const menuPriceElement = document.getElementById('menu-price');
        const menuPriceShape = menuPriceContainer.querySelector('svg path');

        if (!menuPriceElement || !menuPriceShape) return;

        // Get the price from active menu (seasonal or default) or popup level
        const menuPrice = getActiveMenuPrice(restaurantData);
        const menuPriceColor = restaurantData.popup?.menuPriceColor || '#1E2A78';

        // Format the price with dynamic $ signs
        const formattedPrice = this.formatPriceWithDollarSigns(menuPrice);

        // Update the price text with HTML formatting
        menuPriceElement.innerHTML = formattedPrice;

        // Update the fill color of the price shape
        menuPriceShape.setAttribute('fill', menuPriceColor);

    }

    formatPriceWithDollarSigns(priceString) {
        // Handle different price formats
        if (!priceString || priceString === 'Price') {
            return 'Price';
        }

        // Check if it contains "&" for multiple prices
        if (priceString.includes('&')) {
            // Split by "&" and format each price
            const prices = priceString.split('&').map(price => price.trim());
            return prices.map(price => `<span class="price-currency md:text-3xl text-2xl">$</span><span class="price-value md:text-4xl text-3xl -top-1 relative">${price}</span>`).join(' & ');
        } else {
            // Single price - add dollar sign
            return `<span class="price-currency md:text-3xl text-2xl">$</span><span class="price-value md:text-4xl text-3xl -top-1 relative">${priceString}</span>`;
        }
    }

    hidePopup() {
        // Check if popup is already hidden
        if (this.popup.classList.contains('hidden')) {
            return;
        }

        // Animate popup hide with GSAP
        this.animatePopupHide(() => {
            // Hide the popup after animation completes
            this.popup.classList.add('hidden');
            this.popup.classList.remove('grid', 'place-items-center');
            unfreezeBodyScroll();

            // Reset any GSAP transforms that might interfere
            const popupContainer = this.popup.querySelector('.dish-popup-container');
            const overlay = this.popup.querySelector('.dish-popup-overlay');
            if (popupContainer) {
                gsap.set(popupContainer, { clearProps: "all" });
            }
            if (overlay) {
                gsap.set(overlay, { clearProps: "all" });
            }
        });
    }

    setInitialAnimationStates() {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        // Get the specific popup elements for animation
        const logoElement = document.getElementById('dish-popup-logo');
        const chefElement = document.getElementById('dish-popup-chef');
        const restaurantElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // For reduced motion, set final states immediately
            gsap.set([overlay, popupContainer], {
                opacity: 1,
                scale: 1,
                y: 0
            });
            if (header) gsap.set(header, { opacity: 1, y: 0 });
            if (content) gsap.set(content, { opacity: 1, y: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 1, y: 0 });

            // Set final states for specific popup elements
            const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
            if (popupElements.length > 0) {
                gsap.set(popupElements, { opacity: 1, y: 0, scale: 1 });
            }
            return;
        }

        // Set initial states for animation
        if (popupContainer) {
            gsap.set(popupContainer, {
                opacity: 0,
                scale: 0.8,
                y: -50
            });
        }

        if (overlay) {
            gsap.set(overlay, {
                opacity: 0
            });
        }

        // Set initial states for content elements
        const contentElements = [header, content, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) {
            gsap.set(contentElements, {
                opacity: 0,
                y: 20
            });
        }

        // Set initial states for specific popup elements
        const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
        if (popupElements.length > 0) {
            gsap.set(popupElements, {
                opacity: 0,
                y: 10,
                scale: 0.9
            });
        }
    }

    animatePopupShow() {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        // Get the specific popup elements for animation
        const logoElement = document.getElementById('dish-popup-logo');
        const chefElement = document.getElementById('dish-popup-chef');
        const restaurantElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        // Debug: Check if elements exist
        if (!popupContainer || !overlay) {
            console.error('DishPopup: Required animation elements not found');
            return gsap.timeline();
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Already set in setInitialAnimationStates, just return empty timeline
            return gsap.timeline();
        }

        // Create timeline for smooth orchestrated animation
        const tl = gsap.timeline({
            ease: "power2.out"
        });

        // Animate overlay first with smoother transition
        tl.to(overlay, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut"
        })
        // Animate popup container with more dramatic entrance
        .to(popupContainer, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        }, "<70%");

        // Animate content elements if they exist
        const contentElements = [header, content, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) {
            tl.to(contentElements, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out"
            }, "<10%");
        }

        // Animate specific popup elements with staggered timing
        const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
        if (popupElements.length > 0) {
            tl.to(popupElements, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            }, "<20%");
        }

        return tl;
    }

    animatePopupHide(callback) {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        // Debug: Check if elements exist
        if (!popupContainer || !overlay) {
            console.error('DishPopup: Required animation elements not found for hide');
            if (callback) callback();
            return gsap.timeline();
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simple fade-out for reduced motion
            gsap.set([popupContainer, overlay], { opacity: 0 });
            if (header) gsap.set(header, { opacity: 0 });
            if (content) gsap.set(content, { opacity: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 0 });
            if (callback) callback();
            return gsap.timeline();
        }

        // Create timeline for smooth exit animation
        const tl = gsap.timeline({
            ease: "power2.out",
            onComplete: callback
        });

        // Only animate elements that exist
        const contentElements = [header, content, closeBtn].filter(el => el !== null);

        // Animate content elements out first
        if (contentElements.length > 0) {
            tl.to(contentElements, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                stagger: 0.05,
                ease: "power1.inOut"
            });
        }

        // Animate popup container
        tl.to(popupContainer, {
            opacity: 0,
            scale: 0.9,
            y: 30,
            duration: 0.4,
            ease: "power1.inOut"
        }, "-=0.1")
        // Animate overlay out
        .to(overlay, {
            opacity: 0,
            duration: 0.3,
            ease: "power1.inOut"
        }, "-=0.2");

        return tl;
    }
}

// Restaurant Dropdown System
class RestaurantDropdown {
    constructor() {
        this.restaurants = [];
        this.desktopDropdown = document.getElementById('restaurants-dropdown');
        this.mobileDropdown = document.getElementById('mobile-restaurants-dropdown-menu');
        this.mobileToggle = document.getElementById('mobile-restaurants-toggle');
        this.isMobileOpen = false;

        this.init();
    }

    async init() {
        // Wait for restaurants data to be loaded
        await this.waitForRestaurantsData();

        if (this.restaurants.length > 0) {
            this.addEventListeners();
        }
    }

    async waitForRestaurantsData() {
        return new Promise((resolve) => {
            const checkData = () => {
                if (typeof restaurants !== 'undefined' && restaurants.length > 0) {
                    this.restaurants = restaurants;
                    resolve();
                } else {
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
    }

    addEventListeners() {
        // Desktop dropdown event listeners
        const desktopLinks = document.querySelectorAll('.restaurant-dropdown-link');
        desktopLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const restaurantId = link.getAttribute('data-restaurant-id');
                this.showRestaurantCard(restaurantId);
            });
        });

        // Add hover event listener for desktop dropdown animation
        if (this.desktopDropdown) {
            this.desktopDropdown.addEventListener('mouseenter', () => {
                this.animateDesktopDropdownOpen();
            });
        }

        // Mobile dropdown toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling up to mobile nav
                this.toggleMobileDropdown();
            });
        }

        // Mobile dropdown links
        const mobileLinks = document.querySelectorAll('.mobile-restaurant-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling up to mobile nav
                const restaurantId = link.getAttribute('data-restaurant-id');
                this.showRestaurantCard(restaurantId);
                this.closeMobileDropdown();
                // Close mobile menu
                if (typeof closeMobileMenu === 'function') {
                    closeMobileMenu();
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.desktopDropdown && !this.desktopDropdown.contains(e.target)) {
                // Desktop dropdown will close automatically on mouse leave
            }

            // Close mobile dropdown when clicking outside of it
            if (this.mobileDropdown && this.isMobileOpen &&
                !this.mobileDropdown.contains(e.target) &&
                !this.mobileToggle.contains(e.target)) {
                this.closeMobileDropdown();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileDropdown();
            }
        });
    }

    toggleMobileDropdown() {
        const dropdown = this.mobileDropdown;
        const toggle = this.mobileToggle;
        const arrow = toggle.querySelector('svg');

        if (this.isMobileOpen) {
            this.closeMobileDropdown();
        } else {
            this.openMobileDropdown();
        }
    }

    openMobileDropdown() {
        const dropdown = this.mobileDropdown;
        const toggle = this.mobileToggle;
        const arrow = toggle.querySelector('svg');

        dropdown.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        this.isMobileOpen = true;

        // Create timeline for coordinated animation
        const tl = gsap.timeline();

        // First animate the dropdown container
        tl.to(dropdown, {
            opacity: 1,
            maxHeight: "500px",
            duration: 0.8,
            ease: "power2.inOut"
        });

        // Then animate dropdown items with stagger effect from left
        const links = dropdown.querySelectorAll('.mobile-restaurant-link');
        tl.fromTo(links, {
            opacity: 0,
            x: -20,
            filter: "blur(3px)"
        }, {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.075,
            ease: "power2.out"
        }, "<50%"); // Start slightly before container animation ends
    }

    closeMobileDropdown() {
        const dropdown = this.mobileDropdown;
        const toggle = this.mobileToggle;
        const arrow = toggle.querySelector('svg');

        if (dropdown && !dropdown.classList.contains('hidden')) {
            // Create timeline for coordinated close animation
            const tl = gsap.timeline({
                onComplete: () => {
                    dropdown.classList.add('hidden');
                    this.isMobileOpen = false;
                }
            });

            // First animate dropdown items out
            const links = dropdown.querySelectorAll('.mobile-restaurant-link');
            tl.to(links, {
                opacity: 0,
                x: 20,
                duration: 0.2,
                stagger: 0.03,
                ease: "power2.in"
            });

            // Then animate the dropdown container out
            tl.to(dropdown, {
                opacity: 0,
                y: -10,
                maxHeight: "0px",
                duration: 0.3,
                ease: "power2.in"
            }, "<80%");

            // Rotate arrow back
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    animateDesktopDropdownOpen() {
        // Set initial state for desktop dropdown links
        const desktopLinks = document.querySelectorAll('.restaurant-dropdown-link');
        gsap.set(desktopLinks, {
            opacity: 0,
            x: -20,
            scale: 0.95
        });

        // Animate desktop dropdown items with stagger effect from left
        gsap.to(desktopLinks, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.05,
            ease: "back.out(1.1)"
        });
    }

    showRestaurantCard(restaurantId) {
        // Find the restaurant data
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (!restaurant) {
            console.error('Restaurant not found:', restaurantId);
            return;
        }

        // Show the dish popup for the selected restaurant
        if (window.dishPopup && typeof window.dishPopup.showPopupWithURL === 'function') {
            window.dishPopup.showPopupWithURL(restaurantId);
        } else {
            console.error('DishPopup not available');
        }

        // Scroll to restaurants section
        const restaurantsSection = document.getElementById('restaurants');
        if (restaurantsSection) {
            restaurantsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Initialize chef popup system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Wait for restaurants data to be loaded first
    setTimeout(() => {

        if (typeof restaurants !== 'undefined' && restaurants.length > 0) {
            populateChefsList();

            // Only initialize popups if their elements exist (index page only)
            if (document.getElementById('chef-popup')) {
                window.chefPopup = new ChefPopup();
            }

            if (document.getElementById('dish-popup')) {
                window.dishPopup = new DishPopup();
            }

            if (document.getElementById('restaurant-carousel')) {
                window.restaurantCarousel = new RestaurantCarousel();
            }

            // Initialize restaurant dropdown (works on all pages with nav)
            window.restaurantDropdown = new RestaurantDropdown();

            // Initialize the popup router AFTER popup systems are ready (only if popups exist)
            if (window.chefPopup || window.dishPopup) {
                window.popupRouter = new PopupRouter();
            }
        } else {
            console.error('Restaurants data not available for chef popup initialization');
        }
    }, 1000);



});

