function getSlugFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}
function loadPost() {
    var slug = getSlugFromURL();
    if (!slug) {
        // Redirect to home if no slug provided
        window.location.href = 'index.html';
        return;
    }
    var post = getPostBySlug(slug);
    if (!post) {
        // Show 404 message if post not found
        document.getElementById('post-heading').textContent = 'Post Not Found';
        document.getElementById('post-body').innerHTML = '<p>The requested post could not be found.</p>';
        document.title = 'Post Not Found - Blog';
        return;
    }
    // Update page title
    document.title = "".concat(post.title, " - Blog");
    // Update post content
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-heading').textContent = post.title;
    document.getElementById('post-date').textContent = formatDate(post.date);
    document.getElementById('post-read-time').textContent = post.readTime;
    document.getElementById('post-body').innerHTML = post.content;
    // Update tags
    var tagsContainer = document.getElementById('post-tags');
    tagsContainer.innerHTML = post.tags.map(function (tag) {
        return "<a href=\"#tag-".concat(tag.toLowerCase(), "\" class=\"post-tag-large\">").concat(tag, "</a>");
    }).join('');
}
// Theme toggle functionality for post page
function addPostThemeToggle() {
    var themeToggle = document.createElement('button');
    themeToggle.textContent = '🌙';
    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = "\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: none;\n        border: 1px solid #e5e5e5;\n        border-radius: 50%;\n        width: 40px;\n        height: 40px;\n        cursor: pointer;\n        font-size: 1.2rem;\n        z-index: 1001;\n        transition: all 0.2s ease;\n        background-color: #fff;\n    ";
    document.body.appendChild(themeToggle);
    // Check for saved theme preference or default to light mode
    var currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.textContent = '☀️';
        themeToggle.style.backgroundColor = '#2a2a2a';
        themeToggle.style.borderColor = '#555';
        themeToggle.style.color = '#e5e5e5';
    }
    themeToggle.addEventListener('click', function () {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.style.backgroundColor = newTheme === 'dark' ? '#2a2a2a' : '#fff';
        themeToggle.style.borderColor = newTheme === 'dark' ? '#555' : '#e5e5e5';
        themeToggle.style.color = newTheme === 'dark' ? '#e5e5e5' : '#333';
    });
}
// Initialize the post page
function initPost() {
    loadPost();
    addPostThemeToggle();
    setupPostAgdaLinks();
}
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initPost);
// Agda link functionality for post page
function setupPostAgdaLinks() {
    var agdaLinks = document.querySelectorAll('.agda-link');
    agdaLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var _a;
            e.preventDefault();
            // Get target section
            var targetId = (_a = link.getAttribute('href')) === null || _a === void 0 ? void 0 : _a.substring(1);
            var targetSection = document.getElementById(targetId || '');
            if (targetSection) {
                var headerHeight = 80;
                var targetPosition = targetSection.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                // Highlight the target code block briefly
                targetSection.classList.add('highlight');
                setTimeout(function () {
                    targetSection.classList.remove('highlight');
                }, 2000);
            }
        });
    });
}
// Make functions available globally for debugging
window.loadPost = loadPost;
window.setupPostAgdaLinks = setupPostAgdaLinks;
