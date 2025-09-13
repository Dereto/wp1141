# Blog Homepage - TypeScript Implementation

A clean and concise blog homepage built with HTML, CSS, and TypeScript, inspired by minimalist design principles.

## Files Structure

- `index.html` - Main blog homepage
- `post.html` - Individual post page template
- `styles.css` - CSS styling with responsive design and dark mode support
- `data.js` - Shared blog post data and utility functions
- `main.ts` - TypeScript source code for homepage functionality
- `post.ts` - TypeScript source code for individual post pages
- `main.js` - Compiled JavaScript for homepage (generated from TypeScript)
- `post.js` - Compiled JavaScript for post pages (generated from TypeScript)
- `tsconfig.json` - TypeScript configuration

## TypeScript Features

### Type Definitions
- `BlogPost` interface defining the structure of blog posts
- Proper typing for DOM elements and event handlers
- Type-safe function parameters and return types

### Key TypeScript Implementations
- Strong typing for blog post data structure
- Type-safe DOM manipulation
- Proper event handler typing
- Module exports with type information

## Development

### Compiling TypeScript
```bash
# Install TypeScript globally first
npm install -g typescript

# Compile main.ts
npx tsc

# Compile post.ts
npx tsc post.ts
```

### Running the Application

**Option 1: Direct File Access (Recommended)**
Simply open `index.html` in a web browser. The compiled JavaScript will load without CORS issues.

**Option 2: Local Server**
If you prefer using a local server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then open http://localhost:8000 in your browser
```

## Features

- **Responsive Design**: Works on all device sizes
- **Dark Mode Support**: Automatic theme switching
- **Search Functionality**: Filter blog posts by title, content, or tags
- **Smooth Navigation**: Animated scrolling between sections
- **Individual Post Pages**: Clickable blog posts with full content
- **URL Routing**: Posts accessible via `/post.html?slug=post-slug` URLs
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Modern CSS**: Clean, minimalist design with CSS Grid and Flexbox
- **No CORS Issues**: Works directly with file:// protocol

## Browser Compatibility

Requires a modern browser that supports ES2020 and CSS Grid.
