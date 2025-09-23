// Import GSAP and ScrollTrigger
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Swiper
import Swiper from 'swiper';
import { Navigation, EffectCards } from 'swiper/modules';
import 'swiper/css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

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

                    // Disable page scrolling
                    document.body.style.overflow = 'hidden';
                }, 150);

            }


            // Add hamburger animation
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (mobileMenu.classList.contains('translate-x-0')) {
                    // Animate to X
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    // Reset to hamburger
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
    });
});

        // Function to close mobile menu
        function closeMobileMenu() {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('-translate-x-full');

            // Reset hamburger animation
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });

            // Re-enable page scrolling
            document.body.style.overflow = 'auto';

            // Slide burger back into view
            setTimeout(() => {
                navToggle.style.transform = 'translateX(0)';
                navToggle.style.opacity = '1';
            }, 150);

        }

        // Close mobile menu when clicking close button
        const mobileCloseBtn = document.getElementById('mobile-close-btn');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', closeMobileMenu);
        }

        // Close mobile menu when clicking on a mobile nav link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('translate-x-0') &&
                !navToggle.contains(e.target) &&
                !mobileMenu.contains(e.target)) {
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




// Add intersection observer for smooth animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.location-info, .contact-info').forEach(el => {
        if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
        }
});

// Touch device detection for hero elements
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Adjust hero element behavior for touch devices
if (isTouchDevice()) {
    document.querySelectorAll('.interactive-element').forEach(element => {
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const popup = this.querySelector('.popup');
            popup.style.opacity = '1';
            popup.style.visibility = 'visible';
            popup.style.transform = 'translateX(-50%) translateY(-10px)';
        });

        element.addEventListener('touchend', function() {
            const popup = this.querySelector('.popup');
            popup.style.opacity = '0';
            popup.style.visibility = 'hidden';
            popup.style.transform = 'translateX(-50%)';
        });
    });
}
});

// Global variables to store map and marker references
let map;
let markers = [];
let restaurants = [];

// Function to set up location section animations with ScrollTrigger
function setupLocationAnimations() {


    // Animate restaurant list items
    const listItems = document.querySelectorAll('.location-list-item');
    if (listItems.length > 0) {
        gsap.to(listItems, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.2,
            delay: 0.8,
            scrollTrigger: {
                trigger: "#location",
                end: "bottom 20%",
                toggleActions: "play none none none",
                once: true
            }
        });
    }
}

// Function to set up chefs section animations with ScrollTrigger
function setupChefsAnimations() {
    // Animate chef items with stagger effect
    const chefItems = document.querySelectorAll('#chefs-list .chef');
    if (chefItems.length > 0) {

        chefItems.forEach((chefItem, index) => {
            gsap.to(chefItem, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.inOut",
                delay: index * 0.3,
                scrollTrigger: {
                    trigger: chefItem,
                    start: "top bottom",
                    end: "bottom 20%",
                    toggleActions: "play none none none",
                    once: true
                }
            });
        });

    }
}

