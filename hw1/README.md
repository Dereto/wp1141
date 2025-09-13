# Blog Homepage - TypeScript Implementation

A clean and concise blog homepage built with HTML, CSS, and TypeScript, inspired by minimalist design principles.

## Files Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling with responsive design and dark mode support
- `main.ts` - TypeScript source code with type definitions and functionality
- `main.js` - Compiled JavaScript (generated from TypeScript)
- `main.d.ts` - TypeScript declaration file
- `main.js.map` - Source map for debugging
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
npx tsc
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
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Modern CSS**: Clean, minimalist design with CSS Grid and Flexbox

## Browser Compatibility

Requires a modern browser that supports ES2020 modules and CSS Grid.
