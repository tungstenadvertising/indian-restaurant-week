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
            console.log('Burger clicked!');
            e.preventDefault();

            const isOpen = mobileMenu.classList.contains('translate-x-0');

            if (isOpen) {
                closeMobileMenu();
            } else {
                console.log('Opening mobile menu...');

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

                console.log('Mobile menu opened');
            }

            console.log('Mobile menu classes:', mobileMenu.className);

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
            console.log('Closing mobile menu...');
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

            console.log('Mobile menu closed');
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
        const response = await fetch('/src/data/restaurants.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        restaurants = data.restaurants;
        console.log('Restaurants loaded:', restaurants.length);

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

            console.log('Restaurant list item clicked:', item);
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
        console.log('Found chef elements:', chefElements.length);

        chefElements.forEach((chefElement, index) => {
            console.log(`Chef element ${index}:`, chefElement);
            console.log(`Chef ID:`, chefElement.getAttribute('data-chef'));

            // Find the chef image container and name container within this chef element
            const chefImageContainer = chefElement.querySelector('.chef-image-container');
            const chefNameContainer = chefElement.querySelector('.chef-name-container');

            // Add click event to chef image container
            if (chefImageContainer) {
                chefImageContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefImageContainer.getAttribute('data-chef');
                    console.log('Chef image clicked:', chefId);
                    this.showPopup(chefId);
                });
            }

            // Add click event to chef name container
            if (chefNameContainer) {
                chefNameContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefNameContainer.getAttribute('data-chef');
                    console.log('Chef name clicked:', chefId);
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
            console.log('showPopup called with chefId:', chefId);
            console.log('Available restaurants:', restaurants);

            // Reset slider container state first
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'block';
            }

            // Find chef data from restaurants
            const chefData = restaurants.find(restaurant => restaurant.id === chefId);
            if (!chefData) {
                console.error('Chef not found:', chefId);
                console.log('Available chef IDs:', restaurants.map(r => r.id));
                return;
            }

            console.log('Found chef data:', chefData);
            console.log('Chef popup data:', chefData.popup);

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
        if (chefImage && chefData.popup && chefData.popup.chefImage) {
            chefImage.src = `/src/images/${chefData.popup.chefImage}`;
            chefImage.alt = chefData.chef;
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
            const storyContent = chefData.popup && chefData.popup.chefBio ? chefData.popup.chefBio : 'No biography available.';
            console.log('Chef bio content:', storyContent);
            storyElement.innerHTML = storyContent;
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
        if (chefData.popup && chefData.popup.sliderImages && chefData.popup.sliderImages.length > 0) {
            // Create slides for each image
            chefData.popup.sliderImages.forEach((imageName, index) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `
                    <img
                        src="/src/images/${imageName}"
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
        if (!restaurant.chefImage || !restaurant.chefBackgroundImage) {
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
        chefElement.innerHTML = `
                <div class="relative flex-none">
                    <div class="chef-image-container m-auto relative z-0 cursor-pointer" data-chef="${restaurant.id}">
                        <div class="chef-bg-circle rounded-full relative">
                            <img src="/src/images/${restaurant.chefImage}" alt="${restaurant.chef}" class="chef-image absolute z-10 bottom-0 inset-x-0 m-auto" loading="lazy" fetchpriority="low" decoding="async">
                            <img src="/src/images/${restaurant.chefBackgroundImage}" alt="${restaurant.chef} Background" class="chef-image-bg object-cover rounded-full w-full h-full relative z-0" loading="lazy" fetchpriority="low" decoding="async">
                        </div>
                    </div>
                    <div class="chef-name-container relative grid place-items-center -mt-10 z-10 cursor-pointer" data-chef="${restaurant.id}">
                        <span class="chef-name absolute m-auto font-bold text-white text-lg md:text-xl">${restaurant.chef}</span>
                        <img src="/src/images/chefNameShape.svg" alt="Chef Name Shape Background" class="chef-name-shape" loading="lazy" fetchpriority="low" decoding="async">
                    </div>
                </div>
                <div class="@container w-full hef-excerpt-container mt-2 md:mt-0 px-4 text-center ${textAlignmentClass} flex-1">
                    <h3 class="chef-excerpt-title text-balance font-semibold text-lg sm:text-xl lg:text-2xl xl:text-[28px]">${restaurant.name} — ${restaurant.chef}</h3>
                    <p class="chef-excerpt text-pretty text-lg sm:text-xl lg:text-2xl xl:text-[28px]">${restaurant.excerpt}</p>
                </div>
            `;


        chefsList.appendChild(chefElement);
    });

    console.log(`Populated ${restaurants.length} chefs in the chefs list`);

    // Set up GSAP animations for chefs after they are populated
    setupChefsAnimations();
}

// Initialize chef popup system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chef popup system...');

    // Wait for restaurants data to be loaded
    setTimeout(() => {
        console.log('Checking for restaurants data...');
        console.log('typeof restaurants:', typeof restaurants);
        console.log('restaurants length:', restaurants ? restaurants.length : 'undefined');

        if (typeof restaurants !== 'undefined' && restaurants.length > 0) {
            console.log('Populating chefs list...');
            populateChefsList();

            console.log('Initializing ChefPopup...');
            new ChefPopup();
        } else {
            console.error('Restaurants data not available for chef popup initialization');
        }
    }, 1000);
});