// Initialize Mapbox Map and Load Restaurant Data
async function initializeMap() {
    // You'll need to get a Mapbox access token from https://mapbox.com
    // For now, let's use a demo token or you can get your own
    window.mapboxgl.accessToken = 'pk.eyJ1IjoidHVuZ3N0ZW5hZHZlcnRpc2luZyIsImEiOiJja2dsZGNyZjAwMXltMnNqbzNrYTIwb210In0.PFX4yyFsRcpGMyQJV3uOkA';

    // Initialize the map
    map = new window.mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12', // Using a stable Mapbox style
        center: [-122.4142, 37.7894], // San Francisco center
        zoom: 12
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

    // Load restaurant data from JSON
    try {
        // Use different paths for development vs production
        const isDev = import.meta.env.DEV;
        const dataPath = isDev ? 'src/data/restaurants.json' : 'data/restaurants.json';
        const response = await fetch(dataPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        restaurants = data.restaurants;

        // Add markers for each restaurant
        restaurants.forEach((restaurant, index) => {
            // Create a custom marker element with SVG
            const markerEl = document.createElement('div');
            markerEl.className = 'mapboxgl-marker restaurant-marker';
            markerEl.setAttribute('data-restaurant-id', restaurant.id);
            markerEl.style.cssText = `
                width: 27px;
                height: 33px;
                cursor: pointer;
            `;

            // Add the SVG content
            markerEl.innerHTML = `
                <svg class="restaurant-marker-svg" xmlns="http://www.w3.org/2000/svg" width="27" height="33" fill="#ffffffaa" viewBox="0 0 27 33" style="width: 100%; height: 100%;">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24.75 14c0 8.75-11.25 16.25-11.25 16.25S2.25 22.75 2.25 14a11.25 11.25 0 1 1 22.5 0Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13.5 17.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"/>
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
            const marker = new window.mapboxgl.Marker(markerEl)
                .setLngLat(restaurant.coordinates)
                .setPopup(new window.mapboxgl.Popup({
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
                // Remove hover-scale class when marker is clicked
                markerEl.classList.remove('hover-scale');
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

            // Add hover events to marker
            markerEl.addEventListener('mouseenter', () => {
                // Add hover-scale class to corresponding list item
                const listItem = document.querySelector(`[data-restaurant-id="${restaurant.id}"]`);
                if (listItem && !listItem.classList.contains('active')) {
                    listItem.classList.add('hover-scale');

                    // Make other list items slightly transparent
                    document.querySelectorAll('.location-list-item:not(.active)').forEach(item => {
                        if (item !== listItem) {
                            item.style.opacity = '0.6';
                        }
                    });

                    // Reset opacity for hovered item
                    listItem.style.opacity = '1';
                }
            });

            markerEl.addEventListener('mouseleave', () => {
                // Remove hover-scale class from corresponding list item
                const listItem = document.querySelector(`[data-restaurant-id="${restaurant.id}"]`);
                if (listItem) {
                    listItem.classList.remove('hover-scale');

                    // Reset opacity for all list items
                    document.querySelectorAll('.location-list-item').forEach(item => {
                        item.style.opacity = '1';
                    });
                }
            });
        });

        // Populate restaurant list
        populateRestaurantList(restaurants);

        // Set up location section animations with ScrollTrigger
        setupLocationAnimations();



    } catch (error) {
        console.error('Error loading restaurant data:', error);
        console.error('Error details:', error.message);
        console.error('Restaurants data available:', restaurantsData);

        // Fallback: show error message
        const restaurantList = document.getElementById('restaurant-list');
        if (restaurantList) {
            restaurantList.innerHTML = `
                <div class="col-span-full text-center text-white">
                    <p>Unable to load restaurant data. Please try again later.</p>
                    <p class="text-sm mt-2">Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Populate restaurant list
function populateRestaurantList(restaurants) {
    const restaurantList = document.getElementById('restaurant-list');

    restaurantList.innerHTML = `
        <div class="text-white">
            <ul class="space-y-4">
                ${restaurants.map(restaurant => `
                    <li class="location-list-item block" data-restaurant-id="${restaurant.id}">
                        <div class="location-list-item-name font-extrabold text-white">${restaurant.name}</div>
                        <div class="location-list-item-address text-white/90">${restaurant.address}</div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    // Add click and hover event listeners to restaurant list items
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.addEventListener('click', (e) => {

            const restaurantId = item.getAttribute('data-restaurant-id');
            highlightMarkerFromRestaurant(restaurantId);
        });

        // Add hover events for marker scaling
        item.addEventListener('mouseenter', () => {
            const restaurantId = item.getAttribute('data-restaurant-id');
            scaleMarkerOnHover(restaurantId, true);
        });

        item.addEventListener('mouseleave', () => {
            const restaurantId = item.getAttribute('data-restaurant-id');
            scaleMarkerOnHover(restaurantId, false);
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
    }

    // Make other list items slightly transparent
    document.querySelectorAll('.location-list-item:not(.active)').forEach(item => {
        item.style.opacity = '0.6';
    });

    // Reset opacity for active item
    if (listItem) {
        listItem.style.opacity = '1';
    }
}

// Function to highlight marker from restaurant list click
function highlightMarkerFromRestaurant(restaurantId) {
    // Remove active and hover-scale classes from all markers
    markers.forEach(markerData => {
        markerData.element.classList.remove('active');
        markerData.element.classList.remove('hover-scale');
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

    // Remove active and hover-scale classes from all list items
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('hover-scale');
    });

    // Add active class to clicked list item
    const listItem = document.querySelector(`[data-restaurant-id="${restaurantId}"]`);
    if (listItem) {
        listItem.classList.add('active');
    }

    // Make other list items slightly transparent
    document.querySelectorAll('.location-list-item:not(.active)').forEach(item => {
        item.style.opacity = '0.6';
    });

    // Reset opacity for active item
    if (listItem) {
        listItem.style.opacity = '1';
    }
}

// Function to scale marker on hover
function scaleMarkerOnHover(restaurantId, isHovering) {
    const markerData = markers.find(m => m.restaurant.id === restaurantId);
    if (markerData) {
        if (isHovering) {
            // Only add hover scale if marker is not already active
            if (!markerData.element.classList.contains('active')) {
                markerData.element.classList.add('hover-scale');
            }
        } else {
            markerData.element.classList.remove('hover-scale');
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
        markerData.element.classList.remove('hover-scale');
    });

    // Remove active and hover-scale classes from all list items
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('hover-scale');
        item.style.opacity = '1';
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

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMap);

// Chef Popup System
class ChefPopup {
    constructor() {
        this.popup = document.getElementById('chef-popup');
        this.closeBtn = document.getElementById('chef-popup-close');
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
                    this.showPopup(chefId);
                });
            }

            // Add click event to chef name container
            if (chefNameContainer) {
                chefNameContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefNameContainer.getAttribute('data-chef');
                    this.showPopup(chefId);
                });
            }
        });

        // Close popup events
        this.closeBtn.addEventListener('click', () => this.hidePopup());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePopup();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopup();
                }
            }
        });
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
            this.populatePopup(chefData);

            // Show popup with GSAP animation
            this.popup.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Animate popup appearance with GSAP
            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing chef popup:', error);
        }
    }

    populatePopup(chefData) {
        // Update chef image
        const chefImage = document.getElementById('chef-popup-image');
        if (chefImage && chefData.images && chefData.images['chef-popup-header']) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/src/images/${chefData.images['chef-popup-header']}` : `/assets/images/${convertToWebP(chefData.images['chef-popup-header'])}`;
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
        this.initializeCarousel(chefData);
    }


    initializeCarousel(chefData) {
        const swiperWrapper = document.querySelector('.chef-popup-swiper .swiper-wrapper');

        if (!swiperWrapper) {
            console.error('Swiper wrapper not found');
            return;
        }

        // Clear existing slides
        swiperWrapper.innerHTML = '';

        // Check if chef has slider images
        if (chefData.images && chefData.images.slides && chefData.images.slides.length > 0) {
            // Create slides for each image
            chefData.images.slides.forEach((imagePath, index) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                const isDev = import.meta.env.DEV;
                const fullImagePath = isDev ? `/src/images/${imagePath}` : `/assets/images/${convertToWebP(imagePath)}`;
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

            this.swiper = new Swiper('.chef-popup-swiper', {
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
        } else {
            // Hide the carousel if no images
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'none';
            }
        }
    }

    hidePopup() {
        // Animate popup hide with GSAP
        this.animatePopupHide(() => {
            // Hide the popup after animation completes
            this.popup.classList.add('hidden');
            document.body.style.overflow = 'auto';

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

    animatePopupShow() {
        const popupContainer = this.popup.querySelector('.chef-popup-container');
        const overlay = this.popup.querySelector('.chef-popup-overlay');
        const header = this.popup.querySelector('.chef-popup-header');
        const headerImage = this.popup.querySelector('#chef-popup-image');
        const content = this.popup.querySelector('.chef-popup-content');
        const story = this.popup.querySelector('#chef-popup-story');
        const slider = this.popup.querySelector('#chef-popup-slider');
        const closeBtn = this.popup.querySelector('#chef-popup-close');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simple fade-in for reduced motion
            gsap.set([overlay, content, story, slider, closeBtn], {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationX: 0,
            });
            return gsap.timeline();
        }

        // Set initial states
        gsap.set(popupContainer, {
            opacity: 0,
            scale: 0,
            rotationX: -15,
            borderRadius: '50%'
        });

        gsap.set(header, {
            height: 0
        })

        gsap.set(headerImage, {
            opacity: 0,
            scale: 1.2
        })

        gsap.set(content, {
            height: 0
        })

        gsap.set(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)'
        });

        gsap.set([story, slider, closeBtn], {
            opacity: 0,
            y: 20
        });

        // Create timeline for smooth orchestrated animation
        const tl = gsap.timeline({
            ease: "power2.out"
        });

        // Animate overlay first
        tl.to(overlay, {
            opacity: 1,
            backdropFilter: 'blur(10px)',
            duration: 0.4,
            ease: "power2.out"
        })
        // Animate popup container
        .to(popupContainer, {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            borderRadius: '0%',
            duration: 0.6,
            ease: "back.out(1.2)"
        }, "-=0.1")
        .to(header, {
            height: 'auto',
            duration: 0.6,
            ease: "back.out(1.2)"
        }, "<20%")
        .to(headerImage, {
            opacity: 1,
            scale: 1.01,
            duration: 1,
            ease: "power2.out"
        }, "<20%")
        // Stagger animate content elements
        .to(content, {
            height: 'auto',
            duration: 0.8,
            ease: "power2.inOut"
        }, "<20%")
        // Animate story text separately for more control
        .to(story, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        })
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
        const closeBtn = this.popup.querySelector('#chef-popup-close');

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
        tl.to([slider, closeBtn, story], {
            opacity: 0,
            y: -20,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        })
        .to(header, {
            height: 0,
            duration: 0.3,
            ease: "power2.in"
        })
        .to(headerImage, {
            opacity: 0,
            scale: 1.3,
            duration: 0.3,
            ease: "power2.in"
        })
        // Animate popup container
        .to(popupContainer, {
            opacity: 0,
            scale: 0.9,
            y: -30,
            rotationX: 10,
            duration: 0.4,
            ease: "power2.in"
        }, "-=0.1")
        // Animate overlay out
        .to(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            duration: 0.3,
            ease: "power2.in"
        }, "-=0.2");

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
        console.error('Chefs list element not found');
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
        const isDev = import.meta.env.DEV;
        const imageBasePath = isDev ? '/src/images' : '/assets/images';

        // Convert image extensions for production
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
                        <span class="chef-name absolute font-bold text-white text-lg md:text-xl">${restaurant.chef}</span>
                        <img src="${imageBasePath}/ui/chefNameShape.svg" alt="Chef Name Shape Background" class="chef-name-shape" loading="lazy" fetchpriority="low" decoding="async">
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
            this.startRotation();
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
                window.dishPopup.showPopup(currentRestaurant.id);
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

        // Set initial active state and position
        this.rotateToRestaurant(0);
    }

    createRestaurantItem(restaurant, index) {
        const item = document.createElement('div');
        item.className = 'restaurant-item';
        item.setAttribute('data-restaurant-id', restaurant.id);
        item.setAttribute('data-index', index);

        // Calculate circular position with responsive radius
        const angle = (index * 60) - 90; // Start from top (12 o'clock position)
        const radius = this.getCarouselRadius(); // Get radius from CSS variable
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        // Position the item
        item.style.left = `calc(50% + ${x}px)`;
        item.style.top = `calc(50% + ${y}px)`;
        item.style.transform = 'translate(-50%, -50%)';

        // Add restaurant dish image
        const img = document.createElement('img');
        const isDev = import.meta.env.DEV;

        // Use the dish image from restaurant data
        let imageSource;
        if (restaurant.images && restaurant.images.dish) {
            imageSource = isDev ? `/src/images/${restaurant.images.dish}` : `/assets/images/${convertToWebP(restaurant.images.dish)}`;
        } else {
            // Fallback to the old method if no dish image in data
            imageSource = this.getDishImagePath(restaurant.id);
            imageSource = isDev ? imageSource : convertToWebP(imageSource);
        }

        img.src = imageSource;
        img.alt = restaurant.name;
        img.loading = 'lazy';

        // Add error handling for images
        img.onerror = () => {
            console.warn(`Failed to load image for ${restaurant.name}: ${imageSource}`);
            // Could set a fallback image here
        };

        item.appendChild(img);

        // Add click event
        item.addEventListener('click', () => {
            this.rotateToRestaurant(index);
            this.resetRotation();

            // Show dish popup
            if (window.dishPopup) {
                window.dishPopup.showPopup(restaurant.id);
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

    updateCentralLogo(restaurant) {
        if (!this.logoDisplay) return;

        // Get the logo path for this restaurant
        let logoPath;
        const isDev = import.meta.env.DEV;

        if (restaurant.images && restaurant.images.logo) {
            logoPath = isDev ? `/src/images/${restaurant.images.logo}` : `/assets/images/${convertToWebP(restaurant.images.logo)}`;
        } else {
            // Fallback to the old method if no logo in data
            logoPath = this.getLogoPath(restaurant.id);
            logoPath = isDev ? logoPath : convertToWebP(logoPath);
        }

        // Create a smooth crossfade transition
        // First, create a temporary overlay element for the new logo
        const tempLogo = document.createElement('div');
        tempLogo.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${logoPath}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0;
            filter: blur(10px);
            transform: scale(1.1);
            z-index: 2;
        `;

        // Add the temporary logo to the display container
        this.logoDisplay.appendChild(tempLogo);

        // Crossfade animation: fade out current logo while fading in new logo
        const tl = gsap.timeline({
            onComplete: () => {
                // Update the main logo background and remove temporary element
                this.logoDisplay.style.backgroundImage = `url('${logoPath}')`;
                this.logoDisplay.style.backgroundSize = 'contain';
                this.logoDisplay.style.backgroundRepeat = 'no-repeat';
                this.logoDisplay.style.backgroundPosition = 'center';
                this.logoDisplay.removeChild(tempLogo);
            }
        });

        // Fade in the new logo while keeping the old one visible
        tl.to(tempLogo, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: "power2.inOut"
        });
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

    getLogoPath(restaurantId) {
        const chefFolder = this.getChefFolder(restaurantId);
        return `/src/images/chefs/${chefFolder}/logo.png`;
    }

    getDishImagePath(restaurantId) {
        const chefFolder = this.getChefFolder(restaurantId);
        return `/src/images/chefs/${chefFolder}/dish.png`;
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
    }
}

