// Shared script — loaded on every page via Layout.astro
// Contains: GSAP, nav, hero texture, restaurant data helpers, dropdown

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Re-export for index-page.js
export { gsap, ScrollTrigger };

// Body scroll freeze utilities
let scrollPosition = 0;

export function freezeBodyScroll() {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
}

export function unfreezeBodyScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosition);
}

// Restaurant data
export let restaurants = [];

export function getRestaurantData() {
    if (restaurants.length === 0) {
        restaurants = window.__RESTAURANTS__ || [];
        console.log('Restaurant data loaded from global:', restaurants.length, 'restaurants');
    }
    return restaurants;
}

// Legacy async wrapper for compatibility (now synchronous)
export async function loadRestaurantData() {
    return getRestaurantData();
}

// Get active season from global (injected at build time)
export function getActiveSeason() {
    return window.__ACTIVE_SEASON__ || null;
}

// Get the active menu for a restaurant (seasonal or default)
export function getActiveMenu(restaurantData) {
    const activeSeason = getActiveSeason();
    if (activeSeason && restaurantData.popup?.seasonalMenus?.[activeSeason]) {
        return restaurantData.popup.seasonalMenus[activeSeason];
    }
    return restaurantData.popup?.menu || null;
}

// Get menu price - check seasonal menu first, then popup level
export function getActiveMenuPrice(restaurantData) {
    const activeMenu = getActiveMenu(restaurantData);
    if (activeMenu?.menuPrice) {
        return activeMenu.menuPrice;
    }
    return restaurantData.popup?.menuPrice || 'Price';
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

    init() {
        this.restaurants = restaurants;
        if (this.restaurants.length > 0) {
            this.addEventListeners();
        }
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
                e.stopPropagation();
                this.toggleMobileDropdown();
            });
        }

        // Mobile dropdown links
        const mobileLinks = document.querySelectorAll('.mobile-restaurant-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const restaurantId = link.getAttribute('data-restaurant-id');
                this.showRestaurantCard(restaurantId);
                this.closeMobileDropdown();
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

        const tl = gsap.timeline();

        tl.to(dropdown, {
            opacity: 1,
            maxHeight: "500px",
            duration: 0.8,
            ease: "power2.inOut"
        });

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
        }, "<50%");
    }

    closeMobileDropdown() {
        const dropdown = this.mobileDropdown;
        const toggle = this.mobileToggle;
        const arrow = toggle.querySelector('svg');

        if (dropdown && !dropdown.classList.contains('hidden')) {
            const tl = gsap.timeline({
                onComplete: () => {
                    dropdown.classList.add('hidden');
                    this.isMobileOpen = false;
                }
            });

            const links = dropdown.querySelectorAll('.mobile-restaurant-link');
            tl.to(links, {
                opacity: 0,
                x: 20,
                duration: 0.2,
                stagger: 0.03,
                ease: "power2.in"
            });

            tl.to(dropdown, {
                opacity: 0,
                y: -10,
                maxHeight: "0px",
                duration: 0.3,
                ease: "power2.in"
            }, "<80%");

            arrow.style.transform = 'rotate(0deg)';
        }
    }

    animateDesktopDropdownOpen() {
        const desktopLinks = document.querySelectorAll('.restaurant-dropdown-link');
        gsap.set(desktopLinks, {
            opacity: 0,
            x: -20,
            scale: 0.95
        });

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
        const restaurant = this.restaurants.find(r => r.id === restaurantId);
        if (!restaurant) {
            console.error('Restaurant not found:', restaurantId);
            return;
        }

        if (window.dishPopup && typeof window.dishPopup.showPopupWithURL === 'function') {
            window.dishPopup.showPopupWithURL(restaurantId);
        } else {
            console.error('DishPopup not available');
        }

        const restaurantsSection = document.getElementById('restaurants');
        if (restaurantsSection) {
            restaurantsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Shared initialization — runs on every page
document.addEventListener('DOMContentLoaded', async function() {
    await loadRestaurantData();

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
                navToggle.style.transform = 'translateX(100px)';
                navToggle.style.opacity = '0';

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

                    gsap.fromTo(mobileNavLinks, {
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

                    freezeBodyScroll();
                }, 100);
            }
        });

        function closeMobileMenu() {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('-translate-x-full');

            unfreezeBodyScroll();

            setTimeout(() => {
                navToggle.style.transform = 'translateX(0)';
                navToggle.style.opacity = '1';
            }, 150);

            setInitialAnimationStates();
        }

        const mobileCloseBtnEl = document.getElementById('mobile-close-btn');
        if (mobileCloseBtnEl) {
            mobileCloseBtnEl.addEventListener('click', closeMobileMenu);
        }

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            if (!link.closest('.mobile-restaurants-dropdown')) {
                link.addEventListener('click', closeMobileMenu);
            }
        });

        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('translate-x-0') &&
                !navToggle.contains(e.target) &&
                !mobileMenu.contains(e.target) &&
                !e.target.closest('.mobile-restaurants-dropdown')) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('translate-x-0')) {
                closeMobileMenu();
            }
        });
    } else {
        console.error('Mobile navigation elements not found!');
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"], .mobile-nav-link[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {

            const href = this.getAttribute('href');
            // Skip bare "#" links
            if (!href || href === '#') {
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize restaurant dropdown (works on all pages with nav)
    if (restaurants.length > 0) {
        window.restaurantDropdown = new RestaurantDropdown();
    }
});
