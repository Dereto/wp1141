// Using global variables from data.js
// @ts-ignore: getPostBySlug and formatDate are provided globally by data.js
declare const getPostBySlug: (slug: string) => any;
// @ts-ignore: getPostBySlug and formatDate are provided globally by data.js
declare const formatDate: (dateString: string) => string;

function getSlugFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

function loadPost(): void {
    const slug = getSlugFromURL();
    
    if (!slug) {
        // Redirect to home if no slug provided
        window.location.href = 'index.html';
        return;
    }
    
    const post = getPostBySlug(slug);
    
    if (!post) {
        // Show 404 message if post not found
        document.getElementById('post-heading')!.textContent = 'Post Not Found';
        document.getElementById('post-body')!.innerHTML = '<p>The requested post could not be found.</p>';
        document.title = 'Post Not Found - Blog';
        return;
    }
    
    // Update page title
    document.title = `${post.title} - Blog`;
    
    // Update post content
    document.getElementById('post-title')!.textContent = post.title;
    document.getElementById('post-heading')!.textContent = post.title;
    document.getElementById('post-date')!.textContent = formatDate(post.date);
    document.getElementById('post-read-time')!.textContent = post.readTime;
    document.getElementById('post-body')!.innerHTML = post.content;
    
    // Update tags
    const tagsContainer = document.getElementById('post-tags')!;
    tagsContainer.innerHTML = post.tags.map(tag => 
        `<a href="#tag-${tag.toLowerCase()}" class="post-tag-large">${tag}</a>`
    ).join('');
}

// Theme toggle functionality for post page
function addPostThemeToggle(): void {
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

// Initialize the post page
function initPost(): void {
    loadPost();
    addPostThemeToggle();
    setupPostAgdaLinks();
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initPost);

// Agda link functionality for post page
function setupPostAgdaLinks(): void {
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
(window as any).loadPost = loadPost;
(window as any).setupPostAgdaLinks = setupPostAgdaLinks;