// Dish Popup System
class DishPopup {
    constructor() {
        this.popup = document.getElementById('dish-popup');
        this.closeBtn = document.getElementById('dish-popup-close');
        this.overlay = document.querySelector('.dish-popup-overlay');
        this.currentRestaurant = null;

        this.init();
    }

    init() {
        // Close popup events
        this.closeBtn.addEventListener('click', () => this.hidePopup());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePopup();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopup();
                }
            }
        });

        // Price toggler events
    }

    async showPopup(restaurantId) {
        try {

            // Find restaurant data
            const restaurantData = restaurants.find(restaurant => restaurant.id === restaurantId);
            if (!restaurantData) {
                console.error('Restaurant not found:', restaurantId);
                return;
            }


            this.currentRestaurant = restaurantData;
            this.populatePopup(restaurantData);

            // Show popup with GSAP animation
            this.popup.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            // Animate popup appearance with GSAP
            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing dish popup:', error);
        }
    }

    populatePopup(restaurantData) {
        // Update restaurant logo
        const logoElement = document.getElementById('dish-popup-logo');
        if (logoElement && restaurantData.images && restaurantData.images.logo) {
            const isDev = import.meta.env.DEV;
            const logoPath = isDev ? `/src/images/${restaurantData.images.logo}` : `/assets/images/${convertToWebP(restaurantData.images.logo)}`;
            logoElement.src = logoPath;
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

        // Update special menu name
        const menuNameElement = document.getElementById('dish-popup-menu-name');
        if (menuNameElement) {
            menuNameElement.textContent = restaurantData.popup?.menu?.menuName || 'Special Diwali Menu';

            // Apply color from JSON
            if (restaurantData.popup?.menu?.menuNameColor && restaurantData.popup.menu.menuNameColor.trim() !== '') {
                // Remove any existing color classes that might interfere
                menuNameElement.classList.remove('text-teal-800', 'text-gray-800', 'text-black');

                // Apply the color with !important
                menuNameElement.style.setProperty('color', restaurantData.popup.menu.menuNameColor);

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
                const imagePath = isDev ? `/src/images/${restaurantHeader}` : `/assets/images/${convertToWebP(restaurantHeader)}`;

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

        // Update menu image - use menu image from menu structure
        const menuImageElement = document.getElementById('dish-popup-menu-image');
        if (menuImageElement && restaurantData.popup?.menu?.menuImage) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/src/images/${restaurantData.popup.menu.menuImage}` : `/assets/images/${convertToWebP(restaurantData.popup.menu.menuImage)}`;
            menuImageElement.src = imagePath;
            menuImageElement.alt = `${restaurantData.name} - ${restaurantData.popup.menu.menuName}`;
        } else if (menuImageElement && restaurantData.images && restaurantData.images.dish) {
            // Fallback to dish image if menu image not available
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/src/images/${restaurantData.images.dish}` : `/assets/images/${convertToWebP(restaurantData.images.dish)}`;
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

        // Use menu content from the new menu structure
        if (restaurantData.popup?.menu?.content) {
            menuContent.innerHTML = restaurantData.popup.menu.content;
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

        const shapePath = reservationBtn.querySelector('svg path');
        if (!shapePath) return;

        // Get the dedicated color from restaurant data, fallback to default
        const shapeColor = restaurantData.popup?.reserveTableShapeColor || '#1E2A78';

        // Update the fill color of the shape
        shapePath.setAttribute('fill', shapeColor);

    }

    updateMenuPriceAndColor(restaurantData) {
        // Find the menu price container and elements
        const menuPriceContainer = document.getElementById('menu-price-container');
        if (!menuPriceContainer) return;

        const menuPriceElement = document.getElementById('menu-price');
        const menuPriceShape = menuPriceContainer.querySelector('svg path');

        if (!menuPriceElement || !menuPriceShape) return;

        // Get the price and color from restaurant data
        const menuPrice = restaurantData.popup?.menuPrice || 'Price';
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
            return prices.map(price => `<span class="price-value text-4xl -top-1 relative">${price}</span><span class="price-currency text-3xl">$</span>`).join(' & ');
        } else {
            // Single price - add dollar sign
            return `<span class="price-value text-4xl -top-1 relative">${priceString}</span><span class="price-currency text-3xl">$</span>`;
        }
    }

    hidePopup() {
        // Animate popup hide with GSAP
        this.animatePopupHide(() => {
            // Hide the popup after animation completes
            this.popup.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }

    animatePopupShow() {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simple fade-in for reduced motion
            gsap.set([overlay, popupContainer, header, content, closeBtn], {
                opacity: 1,
                scale: 1,
                y: 0
            });
            return gsap.timeline();
        }

        // Set initial states
        gsap.set(popupContainer, {
            opacity: 0,
            scale: 0.8,
            y: 50
        });

        gsap.set(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)'
        });

        gsap.set([header, content, closeBtn], {
            opacity: 0,
            y: 20
        });

        // Create timeline for smooth orchestrated animation
        const tl = gsap.timeline({
            ease: "power2.out"
        });

        // Animate overlay first
        tl.to(overlay, {
            opacity: 1,
            backdropFilter: 'blur(10px)',
            duration: 0.4,
            ease: "power2.out"
        })
        // Animate popup container
        .to(popupContainer, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.2)"
        }, "-=0.1")
        // Animate content elements
        .to([header, content, closeBtn], {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.2");

        return tl;
    }

    animatePopupHide(callback) {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Simple fade-out for reduced motion
            gsap.set([popupContainer, overlay, header, content, closeBtn], {
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
        tl.to([header, content, closeBtn], {
            opacity: 0,
            y: -20,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        })
        // Animate popup container
        .to(popupContainer, {
            opacity: 0,
            scale: 0.9,
            y: 30,
            duration: 0.4,
            ease: "power2.in"
        }, "-=0.1")
        // Animate overlay out
        .to(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            duration: 0.3,
            ease: "power2.in"
        }, "-=0.2");

        return tl;
    }
}

// Initialize chef popup system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Wait for restaurants data to be loaded
    setTimeout(() => {

        if (typeof restaurants !== 'undefined' && restaurants.length > 0) {
            populateChefsList();

            new ChefPopup();

            window.dishPopup = new DishPopup();

            window.restaurantCarousel = new RestaurantCarousel();
        } else {
            console.error('Restaurants data not available for chef popup initialization');
        }
    }, 1000);
});

