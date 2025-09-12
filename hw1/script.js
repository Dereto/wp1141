// JavaScript for Homepage Interactive Features

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contact-form');
const header = document.querySelector('.header');

// Navigation functionality
class Navigation {
    constructor() {
        this.navItems = [];
        this.currentSection = 'home';
        this.initializeNavItems();
        this.setupEventListeners();
        this.setupScrollSpy();
    }

    initializeNavItems() {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    this.navItems.push({
                        element: link.parentElement,
                        link: link,
                        section: section
                    });
                }
            }
        });
    }

    setupEventListeners() {
        // Mobile menu toggle
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    this.scrollToSection(targetId.substring(1));
                    this.closeMobileMenu();
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    setupScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNavItem(entry.target.id);
                }
            });
        }, observerOptions);

        this.navItems.forEach(item => {
            observer.observe(item.section);
        });
    }

    toggleMobileMenu() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }

    closeMobileMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = header.offsetHeight;
            const sectionTop = section.offsetTop - headerHeight;
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }

    updateActiveNavItem(sectionId) {
        this.currentSection = sectionId;
        
        // Remove active class from all nav items
        this.navItems.forEach(item => {
            item.link.classList.remove('active');
        });

        // Add active class to current nav item
        const currentNavItem = this.navItems.find(item => 
            item.section.id === sectionId
        );
        
        if (currentNavItem) {
            currentNavItem.link.classList.add('active');
        }
    }
}

// Header scroll effect
class HeaderScrollEffect {
    constructor() {
        this.lastScrollY = 0;
        this.ticking = false;
        this.setupScrollListener();
    }

    setupScrollListener() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });
    }

    updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        this.lastScrollY = currentScrollY;
    }
}

// Contact form handling
class ContactForm {
    constructor(form) {
        this.form = form;
        this.submitButton = form.querySelector('button[type="submit"]');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        field.style.borderColor = '#e2e8f0';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (!isValid) {
            field.style.borderColor = '#ef4444';
            this.showFieldError(field, errorMessage);
        } else {
            this.hideFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error message
        this.hideFieldError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;

        field.parentElement.appendChild(errorDiv);
    }

    hideFieldError(field) {
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit() {
        const formData = this.getFormData();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }

        // Show loading state
        this.setSubmitButtonLoading(true);

        try {
            // Simulate form submission (replace with actual API call)
            await this.simulateFormSubmission(formData);
            this.showNotification('Message sent successfully!', 'success');
            this.form.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            this.setSubmitButtonLoading(false);
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        return {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
    }

    async simulateFormSubmission(data) {
        // Simulate API delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) {
                    console.log('Form submitted:', data);
                    resolve();
                } else {
                    reject(new Error('Simulated network error'));
                }
            }, 1500);
        });
    }

    setSubmitButtonLoading(loading) {
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Sending...';
            this.submitButton.style.opacity = '0.7';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Send Message';
            this.submitButton.style.opacity = '1';
        }
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Animation utilities
class AnimationUtils {
    static fadeInOnScroll() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        const animateElements = document.querySelectorAll('.project-card, .about-text, .contact-info');
        animateElements.forEach(el => observer.observe(el));
    }

    static addHoverEffects() {
        // Add hover effects to buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });
    }
}

// Typing animation for hero title
class TypingAnimation {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
    }

    start() {
        this.element.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < this.text.length) {
                this.element.textContent += this.text.charAt(i);
                i++;
                setTimeout(typeWriter, this.speed);
            }
        };

        typeWriter();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    new Navigation();
    
    // Initialize header scroll effect
    new HeaderScrollEffect();
    
    // Initialize contact form
    if (contactForm) {
        new ContactForm(contactForm);
    }
    
    // Initialize animations
    AnimationUtils.fadeInOnScroll();
    AnimationUtils.addHoverEffects();
    
    // Initialize typing animation for hero title (optional)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent || '';
        // Uncomment the following lines to enable typing animation
        // const typingAnimation = new TypingAnimation(heroTitle, originalText, 50);
        // setTimeout(() => typingAnimation.start(), 1000);
    }
    
    console.log('Homepage initialized successfully!');
});