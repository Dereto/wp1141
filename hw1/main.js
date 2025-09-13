"use strict";
// Utility functions (formatDate is now declared globally from data.js)
// DOM elements
const postsGrid = document.getElementById('posts-grid');
const navLinks = document.querySelectorAll('.nav-link');
// Utility functions (formatDate is imported from data.ts)
function createPostCard(post) {
    return `
        <article class="post-card">
            <h3 class="post-title">
                <a href="post.html?slug=${post.slug}">${post.title}</a>
            </h3>
            <div class="post-meta">
                <span>${formatDate(post.date)}</span>
                <span>•</span>
                <span>${post.readTime}</span>
            </div>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<a href="#tag-${tag.toLowerCase()}" class="post-tag">${tag}</a>`).join('')}
            </div>
        </article>
    `;
}
function renderBlogPosts() {
    if (!postsGrid)
        return;
    const postsHTML = blogPosts.map(createPostCard).join('');
    postsGrid.innerHTML = postsHTML;
}
// Navigation functionality
function handleNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            // Get target section
            const targetId = link.getAttribute('href')?.substring(1);
            const targetSection = document.getElementById(targetId || '');
            if (targetSection) {
                const headerHeight = 80;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
// Smooth scrolling for anchor links
function handleSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href')?.substring(1);
            const targetElement = document.getElementById(targetId || '');
            if (targetElement) {
                const headerHeight = 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}
// Search functionality
function addSearchFunctionality() {
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search posts...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = `
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        margin-bottom: 2rem;
        font-size: 1rem;
        background-color: #fff;
        color: #333;
    `;
    // Insert search input before posts grid
    if (postsGrid && postsGrid.parentNode) {
        postsGrid.parentNode.insertBefore(searchInput, postsGrid);
    }
    // Add search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPosts = blogPosts.filter(post => post.title.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        const filteredHTML = filteredPosts.map(createPostCard).join('');
        if (postsGrid) {
            postsGrid.innerHTML = filteredHTML || '<p style="text-align: center; color: #666; padding: 2rem;">No posts found matching your search.</p>';
        }
    });
}
// Theme toggle functionality
function addThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.textContent = '🌙';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: none;
        border: 1px solid #e5e5e5;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 1.2rem;
        z-index: 1001;
        transition: all 0.2s ease;
        background-color: #fff;
    `;
    document.body.appendChild(themeToggle);
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.textContent = '☀️';
        themeToggle.style.backgroundColor = '#2a2a2a';
        themeToggle.style.borderColor = '#555';
        themeToggle.style.color = '#e5e5e5';
    }
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.style.backgroundColor = newTheme === 'dark' ? '#2a2a2a' : '#fff';
        themeToggle.style.borderColor = newTheme === 'dark' ? '#555' : '#e5e5e5';
        themeToggle.style.color = newTheme === 'dark' ? '#e5e5e5' : '#333';
    });
}
// Initialize the application
function init() {
    // Render blog posts
    renderBlogPosts();
    // Set up navigation
    handleNavigation();
    // Set up smooth scrolling
    handleSmoothScrolling();
    // Add scroll listener for active nav link
    window.addEventListener('scroll', updateActiveNavLink);
    // Add search functionality
    addSearchFunctionality();
    // Add theme toggle
    addThemeToggle();
    // Set up Agda links
    setupAgdaLinks();
    // Set initial active nav link
    updateActiveNavLink();
}
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', init);
// Agda link functionality
function setupAgdaLinks() {
    const agdaLinks = document.querySelectorAll('.agda-link');
    agdaLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Get target section
            const targetId = link.getAttribute('href')?.substring(1);
            const targetSection = document.getElementById(targetId || '');
            if (targetSection) {
                const headerHeight = 80;
                const targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                // Highlight the target code block briefly
                targetSection.classList.add('highlight');
                setTimeout(() => {
                    targetSection.classList.remove('highlight');
                }, 2000);
            }
        });
    });
}
// Make functions available globally for debugging
window.blogPosts = blogPosts;
window.createPostCard = createPostCard;
window.renderBlogPosts = renderBlogPosts;
window.setupAgdaLinks = setupAgdaLinks;
//# sourceMappingURL=main.js.map