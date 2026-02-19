// Index page script — only loaded on the homepage
// Contains: carousel, popups, map, chefs, animations

import {
    gsap, ScrollTrigger,
    restaurants, getRestaurantData, loadRestaurantData,
    getActiveSeason, getActiveMenu, getActiveMenuPrice,
    freezeBodyScroll, unfreezeBodyScroll
} from './shared.js';

// Dynamic import functions for heavy libraries (index-page only)
let mapboxgl = null;
let Swiper = null;
let Navigation = null;
let EffectCards = null;

async function loadMapbox() {
    if (mapboxgl) return mapboxgl;

    try {
        if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
            document.head.appendChild(link);
        }

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

async function loadSwiper() {
    if (Swiper && Navigation && EffectCards) return { Swiper, Navigation, EffectCards };

    try {
        if (!document.querySelector('link[href*="swiper-bundle.min.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
            document.head.appendChild(link);
        }

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

// ─── Map System ──────────────────────────────────────────────────────────────

let map;
let markers = [];

function setupLocationAnimations() {
    const locationListItems = document.querySelectorAll('.location-list-item .location-list-item-container');

    if (locationListItems.length === 0) {
        console.warn('No location list items found for animation setup');
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        gsap.set(locationListItems, {
            opacity: 1,
            y: 0
        });
        return;
    }

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

async function initializeMap() {
    try {
        const mapbox = await loadMapbox();

        mapbox.accessToken = import.meta.env.PUBLIC_MAPBOX_TOKEN;

        map = new mapbox.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-122.4142, 37.7894],
            zoom: 12,
            antialias: false,
            fadeDuration: 0,
            trackResize: false,
            renderWorldCopies: false
        });

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

        map.on('load', () => {
            map.resize();
            const canvas = map.getCanvas();
            canvas.style.height = '100%';
            canvas.style.width = '100%';
        });

        if (restaurants.length === 0) {
            console.log('Restaurant data not yet loaded, loading now...');
            await loadRestaurantData();
        }

        restaurants.forEach((restaurant, index) => {
            const markerEl = document.createElement('div');
            markerEl.className = 'mapboxgl-marker restaurant-marker';
            markerEl.setAttribute('data-restaurant-id', restaurant.id);
            markerEl.style.cssText = `
                width: 48px;
                height: 48px;
                cursor: pointer;
            `;

            markerEl.innerHTML = `
                <svg class="restaurant-marker-svg" xmlns="http://www.w3.org/2000/svg" width="27" height="33" fill="#ffffffaa" viewBox="0 0 27 33" style="width: 80%; height: 80%; margin: auto;">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M24.75 14c0 8.75-11.25 16.25-11.25 16.25S2.25 22.75 2.25 14a11.25 11.25 0 1 1 22.5 0Z"/>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M13.5 17.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"/>
                </svg>
            `;

            const popupContent = `
                <div class="p-3">
                    <h3 class="font-bold text-lg text-gray-800">${restaurant.name}</h3>
                    <p class="text-sm text-gray-500">${restaurant.address}</p>
                </div>
            `;

            const marker = new mapbox.Marker(markerEl)
                .setLngLat(restaurant.coordinates)
                .setPopup(new mapbox.Popup({
                    focusAfterOpen: false
                }).setHTML(popupContent))
                .addTo(map);

            markers.push({
                marker: marker,
                element: markerEl,
                restaurant: restaurant,
                index: index
            });

            markerEl.addEventListener('click', () => {
                markerEl.classList.remove('hover');
                map.easeTo({
                    center: restaurant.coordinates,
                    zoom: 13,
                    duration: 1000,
                    essential: true
                });
                closeAllPopups();
                highlightRestaurantFromMarker(restaurant.id);
            });
        });

        populateRestaurantList(restaurants);
        setupLocationAnimations();

        markers.forEach(markerData => {
            const markerEl = markerData.element;
            const restaurant = markerData.restaurant;

            markerEl.addEventListener('mouseenter', () => {
                console.log('Marker hover enter:', restaurant.id);
                const listItem = document.querySelector(`.location-list-item[data-restaurant-id="${restaurant.id}"]`);
                console.log('Found list item:', listItem);
                if (listItem && !listItem.classList.contains('hover')) {
                    listItem.classList.add('hover');
                    console.log('Added hover class to list item');
                }
            });

            markerEl.addEventListener('mouseleave', () => {
                console.log('Marker hover leave:', restaurant.id);
                const listItem = document.querySelector(`.location-list-item[data-restaurant-id="${restaurant.id}"]`);
                if (listItem) {
                    listItem.classList.remove('hover');
                    console.log('Removed hover class from list item');
                }
            });
        });

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

function highlightRestaurantFromMarker(restaurantId) {
    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
    });

    const listItem = document.querySelector(`[data-restaurant-id="${restaurantId}"]`);
    if (listItem) {
        listItem.classList.add('active');
        console.log('Added active class to list item', 'restaurantId', restaurantId, 'listItem', listItem);
    }
}

function highlightMarkerFromRestaurant(restaurantId) {
    markers.forEach(markerData => {
        markerData.element.classList.remove('active');
        markerData.element.classList.remove('hover');
    });

    const markerData = markers.find(m => m.restaurant.id === restaurantId);
    if (markerData) {
        markerData.element.classList.add('active');

        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            popup.remove();
        });

        const popup = markerData.marker.getPopup();
        popup.addTo(map);

        map.easeTo({
            center: markerData.restaurant.coordinates,
            zoom: 14,
            duration: 1000,
            essential: false
        });
    }

    const listItem = document.querySelector(`[data-restaurant-id="${restaurantId}"]`);
    if (listItem) {
        listItem.classList.add('active');
    }
}

