// Blog post interface
const BlogPost = {
    // This will be used as a reference for the interface structure
};

// Sample blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Introduction to Agda: Dependent Types and Formal Verification",
        excerpt: "Explore the world of Agda, a functional programming language with dependent types that enables formal verification of mathematical properties and program correctness.",
        content: `
            <p>Agda is a functional programming language with dependent types, designed for formal verification and mathematical reasoning. Unlike traditional programming languages, Agda allows you to express and prove properties about your programs at the type level.</p>
            
            <h2>What Makes Agda Special?</h2>
            <p>Agda's key features include dependent types, pattern matching, and a powerful type system that can express complex mathematical properties. This makes it ideal for formal verification and theorem proving.</p>
            
            <h2>Basic Data Types</h2>
            <p>Let's start with fundamental data types in Agda. We can define the <a href="#bool-def" class="agda-link">Bool</a> type for boolean values:</p>

            <div class="agda-code" id="bool-def">
                <code>-- Boolean type
data Bool : Set where
  true  : Bool
  false : Bool</code>
            </div>
            
            <p>Similarly, we can define natural numbers using the <a href="#nat-def" class="agda-link">ℕ</a> type:</p>
            
            <div class="agda-code" id="nat-def">
                <code>-- Natural numbers
data ℕ : Set where
  zero : ℕ
  suc  : ℕ → ℕ</code>
            </div>
            
            <p>For lists, we use the <a href="#list-def" class="agda-link">List</a> type which is parameterized by the element type:</p>
            
            <div class="agda-code" id="list-def">
                <code>-- Lists
data List (A : Set) : Set where
  []   : List A
  _∷_  : A → List A → List A</code>
            </div>
            
            <h2>Dependent Types</h2>
            <p>Dependent types allow types to depend on values, enabling more precise specifications. For example, the <a href="#vec-def" class="agda-link">Vec</a> type represents lists with known length:</p>
            
            <div class="agda-code" id="vec-def">
                <code>-- Vector: list with known length
data Vec (A : Set) : <a href="#nat-def" class="agda-link">ℕ</a> → Set where
  []   : Vec A <a href="#nat-def" class="agda-link">zero</a>
  _∷_  : {n : ℕ} → A → Vec A n → Vec A (<a href="#nat-def" class="agda-link">suc</a> n)</code>
            </div>
            
            <p>This allows us to define safe indexing with the <a href="#index-def" class="agda-link">_!!_</a> function:</p>
            
            <div class="agda-code" id="index-def">
                <code>-- Safe indexing
_!!_ : {A : Set} {n : ℕ} → <a href="#vec-def" class="agda-link">Vec</a> A n → (i : ℕ) → i < n → A
(x ∷ xs) !! zero = x
(x ∷ xs) !! <a href="#nat-def" class="agda-link">suc</a> i = xs !! i</code>
            </div>
            
            <h2>Formal Proofs</h2>
            <p>Agda allows you to write formal proofs as programs. We start with the equality type <a href="#eq-def" class="agda-link">_≡_</a>:</p>
            
            <div class="agda-code" id="eq-def">
                <code>-- Equality type
data _≡_ {A : Set} (x : A) : A → Set where
  refl : x ≡ x</code>
            </div>
            
            <p>Using this, we can prove that addition is commutative with the <a href="#comm-proof" class="agda-link">+-comm</a> theorem:</p>
            
            <div class="agda-code" id="comm-proof">
                <code>-- Proof that addition is commutative
+-comm : ∀ m n → m + n <a href="#eq-def" class="agda-link">≡</a> n + m
+-comm <a href="#nat-def" class="agda-link">zero</a> n = sym (+-identityʳ n)
+-comm (<a href="#nat-def" class="agda-link">suc</a> m) n = 
  begin
    <a href="#nat-def" class="agda-link">suc</a> m + n
  <a href="#eq-def" class="agda-link">≡⟨⟩</a>
    <a href="#nat-def" class="agda-link">suc</a> (m + n)
  <a href="#eq-def" class="agda-link">≡⟨</a> cong <a href="#nat-def" class="agda-link">suc</a> (+-comm m n)<a href="#eq-def" class="agda-link">⟩</a>
    <a href="#nat-def" class="agda-link">suc</a> (n + m)
  <a href="#eq-def" class="agda-link">≡⟨⟩</a>
    n + <a href="#nat-def" class="agda-link">suc</a> m
  <a href="#eq-def" class="agda-link">∎</a></code>
            </div>
            
            <h2>Advanced Features</h2>
            <p>Agda supports advanced features like universe polymorphism. The <a href="#id-def" class="agda-link">id</a> function demonstrates this:</p>
            
            <div class="agda-code" id="id-def">
                <code>-- Universe levels
open import Level

-- Polymorphic identity function
id : {a : Level} {A : Set a} → A → A
id x = x</code>
            </div>
            
            <p>For coinductive data, we can define streams using the <a href="#stream-def" class="agda-link">Stream</a> record:</p>
            
            <div class="agda-code" id="stream-def">
                <code>-- Coinductive streams
record Stream (A : Set) : Set where
  coinductive
  field
    head : A
    tail : Stream A</code>
            </div>
            
            <p>And create infinite sequences like the <a href="#fib-def" class="agda-link">fib</a> Fibonacci stream:</p>
            
            <div class="agda-code" id="fib-def">
                <code>-- Fibonacci stream
fib : <a href="#stream-def" class="agda-link">Stream</a> <a href="#nat-def" class="agda-link">ℕ</a>
Stream.head fib = <a href="#nat-def" class="agda-link">zero</a>
Stream.tail fib = fib' where
  fib' : <a href="#stream-def" class="agda-link">Stream</a> <a href="#nat-def" class="agda-link">ℕ</a>
  Stream.head fib' = <a href="#nat-def" class="agda-link">suc</a> <a href="#nat-def" class="agda-link">zero</a>
  Stream.tail fib' = zipWith _+_ fib fib'</code>
            </div>
            
            <h2>Getting Started with Agda</h2>
            <p>To start using Agda, you'll need to install the Agda compiler and a text editor with Agda support. The language is particularly well-suited for:</p>
            <ul>
                <li>Formal verification of algorithms</li>
                <li>Mathematical theorem proving</li>
                <li>Research in type theory</li>
                <li>Teaching functional programming concepts</li>
            </ul>
            
            <p>While Agda has a steep learning curve, it offers unparalleled expressiveness for writing correct programs and proving their properties.</p>
        `,
        date: "2024-01-20",
        readTime: "10 min read",
        tags: ["Agda", "Functional Programming", "Type Theory", "Formal Verification"],
        slug: "introduction-to-agda"
    },
    {
        id: 2,
        title: "Getting Started with TypeScript",
        excerpt: "TypeScript brings static type checking to JavaScript, making your code more robust and maintainable. In this post, we'll explore the basics and see how it can improve your development workflow.",
        content: `
            <p>TypeScript has become one of the most popular languages for web development, and for good reason. It brings the power of static type checking to JavaScript, helping developers catch errors early and write more maintainable code.</p>
            
            <h2>What is TypeScript?</h2>
            <p>TypeScript is a superset of JavaScript that adds optional static type definitions. It compiles to plain JavaScript and can be used in any environment where JavaScript runs.</p>
            
            <h2>Key Benefits</h2>
            <ul>
                <li><strong>Type Safety:</strong> Catch errors at compile time rather than runtime</li>
                <li><strong>Better IDE Support:</strong> Enhanced autocomplete, refactoring, and navigation</li>
                <li><strong>Improved Documentation:</strong> Types serve as inline documentation</li>
                <li><strong>Easier Refactoring:</strong> Safe renaming and restructuring of code</li>
            </ul>
            
            <h2>Getting Started</h2>
            <p>To start using TypeScript, you can install it globally or as a project dependency:</p>
            <pre><code>npm install -g typescript
# or
npm install --save-dev typescript</code>`,
        date: "2024-01-15",
        readTime: "5 min read",
        tags: ["TypeScript", "JavaScript", "Programming"],
        slug: "getting-started-with-typescript"
    },
    {
        id: 3,
        title: "The Art of Minimalist Web Design",
        excerpt: "Less is more. Discover how minimalist design principles can create powerful, user-friendly websites that focus on content and user experience rather than flashy elements.",
        content: `
            <p>Minimalist web design isn't about removing everything—it's about removing everything unnecessary. The goal is to create a clean, focused experience that guides users to what matters most.</p>
            
            <h2>Core Principles</h2>
            <p>Minimalist design follows several key principles that work together to create effective, beautiful websites:</p>
            
            <h3>1. Whitespace is Your Friend</h3>
            <p>Generous use of whitespace helps content breathe and creates visual hierarchy. It's not empty space—it's purposeful space that guides the eye.</p>
            
            <h3>2. Typography Matters</h3>
            <p>With fewer visual elements, typography becomes crucial. Choose fonts that are readable and create clear information hierarchy.</p>
            
            <h3>3. Color with Purpose</h3>
            <p>Limit your color palette. A few well-chosen colors are more effective than a rainbow of options.</p>
            
            <h2>Benefits of Minimalism</h2>
            <ul>
                <li>Faster loading times</li>
                <li>Better mobile experience</li>
                <li>Improved accessibility</li>
                <li>Easier maintenance</li>
                <li>Timeless design</li>
            </ul>
            
            <p>Remember: every element should serve a purpose. If it doesn't add value, it's taking away from the user experience.</p>
        `,
        date: "2024-01-10",
        readTime: "7 min read",
        tags: ["Design", "UX", "Web Development"],
        slug: "art-of-minimalist-web-design"
    },
    {
        id: 4,
        title: "Building Responsive Layouts with CSS Grid",
        excerpt: "CSS Grid has revolutionized how we create layouts. Learn how to build flexible, responsive designs that work beautifully across all devices and screen sizes.",
        content: `
            <p>CSS Grid is a powerful layout system that allows you to create complex, responsive designs with ease. Unlike Flexbox, which is one-dimensional, Grid works in two dimensions, making it perfect for overall page layouts.</p>
            
            <h2>Grid Basics</h2>
            <p>CSS Grid uses a grid container and grid items. The container defines the grid structure, while items are placed within the grid.</p>
            
            <pre><code>.grid-container {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 20px;
}</code>
            
            <h2>Responsive Grid</h2>
            <p>One of Grid's greatest strengths is its ability to create responsive layouts without media queries:</p>
            
            <pre><code>.responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}</code>
            
            <h2>Grid Areas</h2>
            <p>Named grid areas make complex layouts more readable and maintainable:</p>
            
            <pre><code>.layout {
    display: grid;
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
}</code>
            
            <p>CSS Grid has transformed how we think about web layouts, making it easier than ever to create sophisticated, responsive designs.</p>
        `,
        date: "2024-01-05",
        readTime: "6 min read",
        tags: ["CSS", "Grid", "Responsive Design"],
        slug: "building-responsive-layouts-css-grid"
    },
    {
        id: 5,
        title: "The Future of Web Development",
        excerpt: "Exploring emerging trends and technologies that are shaping the future of web development, from AI integration to new frameworks and tools.",
        content: `
            <p>The web development landscape is constantly evolving. As we look ahead, several trends and technologies are poised to reshape how we build and interact with web applications.</p>
            
            <h2>AI-Powered Development</h2>
            <p>Artificial Intelligence is becoming an integral part of the development process. From code generation to automated testing, AI tools are helping developers work more efficiently.</p>
            
            <h3>Code Generation</h3>
            <p>AI-powered tools can generate boilerplate code, suggest implementations, and even write entire functions based on natural language descriptions.</p>
            
            <h2>WebAssembly (WASM)</h2>
            <p>WebAssembly allows high-performance applications to run in the browser, opening up new possibilities for web-based software that was previously only possible as desktop applications.</p>
            
            <h2>Progressive Web Apps (PWAs)</h2>
            <p>PWAs continue to bridge the gap between web and native applications, offering offline functionality, push notifications, and app-like experiences.</p>
            
            <h2>Edge Computing</h2>
            <p>Moving computation closer to users reduces latency and improves performance. Edge functions and CDNs are becoming more sophisticated.</p>
            
            <h2>What This Means for Developers</h2>
            <ul>
                <li>Focus on performance and user experience</li>
                <li>Embrace new tools and technologies</li>
                <li>Learn about AI integration</li>
                <li>Understand edge computing concepts</li>
                <li>Stay adaptable and curious</li>
            </ul>
            
            <p>The future of web development is exciting and full of possibilities. The key is to stay informed, experiment with new technologies, and always prioritize the user experience.</p>
        `,
        date: "2024-01-01",
        readTime: "8 min read",
        tags: ["Web Development", "Future", "Technology"],
        slug: "future-of-web-development"
    }
];

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getPostBySlug(slug) {
    return blogPosts.find(post => post.slug === slug);
}
