interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    tags: string[];
    slug: string;
}
declare const blogPosts: BlogPost[];
declare const postsGrid: HTMLElement;
declare const navLinks: NodeListOf<HTMLAnchorElement>;
declare function formatDate(dateString: string): string;
declare function createPostCard(post: BlogPost): string;
declare function renderBlogPosts(): void;
declare function handleNavigation(): void;
declare function handleSmoothScrolling(): void;
declare function updateActiveNavLink(): void;
declare function addSearchFunctionality(): void;
declare function addThemeToggle(): void;
declare function init(): void;
declare global {
    interface Window {
        BlogPost: typeof BlogPost;
        blogPosts: typeof blogPosts;
        createPostCard: typeof createPostCard;
        renderBlogPosts: typeof renderBlogPosts;
    }
}