function scaleMarkerOnHover(restaurantId, isHovering) {
    const markerData = markers.find(m => m.restaurant.id === restaurantId);
    console.log('scaleMarkerOnHover:', restaurantId, isHovering, markerData);
    if (markerData) {
        if (isHovering) {
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

function closeAllPopups() {
    document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
        popup.remove();
    });
}

function resetHighlights() {
    closeAllPopups();

    markers.forEach(markerData => {
        markerData.element.classList.remove('active');
        markerData.element.classList.remove('hover');
    });

    document.querySelectorAll('.location-list-item').forEach(item => {
        item.classList.remove('active');
        item.classList.remove('hover');
    });

    if (map) {
        map.easeTo({
            center: [-122.4142, 37.7894],
            zoom: 12,
            duration: 1000,
            essential: true
        });
    }
}

// Map click event handler
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (map) {
            map.on('click', (e) => {
                if (e.originalEvent.target.classList.contains('mapboxgl-canvas')) {
                    resetHighlights();
                }
            });

            map.getContainer().addEventListener('mouseleave', () => {
                map.easeTo({
                    zoom: 12,
                    duration: 1000,
                    essential: true
                });
                resetHighlights();
            });

            const restaurantList = document.getElementById('restaurant-list');
            if (restaurantList) {
                restaurantList.addEventListener('mouseleave', () => {
                    resetHighlights();
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

// Initialize map when location section comes into view
let mapInitialized = false;

function initializeMapOnDemand() {
    if (!mapInitialized) {
        mapInitialized = true;
        initializeMap();
    }
}

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

    const locationNavLinks = document.querySelectorAll('a[href="#location"]');
    locationNavLinks.forEach(link => {
        link.addEventListener('click', initializeMapOnDemand);
    });
});

// ─── Chefs Animations ────────────────────────────────────────────────────────

function setupChefsAnimations() {
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

// Chefs title shape animation (runs at module parse time — safe since script is deferred)
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

// ─── URL Routing System for Popups ───────────────────────────────────────────

class PopupRouter {
    constructor() {
        this.currentPopup = null;
        this.currentId = null;
        this.init();
    }

    init() {
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });

        console.log('PopupRouter: Initializing and checking initial URL');
        this.checkInitialURL();
    }

    checkInitialURL() {
        const url = new URL(window.location);
        const path = url.pathname;

        console.log('PopupRouter: Checking initial URL:', path);
        console.log('PopupRouter: Available restaurants:', restaurants.map(r => ({ id: r.id, name: r.name, chef: r.chef })));

        const chefMatch = path.match(/^\/chef\/([^\/]+)$/);
        if (chefMatch) {
            const chefName = chefMatch[1];
            console.log('PopupRouter: Found chef popup URL, chefName:', chefName);
            this.showChefPopupByName(chefName);
            return;
        }

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
        if (!event.state || event.state.popup === null) {
            this.closeCurrentPopup();
            return;
        }

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

        const chef = restaurants.find(r => r.id === chefId);
        if (!chef) {
            console.error('PopupRouter: Chef not found for ID:', chefId);
            return;
        }

        const chefName = chef.chef.toLowerCase().replace(/^chef\s+/i, '').replace(/\s+/g, '-');
        const newUrl = `/chef/${chefName}`;
        history.pushState({ popup: 'chef', name: chefName, id: chefId }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

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

        const newUrl = `/chef/${chefName}`;
        history.pushState({ popup: 'chef', name: chefName, id: chef.id }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

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

        const newUrl = `/restaurant/${restaurantName}`;
        history.pushState({ popup: 'restaurant', name: restaurantName, id: restaurant.id }, '', newUrl);
        console.log('PopupRouter: Updated URL to:', newUrl);

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

        history.pushState({ popup: null }, '', '/');

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

// ─── Chef Popup System ───────────────────────────────────────────────────────

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
        const chefElements = document.querySelectorAll('[data-chef]');

        chefElements.forEach((chefElement, index) => {
            const chefImageContainer = chefElement.querySelector('.chef-image-container');
            const chefNameContainer = chefElement.querySelector('.chef-name-container');

            if (chefImageContainer) {
                chefImageContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefImageContainer.getAttribute('data-chef');
                    this.showPopupWithURL(chefId);
                });
            }

            if (chefNameContainer) {
                chefNameContainer.addEventListener('click', (e) => {
                    e.preventDefault();
                    const chefId = chefNameContainer.getAttribute('data-chef');
                    this.showPopupWithURL(chefId);
                });
            }
        });

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

        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopupWithURL();
                }
            }
        });
    }

    showPopupWithURL(chefId) {
        if (window.popupRouter && typeof window.popupRouter.showChefPopup === 'function') {
            window.popupRouter.showChefPopup(chefId);
        } else {
            this.showPopup(chefId);
        }
    }

    hidePopupWithURL() {
        if (window.popupRouter && typeof window.popupRouter.closeCurrentPopup === 'function') {
            window.popupRouter.closeCurrentPopup();
        } else {
            this.hidePopup();
        }
    }

    async showPopup(chefId) {
        try {
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'block';
            }

            const chefData = restaurants.find(restaurant => restaurant.id === chefId);
            if (!chefData) {
                console.error('Chef not found:', chefId);
                return;
            }

            this.currentChef = chefData;
            await this.populatePopup(chefData);

            this.setInitialAnimationStates();

            this.popup.classList.remove('hidden');
            freezeBodyScroll();

            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing chef popup:', error);
        }
    }

    async populatePopup(chefData) {
        const chefImage = document.getElementById('chef-popup-image');
        if (chefImage && chefData.images && chefData.images['chef-popup-header']) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${chefData.images['chef-popup-header']}` : `/images/${convertToWebP(chefData.images['chef-popup-header'])}`;
            chefImage.src = imagePath;
            chefImage.alt = chefData.chef;
        }

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

        const chefNameElement = document.getElementById('chef-popup-name');
        const restaurantNameElement = document.getElementById('chef-popup-restaurant');

        if (chefNameElement) {
            chefNameElement.textContent = chefData.chef;
        }
        if (restaurantNameElement) {
            restaurantNameElement.textContent = chefData.name;
        }

        if (chefData.popup) {
            if (chefData.popup.chefTitleColor) {
                chefNameElement.style.color = chefData.popup.chefTitleColor;
            }
            if (chefData.popup.restaurantTitleColor) {
                restaurantNameElement.style.color = chefData.popup.restaurantTitleColor;
            }
        }

        const storyElement = document.getElementById('chef-popup-story');
        if (storyElement) {
            const rawStoryContent = chefData.popup && chefData.popup.chefBio ? chefData.popup.chefBio : 'No biography available.';
            const formattedStoryContent = formatChefStory(rawStoryContent);
            storyElement.innerHTML = formattedStoryContent;
        } else {
            console.error('Story element not found');
        }

        await this.initializeCarousel(chefData);
    }

    async initializeCarousel(chefData) {
        const swiperWrapper = document.querySelector('.chef-popup-swiper .swiper-wrapper');

        if (!swiperWrapper) {
            console.error('Swiper wrapper not found');
            return;
        }

        swiperWrapper.innerHTML = '';

        if (chefData.images && chefData.images.slides && chefData.images.slides.length > 0) {
            try {
                const { Swiper: SwiperClass, Navigation, EffectCards } = await loadSwiper();

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
                        320: { effect: 'cards', slidesPerView: 'auto' },
                        768: { effect: 'cards', slidesPerView: 'auto' },
                        1024: { effect: 'cards', slidesPerView: 'auto' },
                    }
                });
            } catch (error) {
                console.error('Failed to load Swiper:', error);
                swiperWrapper.innerHTML = `
                    <div class="text-center text-gray-600 p-4">
                        <p>Image carousel unavailable</p>
                    </div>
                `;
            }
        } else {
            const sliderContainer = document.getElementById('chef-popup-slider');
            if (sliderContainer) {
                sliderContainer.style.display = 'none';
            }
        }
    }

    hidePopup() {
        if (this.popup.classList.contains('hidden')) {
            return;
        }

        this.animatePopupHide(() => {
            this.popup.classList.add('hidden');
            unfreezeBodyScroll();

            const popupContainer = this.popup.querySelector('.chef-popup-container');
            const overlay = this.popup.querySelector('.chef-popup-overlay');
            if (popupContainer) {
                gsap.set(popupContainer, { clearProps: "all" });
            }
            if (overlay) {
                gsap.set(overlay, { clearProps: "all" });
            }

            if (this.swiper) {
                this.swiper.destroy(true, true);
                this.swiper = null;
            }

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

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
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
                const storyParagraphs = story.querySelectorAll('p');
                if (storyParagraphs.length > 0) {
                    gsap.set(storyParagraphs, { opacity: 1, y: 0 });
                }
            }
            if (slider) gsap.set(slider, { opacity: 1, y: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 1, y: 0 });
            return;
        }

        if (popupContainer) {
            gsap.set(popupContainer, { opacity: 0, scale: 0, rotationX: -15, borderRadius: '50%' });
        }
        if (overlay) {
            gsap.set(overlay, { opacity: 0 });
        }
        if (header) {
            gsap.set(header, { height: 0 });
        }
        if (headerImage) {
            gsap.set(headerImage, { opacity: 0, scale: 1.1, y: -30 });
        }
        if (content) {
            gsap.set(content, { height: 0 });
        }

        const contentElements = [slider, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) {
            gsap.set(contentElements, { opacity: 0, y: 20 });
        }

        if (story) {
            const storyParagraphs = story.querySelectorAll('p');
            if (storyParagraphs.length > 0) {
                gsap.set(storyParagraphs, { opacity: 0, y: -10 });
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

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return gsap.timeline();
        }

        const tl = gsap.timeline({ ease: "power2.out" });

        tl.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" })
        .to(popupContainer, { opacity: 1, scale: 1, rotationX: 0, borderRadius: '0%', duration: 0.6, ease: "power2.out" }, "<50%")
        .to(header, { height: 'auto', duration: 0.5, ease: "power2.out" }, "<20%")
        .to(headerImage, { opacity: 1, scale: 1.01, y: 0, duration: 0.8, ease: "power2.out" }, "<20%")
        .to(content, { height: 'auto', duration: 0.6, ease: "power2.out" }, "<20%")
        .to(story.querySelectorAll('p'), { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.08 }, "<40%")
        .to([slider, closeBtn], { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, "-=0.2");

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

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            gsap.set([popupContainer, overlay, header, headerImage, content, story, slider, closeBtn], { opacity: 0 });
            callback();
            return gsap.timeline();
        }

        const tl = gsap.timeline({ ease: "power2.in", onComplete: callback });

        tl.to([slider, closeBtn], { opacity: 0, y: -10, duration: 0.2, stagger: 0.03, ease: "power2.in" })
        .to(content, { height: 0, duration: 0.4, ease: "power2.out" }, "<30%")
        .to(header, { height: 0, duration: 0.4, ease: "power2.out" }, "<50%")
        .to(popupContainer, { opacity: 0, scale: 0.9, rotationX: 10, duration: 0.3, ease: "power2.out" }, "<10%")
        .to(overlay, { opacity: 0, duration: 0.2, ease: "power2.in" }, "<50%");

        return tl;
    }
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function convertToWebP(filename) {
    if (!filename) return filename;

    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;

    const nameWithoutExt = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex + 1).toLowerCase();

    if (extension === 'svg') {
        return filename;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        return `${nameWithoutExt}.webp`;
    }

    return filename;
}

function formatChefStory(content) {
    if (!content) return 'No biography available.';

    if (content.includes('<')) {
        return content;
    } else {
        const sentences = content
            .split(/(?<=[.!?])\s+/)
            .filter(sentence => sentence.trim().length > 0)
            .map(sentence => sentence.trim());

        if (sentences.length === 0) return 'No biography available.';

        return sentences.map(sentence => `<p>${sentence}</p>`).join('');
    }
}

// ─── Populate Chefs List ─────────────────────────────────────────────────────

function populateChefsList() {
    const chefsList = document.getElementById('chefs-list');
    if (!chefsList) {
        return;
    }

    chefsList.innerHTML = '';

    restaurants.forEach((restaurant, index) => {
        if (!restaurant.images || !restaurant.images.profile || !restaurant.images['profile-background']) {
            console.warn(`Missing image data for chef: ${restaurant.chef}`);
            return;
        }

        const chefElement = document.createElement('div');
        const alignmentClass = index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row';
        const textAlignmentClass = index % 2 === 0 ? 'md:text-right' : 'md:text-left';
        chefElement.className = `chef relative flex flex-col items-center md:flex-row ${alignmentClass}`;
        chefElement.setAttribute('data-chef', restaurant.id);

        const imageBasePath = '/images';
        const isDev = import.meta.env.DEV;

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

    setupChefsAnimations();
}

// ─── Restaurant Carousel System ──────────────────────────────────────────────

class RestaurantCarousel {
    constructor() {
        this.restaurants = [];
        this.currentIndex = 0;
        this.rotationInterval = null;
        this.rotationSpeed = 5000;
        this.carouselContainer = null;
        this.logoSprite = null;
        this.centralLogo = null;
        this.restaurantItems = [];
        this.totalRotation = 0;

        this.init();
    }

    init() {
        this.restaurants = restaurants;

        if (this.restaurants.length > 0) {
            this.createCarousel();
            this.addEventListeners();
        }
    }

    createCarousel() {
        this.carouselContainer = document.getElementById('carousel-container');
        this.logoDisplay = document.getElementById('logo-display');
        this.centralLogo = document.getElementById('central-logo');

        if (!this.carouselContainer || !this.logoDisplay) {
            console.error('Carousel elements not found');
            return;
        }

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

        this.carouselContainer.innerHTML = '';

        this.restaurants.forEach((restaurant, index) => {
            const item = this.createRestaurantItem(restaurant, index);
            this.carouselContainer.appendChild(item);
            this.restaurantItems.push(item);
        });

        this.preloadLogos();
        this.rotateToRestaurant(0);
        this.startRotation();
    }

    createRestaurantItem(restaurant, index) {
        const item = document.createElement('div');
        item.className = 'restaurant-item absolute rounded-full cursor-pointer transition-all duration-1000 ease-smooth';
        item.setAttribute('data-restaurant-id', restaurant.id);
        item.setAttribute('data-index', index);

        const angle = (index * 60) - 90;
        const radius = this.getCarouselRadius();
        const finalX = Math.cos(angle * Math.PI / 180) * radius;
        const finalY = Math.sin(angle * Math.PI / 180) * radius;

        item.style.left = `calc(50% + ${finalX}px)`;
        item.style.top = `calc(50% + ${finalY}px)`;
        item.style.transform = 'translate(-50%, -50%)';

        const img = document.createElement('img');
        const chefFolder = this.getChefFolder(restaurant.id);

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
        img.src = `${imageBasePath}/chefs/${chefFolder}/dish-280w.webp`;
        img.alt = restaurant.name;
        img.loading = 'eager';
        img.width = 220;
        img.height = 220;
        img.sizes = '(max-width: 420px) 105px, (max-width: 580px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 220px';
        img.className = 'w-full h-full object-contain transition-all duration-[1800ms] ease-smooth';

        img.onerror = () => {
            console.warn(`Failed to load image for ${restaurant.name}: ${img.src}`);
        };

        item.appendChild(img);

        item.addEventListener('click', () => {
            this.rotateToRestaurant(index);
            this.resetRotation();

            if (window.dishPopup && typeof window.dishPopup.showPopupWithURL === 'function') {
                window.dishPopup.showPopupWithURL(restaurant.id);
            } else {
                console.error('DishPopup not available or showPopupWithURL method not found');
            }
        });

        return item;
    }

    setActiveRestaurant(index) {
        this.restaurantItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });

        this.currentIndex = index;
        this.updateLogo(index);
    }

    preloadLogos() {
        this.logoElements = this.logoDisplay.querySelectorAll('.logo-element');
    }

    updateLogo(index) {
        if (!this.logoElements || this.logoElements.length === 0) return;

        const currentLogo = Array.from(this.logoElements).find(el => el.style.opacity === '1' || el.style.opacity === '');
        const nextLogo = this.logoElements[index];

        if (!currentLogo || !nextLogo || currentLogo === nextLogo) return;

        nextLogo.style.filter = 'blur(10px)';
        nextLogo.style.transform = 'scale(1.1)';
        nextLogo.style.zIndex = '2';

        const tl = gsap.timeline({
            onComplete: () => {
                currentLogo.style.zIndex = '1';
            }
        });

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
        }, 0);
    }

    getChefFolder(restaurantId) {
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
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        this.rotationInterval = setInterval(() => {
            this.nextRestaurant();
        }, this.rotationSpeed);
    }

    nextRestaurant() {
        this.totalRotation -= 60;
        this.currentIndex = (this.currentIndex + 1) % this.restaurants.length;

        gsap.to(this.carouselContainer, {
            rotation: this.totalRotation,
            duration: 1,
            ease: "power2.inOut",
            onUpdate: () => { this.updateCounterRotation(); },
            onComplete: () => { this.setActiveRestaurant(this.currentIndex); }
        });
    }

    rotateToRestaurant(index) {
        const rotationAngle = -index * 60;
        this.totalRotation = rotationAngle;

        gsap.to(this.carouselContainer, {
            rotation: this.totalRotation,
            duration: 0.8,
            ease: "power2.inOut",
            onUpdate: () => { this.updateCounterRotation(); },
            onComplete: () => { this.setActiveRestaurant(index); }
        });
    }

    resetRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        setTimeout(() => { this.startRotation(); }, 100);
    }

    addEventListeners() {
        this.carouselContainer.addEventListener('mouseenter', () => {
            if (this.rotationInterval) {
                clearInterval(this.rotationInterval);
                this.rotationInterval = null;
            }
        });

        this.carouselContainer.addEventListener('mouseleave', () => {
            this.startRotation();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.rotationInterval) {
                    clearInterval(this.rotationInterval);
                }
            } else {
                this.startRotation();
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => { this.repositionItems(); }, 250);
        });

        this.observeCSSVariables();
    }

    updateCounterRotation() {
        const currentRotation = gsap.getProperty(this.carouselContainer, "rotation") || this.totalRotation;

        this.restaurantItems.forEach((item, index) => {
            if (currentRotation !== 0) {
                const counterRotation = -currentRotation;
                item.style.transform = `translate(-50%, -50%) rotate(${counterRotation}deg)`;
            } else {
                item.style.transform = 'translate(-50%, -50%)';
            }
        });
    }

    getCarouselRadius() {
        const carouselElement = document.getElementById('restaurant-carousel');
        if (carouselElement) {
            const radiusValue = getComputedStyle(carouselElement).getPropertyValue('--carousel-radius');
            return parseInt(radiusValue.replace('px', '')) || 150;
        }
        return 150;
    }

    observeCSSVariables() {
        const carouselElement = document.getElementById('restaurant-carousel');
        if (!carouselElement) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    this.repositionItems();
                }
            });
        });

        observer.observe(carouselElement, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        const styleObserver = new MutationObserver(() => {
            this.repositionItems();
        });

        styleObserver.observe(document.head, {
            childList: true,
            subtree: true
        });
    }

    repositionItems() {
        const currentRotation = gsap.getProperty(this.carouselContainer, "rotation") || this.totalRotation;

        this.restaurantItems.forEach((item, index) => {
            const angle = (index * 60) - 90;
            const radius = this.getCarouselRadius();
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            item.style.left = `calc(50% + ${x}px)`;
            item.style.top = `calc(50% + ${y}px)`;

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
        }
    }

    resume() {
        if (!this.rotationInterval) {
            this.startRotation();
        }
    }

    updateSize() {
        this.repositionItems();
    }

    destroy() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }

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

// ─── Dish Popup System ───────────────────────────────────────────────────────

class DishPopup {
    constructor() {
        this.popup = document.getElementById('dish-popup');
        this.closeBtn = document.getElementById('dish-popup-close-container');
        this.overlay = document.querySelector('.dish-popup-overlay');
        this.currentRestaurant = null;

        if (!this.popup || !this.closeBtn || !this.overlay) {
            return;
        }

        this.init();
    }

    init() {
        this.closeBtn.addEventListener('click', () => this.hidePopupWithURL());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hidePopupWithURL();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.popup && !this.popup.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.hidePopupWithURL();
                }
            }
        });
    }

    showPopupWithURL(restaurantId) {
        if (window.popupRouter && typeof window.popupRouter.showRestaurantPopup === 'function') {
            const restaurant = restaurants.find(r => r.id === restaurantId);
            if (restaurant) {
                const restaurantName = restaurant.name.toLowerCase().replace(/\s+/g, '-');
                window.popupRouter.showRestaurantPopup(restaurantName);
            } else {
                console.error('Restaurant not found for ID:', restaurantId);
                this.showPopup(restaurantId);
            }
        } else {
            this.showPopup(restaurantId);
        }
    }

    hidePopupWithURL() {
        if (window.popupRouter && typeof window.popupRouter.closeCurrentPopup === 'function') {
            window.popupRouter.closeCurrentPopup();
        } else {
            this.hidePopup();
        }
    }

    async showPopup(restaurantId) {
        try {
            if (!this.popup.classList.contains('hidden')) {
                console.log('Popup already open, closing first');
                this.hidePopup();
                setTimeout(() => { this.showPopup(restaurantId); }, 400);
                return;
            }

            const restaurantData = restaurants.find(restaurant => restaurant.id === restaurantId);
            if (!restaurantData) {
                console.error('Restaurant not found:', restaurantId);
                return;
            }

            this.currentRestaurant = restaurantData;
            this.populatePopup(restaurantData);

            this.setInitialAnimationStates();

            this.popup.classList.remove('hidden');
            this.popup.classList.add('grid', 'place-items-center');
            freezeBodyScroll();

            this.animatePopupShow();

        } catch (error) {
            console.error('Error showing dish popup:', error);
            this.popup.classList.add('hidden');
            unfreezeBodyScroll();
        }
    }

    populatePopup(restaurantData) {
        const logoElement = document.getElementById('dish-popup-logo');
        if (logoElement && restaurantData.images?.logo) {
            const logoBasePath = `/images/${restaurantData.images.logo.replace(/\/[^/]+$/, '')}`;
            logoElement.src = `${logoBasePath}/logo.webp`;
            logoElement.srcset = `${logoBasePath}/logo-176.webp 176w, ${logoBasePath}/logo.webp 256w`;
            logoElement.sizes = '(max-width: 768px) 64px, 96px';
            logoElement.alt = restaurantData.name;
        }

        const chefNameElement = document.getElementById('dish-popup-chef');
        const restaurantNameElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        if (chefNameElement) chefNameElement.textContent = restaurantData.chef;
        if (restaurantNameElement) restaurantNameElement.textContent = restaurantData.name;
        if (locationElement) {
            locationElement.textContent = restaurantData.area || restaurantData.address.split(',')[restaurantData.address.split(',').length - 1].trim();
        }

        const menuNameElement = document.getElementById('dish-popup-menu-name');
        const activeMenu = getActiveMenu(restaurantData);

        if (menuNameElement) {
            menuNameElement.textContent = activeMenu?.menuName || 'Special Menu';
            if (activeMenu?.menuNameColor && activeMenu.menuNameColor.trim() !== '') {
                menuNameElement.classList.remove('text-teal-800', 'text-gray-800', 'text-black');
                menuNameElement.style.setProperty('color', activeMenu.menuNameColor);
            }
        }

        const dishPopupHeaderImage = document.getElementById('dish-popup-header-image');
        if (dishPopupHeaderImage && restaurantData.images && restaurantData.images['restaurant-popup-header']) {
            const restaurantHeader = restaurantData.images['restaurant-popup-header'];

            if (typeof restaurantHeader === 'object' && restaurantHeader.headerStyle) {
                const headerStyle = restaurantHeader.headerStyle;
                if (headerStyle.background) dishPopupHeaderImage.style.background = headerStyle.background;
                if (headerStyle.height) dishPopupHeaderImage.style.height = headerStyle.height;
                const imgElement = dishPopupHeaderImage.querySelector('img');
                if (imgElement) imgElement.style.display = 'none';
            } else if (typeof restaurantHeader === 'string') {
                const isDev = import.meta.env.DEV;
                const imagePath = isDev ? `/images/${restaurantHeader}` : `/images/${convertToWebP(restaurantHeader)}`;
                const imgElement = dishPopupHeaderImage.querySelector('img');
                if (imgElement) {
                    imgElement.src = imagePath;
                    imgElement.alt = `${restaurantData.name} - Restaurant Header`;
                    imgElement.style.display = 'block';
                }
                dishPopupHeaderImage.style.background = '';
                dishPopupHeaderImage.style.height = '';
            }
        }

        const menuImageElement = document.getElementById('dish-popup-menu-image');
        if (menuImageElement && activeMenu?.menuImage) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${activeMenu.menuImage}` : `/images/${convertToWebP(activeMenu.menuImage)}`;
            menuImageElement.src = imagePath;
            menuImageElement.alt = `${restaurantData.name} - ${activeMenu.menuName || 'Special Menu'}`;
        } else if (menuImageElement && restaurantData.images && restaurantData.images.dish) {
            const isDev = import.meta.env.DEV;
            const imagePath = isDev ? `/images/${restaurantData.images.dish}` : `/images/${convertToWebP(restaurantData.images.dish)}`;
            menuImageElement.src = imagePath;
            menuImageElement.alt = `${restaurantData.name} - Special Menu`;
        }

        this.updateMenuContent(restaurantData);

        const reservationBtn = document.getElementById('dish-popup-reservation');
        if (reservationBtn && restaurantData.reservation) {
            reservationBtn.href = restaurantData.reservation;
            reservationBtn.target = '_blank';
        } else if (reservationBtn && restaurantData.website) {
            reservationBtn.href = restaurantData.website;
            reservationBtn.target = '_blank';
        }

        this.updateReserveTableShapeColor(restaurantData);
        this.updateMenuPriceAndColor(restaurantData);
    }

    updateMenuContent(restaurantData) {
        const menuContent = document.getElementById('dish-popup-menu-content');
        if (!menuContent) return;

        const activeMenu = getActiveMenu(restaurantData);

        if (activeMenu?.content) {
            menuContent.innerHTML = activeMenu.content;
        } else {
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
        const reservationBtn = document.getElementById('dish-popup-reservation');
        if (!reservationBtn) return;

        const shapeColor = restaurantData.popup?.reserveTableShapeColor || '#1E2A78';
        const hoverColor = restaurantData.popup?.reservationLinkFillHover || '#4A5BC7';

        reservationBtn.style.setProperty('--reservation-link-fill', shapeColor);
        reservationBtn.style.setProperty('--reservation-link-fill-hover', hoverColor);
    }

    updateMenuPriceAndColor(restaurantData) {
        const menuPriceContainer = document.getElementById('menu-price-container');
        if (!menuPriceContainer) return;

        const menuPriceElement = document.getElementById('menu-price');
        const menuPriceShape = menuPriceContainer.querySelector('svg path');

        if (!menuPriceElement || !menuPriceShape) return;

        const menuPrice = getActiveMenuPrice(restaurantData);
        const menuPriceColor = restaurantData.popup?.menuPriceColor || '#1E2A78';

        const formattedPrice = this.formatPriceWithDollarSigns(menuPrice);
        menuPriceElement.innerHTML = formattedPrice;
        menuPriceShape.setAttribute('fill', menuPriceColor);
    }

    formatPriceWithDollarSigns(priceString) {
        if (!priceString || priceString === 'Price') {
            return 'Price';
        }

        if (priceString.includes('&')) {
            const prices = priceString.split('&').map(price => price.trim());
            return prices.map(price => `<span class="price-currency md:text-3xl text-2xl">$</span><span class="price-value md:text-4xl text-3xl -top-1 relative">${price}</span>`).join(' & ');
        } else {
            return `<span class="price-currency md:text-3xl text-2xl">$</span><span class="price-value md:text-4xl text-3xl -top-1 relative">${priceString}</span>`;
        }
    }

    hidePopup() {
        if (this.popup.classList.contains('hidden')) {
            return;
        }

        this.animatePopupHide(() => {
            this.popup.classList.add('hidden');
            this.popup.classList.remove('grid', 'place-items-center');
            unfreezeBodyScroll();

            const popupContainer = this.popup.querySelector('.dish-popup-container');
            const overlay = this.popup.querySelector('.dish-popup-overlay');
            if (popupContainer) gsap.set(popupContainer, { clearProps: "all" });
            if (overlay) gsap.set(overlay, { clearProps: "all" });
        });
    }

    setInitialAnimationStates() {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        const logoElement = document.getElementById('dish-popup-logo');
        const chefElement = document.getElementById('dish-popup-chef');
        const restaurantElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            gsap.set([overlay, popupContainer], { opacity: 1, scale: 1, y: 0 });
            if (header) gsap.set(header, { opacity: 1, y: 0 });
            if (content) gsap.set(content, { opacity: 1, y: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 1, y: 0 });

            const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
            if (popupElements.length > 0) gsap.set(popupElements, { opacity: 1, y: 0, scale: 1 });
            return;
        }

        if (popupContainer) gsap.set(popupContainer, { opacity: 0, scale: 0.8, y: -50 });
        if (overlay) gsap.set(overlay, { opacity: 0 });

        const contentElements = [header, content, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) gsap.set(contentElements, { opacity: 0, y: 20 });

        const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
        if (popupElements.length > 0) gsap.set(popupElements, { opacity: 0, y: 10, scale: 0.9 });
    }

    animatePopupShow() {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        const logoElement = document.getElementById('dish-popup-logo');
        const chefElement = document.getElementById('dish-popup-chef');
        const restaurantElement = document.getElementById('dish-popup-restaurant');
        const locationElement = document.getElementById('dish-popup-location');

        if (!popupContainer || !overlay) {
            console.error('DishPopup: Required animation elements not found');
            return gsap.timeline();
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return gsap.timeline();

        const tl = gsap.timeline({ ease: "power2.out" });

        tl.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.inOut" })
        .to(popupContainer, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power2.out" }, "<70%");

        const contentElements = [header, content, closeBtn].filter(el => el !== null);
        if (contentElements.length > 0) {
            tl.to(contentElements, { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, "<10%");
        }

        const popupElements = [logoElement, chefElement, restaurantElement, locationElement].filter(el => el !== null);
        if (popupElements.length > 0) {
            tl.to(popupElements, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "<20%");
        }

        return tl;
    }

    animatePopupHide(callback) {
        const popupContainer = this.popup.querySelector('.dish-popup-container');
        const overlay = this.popup.querySelector('.dish-popup-overlay');
        const header = this.popup.querySelector('.dish-popup-header');
        const content = this.popup.querySelector('.dish-popup-content');
        const closeBtn = this.popup.querySelector('#dish-popup-close-container');

        if (!popupContainer || !overlay) {
            console.error('DishPopup: Required animation elements not found for hide');
            if (callback) callback();
            return gsap.timeline();
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            gsap.set([popupContainer, overlay], { opacity: 0 });
            if (header) gsap.set(header, { opacity: 0 });
            if (content) gsap.set(content, { opacity: 0 });
            if (closeBtn) gsap.set(closeBtn, { opacity: 0 });
            if (callback) callback();
            return gsap.timeline();
        }

        const tl = gsap.timeline({ ease: "power2.out", onComplete: callback });

        const contentElements = [header, content, closeBtn].filter(el => el !== null);

        if (contentElements.length > 0) {
            tl.to(contentElements, { opacity: 0, y: -20, duration: 0.3, stagger: 0.05, ease: "power1.inOut" });
        }

        tl.to(popupContainer, { opacity: 0, scale: 0.9, y: 30, duration: 0.4, ease: "power1.inOut" }, "-=0.1")
        .to(overlay, { opacity: 0, duration: 0.3, ease: "power1.inOut" }, "-=0.2");

        return tl;
    }
}

// ─── Index Page Initialization ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Ensure data is loaded (idempotent — shared.js may have already loaded it)
    getRestaurantData();

    if (restaurants.length > 0) {
        populateChefsList();

        if (document.getElementById('chef-popup')) {
            window.chefPopup = new ChefPopup();
        }

        if (document.getElementById('dish-popup')) {
            window.dishPopup = new DishPopup();
        }

        if (document.getElementById('restaurant-carousel')) {
            window.restaurantCarousel = new RestaurantCarousel();
        }

        if (window.chefPopup || window.dishPopup) {
            window.popupRouter = new PopupRouter();
        }
    } else {
        console.error('Restaurants data not available for index page initialization');
    }
});
