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
declare function createPostCard(post: BlogPost): string;
declare function renderBlogPosts(): void;
export type { BlogPost };
export { blogPosts, createPostCard, renderBlogPosts };
