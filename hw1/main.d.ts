interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    readTime: string;
    tags: string[];
    slug: string;
}
declare const blogPosts: BlogPost[];
declare const formatDate: (dateString: string) => string;
declare const getPostBySlug: (slug: string) => BlogPost | undefined;
declare const postsGrid: HTMLElement;
declare const navLinks: NodeListOf<HTMLAnchorElement>;
declare function createPostCard(post: BlogPost): string;
declare function renderBlogPosts(): void;
declare function handleNavigation(): void;
declare function handleSmoothScrolling(): void;
declare function updateActiveNavLink(): void;
declare function addSearchFunctionality(): void;
declare function addThemeToggle(): void;
declare function init(): void;
declare function setupAgdaLinks(): void;
