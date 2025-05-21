// main.js
// Placeholder for Smart Mic AI landing page interactivity
// Add modal, form, or navigation logic here as needed. 

// Smart Mic AI Landing Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Set up parallax effect
    const handleScroll = () => {
        const scroll = window.pageYOffset;
        document.documentElement.style.setProperty('--scroll', scroll);
        
        // Apply direct transforms for better performance
        const desktop = document.querySelector('.device.desktop');
        const mobile = document.querySelector('.device.mobile');
        
        if (desktop) {
            desktop.style.transform = `perspective(1000px) rotateY(-5deg) translateX(-20px) translateY(${scroll * 0.1}px)`;
        }
        if (mobile) {
            mobile.style.transform = `perspective(1000px) rotateY(5deg) translateX(-100px) translateY(${40 + scroll * 0.15}px)`;
        }
    };

    // Add scroll event listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Add animation delay to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.setProperty('--card-index', index);
    });

    // Smooth scroll for navigation links and scroll cue
    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Add click handlers for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            handleSmoothScroll(e, anchor.getAttribute('href'));
        });
    });

    // Add click handler for scroll cue
    const scrollCue = document.querySelector('.scroll-cue');
    if (scrollCue) {
        scrollCue.addEventListener('click', (e) => {
            handleSmoothScroll(e, '#features');
        });
    }

    // Loading Screen and Animations
    const loadingScreen = document.querySelector('.loading-screen');
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Hide loading screen after a minimum display time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');
        
        // Show fade-in elements
        fadeElements.forEach(element => {
            element.classList.add('visible');
        });
    }, 1500); // Minimum loading time of 1.5 seconds
});

// Mobile Menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuLinks = mobileMenu.querySelectorAll('a');

function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking a link
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        toggleMobileMenu();
    });
});

// Close mobile menu when clicking outside
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
        toggleMobileMenu();
    }
});

// Scroll to Top Button
const scrollTopBtn = document.querySelector('.scroll-top');

function toggleScrollTop() {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

window.addEventListener('scroll', toggleScrollTop, { passive: true });

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
const newsletterInput = newsletterForm?.querySelector('input[type="email"]');

if (newsletterForm && newsletterInput) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add loading state
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        
        // Simulate API call (replace with actual API endpoint)
        setTimeout(() => {
            // Reset form
            newsletterForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Show success message (you can customize this)
            alert('Thanks for subscribing! We\'ll keep you updated.');
        }, 1000);
    });
} 