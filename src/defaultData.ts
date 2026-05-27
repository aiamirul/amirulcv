/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PortfolioData } from './types';

export const defaultPortfolioData: PortfolioData = {
  profile: {
    name: "AMIRUL SADIKIN",
    title: "AI ENGINEER",
    currentRole: "Lead Architect @ QuantumSphere Systems",
    location: "Shah Alam",
    email: "ai.amirul.sadikin@gmailc.om",
    phone: "+60197769497",
    githubUrl: "https://github.com/aiamirul",
    linkedInUrl: "https://linkedin.com",
    websiteUrl: "https://portfolio.alexmercer.dev",
    avatarUrl: "https://i.imgur.com/4Qdm6OI.png",
    aboutBrief: "Highly analytical and detail-oriented systems architect with 8+ years of experience engineering high-performance decentralized cloud applications, real-time message brokers, and fully responsive user interfaces. Champion of clean code, automated testing, and inclusive accessibility.",
    aboutLong: "I am a passionate software engineer and systems architect who thrives at the intersection of robust backend infrastructure and stellar, user-centric frontend interfaces. Over the past eight years, I've designed cloud systems supporting over 50,000 concurrent websocket connections, engineered responsive frontends that slash loading latency by 45%, and mentored dozens of junior engineers. I believe in writing readable, modular code, enforcing rigorous accessibility standards (WCAG 2.1 AA), and bridging the gap between product vision and system scalability.",
    resumeSubtitle: "Senior Software Engineer • System Builder • Full-Stack Generalist",
    googleScholarUrl: "https://scholar.google.com",
    qrOverrideContent: ""
  },
  education: [
    {
      "id": "edu_1",
      "institution": "Universiti Teknologi MARA ",
      "degree": "Master of Computer Science",
      "fieldOfStudy": "Artificial Intelligence",
      "startDate": "2020",
      "endDate": "2022",
      "description": ""
    },
    {
      "id": "edu_2",
      "institution": "Universiti Teknologi MARA ",
      "degree": "Bachelor of Inteligent Systems Engineering",
      "fieldOfStudy": "Computer Science (Software Engineering)",
      "startDate": "2016",
      "endDate": "2020",
      "description": "Graduated Magna Cum Laude. Recipient of the Engineering Excellence Scholarship. Core coursework: Algorithms & Complexity, Web Development, Object-Oriented Design, and Human-Computer Interaction."
    }
  ],
  experience: [
    {
      "id": "exp_1",
      "company": "BUTTERFLY INNOVATIVE TECHNOLOGIES SDN BHD",
      "role": "Lead Architect & Full-Stack Engineer",
      "location": "Menara Maxis, Kuala Lumpur",
      "startDate": "2022-05",
      "endDate": "Present",
      "current": true,
      "description": "Direct engineering strategy, system architecture, and UI/UX design for decentralized real-time IoT analytical dashboards.",
      "achievements": [
        "Spearheaded the redesign of core cloud dashboard using React, Tailwind v4, and web-worker-based streaming, reducing browser CPU utilization during live charts by 55%.",
        "Configured a distributed Redis caching layer and optimized SQL joins, cutting complex analytical api response latencies from 1.2s to under 80ms.",
        "Created an internal component library incorporating complete screen-reader accessibility, achieving 100% WCAG compliance and standardizing UI across three subsidiary brands."
      ],
      "techUsed": [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Redis",
        "Docker"
      ]
    },
    {
      "id": "exp_2",
      "company": "Aetherial Labs",
      "role": "Senior Full Stack Developer",
      "location": "Seattle, WA (Remote)",
      "startDate": "2020-09",
      "endDate": "2022-12",
      "current": false,
      "description": "Designed core full-stack features and API endpoints for an enterprise carbon-tracking SaaS platform utilized by Fortune 500 companies.",
      "achievements": [
        "Built responsive dashboards utilizing D3.js and Recharts for complex multi-coordinate data visualizations that are highly readable on both desktop and mobile screens.",
        "Refactored legacy monolith server into modular Node/Express microservices, slashing CI/CD deployment pipeline times from 25 minutes down to 4.5 minutes.",
        "Implemented seamless OAuth2 identity integrations and secure biometric MFA, reinforcing system defense and security posture."
      ],
      "techUsed": [
        "React",
        "TypeScript",
        "Next.js",
        "D3.js",
        "Express.js",
        "GraphQL",
        "AWS",
        "GitHub Actions"
      ]
    },
    {
      "id": "exp_3",
      "company": "SHAB ELECTRONICS PLT",
      "role": "Software Engineer",
      "location": "Shah Alam",
      "startDate": "2018-06",
      "endDate": "2022-08",
      "current": false,
      "description": "Maintained and added advanced dynamic editing features to an on-demand browser-based graphic canvas tool.",
      "achievements": [
        "Co-developed an interactive vector-rendering engine using HTML5 multi-layered canvasses and custom physics-calculated resizing handles.",
        "Optimized client-side state handling using simple, synchronized Redux flows and debounced local storage persistence, reducing accidental canvas data loss actions to zero.",
        "Engineered the export mechanism generating print-ready PDFs and responsive inline SVGs with high-fidelity color profile mapping."
      ],
      "techUsed": [
        "React",
        "JavaScript",
        "Redux",
        "HTML5 Canvas",
        "Webpack",
        "Jest",
        "CSS Modules"
      ]
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": "Real-Time Collaborative Analytics",
      "briefDescription": "A multi-user analytical dashboard dashboard with real-time cursor tracking, live charting, and instant report exports.",
      "longDescription": "A secure, resilient collaborative dashboard platform built for high-performance telemetry checking. It allows multiple team members to connect to the same analytical view, filter records, inspect data points, draw shapes, and discuss metrics live. Includes dynamic dark/light theme triggers, responsive chart displays utilizing Recharts, and instant report compilation with high-fidelity PDF outputs.",
      "coverImage": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
      "tags": [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Recharts",
        "Node.js"
      ],
      "githubLink": "https://github.com",
      "liveLink": "https://example.com",
      "featured": true
    },
    {
      "id": "proj_2",
      "title": "Distributed KV Memorizer Store",
      "briefDescription": "High-performance key-value distributed cache database featuring replication, memory eviction policies, and HTTP/gRPC interfaces.",
      "longDescription": "An experimental, deeply performant key-value store crafted to explore distributed storage mechanics. It supports standard CRUD operations over a lightweight JSON-over-HTTP or gRPC interface. Features active TTL-based memory eviction, leader-follower synchronization replication logs, and a clean web-based command execution console with a real-time cluster health visualizer.",
      "coverImage": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
      "tags": [
        "Go",
        "gRPC",
        "Docker",
        "React",
        "TypeScript"
      ],
      "githubLink": "https://github.com",
      "featured": true
    },
    {
      "id": "proj_3",
      "title": "Vectorial Canvas & Flow Designer",
      "briefDescription": "Interactive, canvas-based editor for mockups, vector drawings, and workflow diagrams, styled entirely with custom widgets.",
      "longDescription": "An advanced, mobile-friendly browser drawing app that lets engineers compose beautiful interface outlines, entity diagrams, or workflow charts. Built with custom interactive touch-target elements, fluid keyboard shortcut triggers, dynamic layout guidelines, and a local storage autosave engine supporting quick import/export of vector bundles.",
      "coverImage": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      "tags": [
        "React",
        "HTML5 Canvas",
        "Tailwind",
        "CSS Grid"
      ],
      "githubLink": "https://github.com",
      "liveLink": "https://example.com",
      "featured": false
    },
    {
      "id": "proj_4",
      "title": "Secure Enterprise Credential Manager",
      "briefDescription": "Zero-knowledge, web-vault manager using PBKDF2 cryptography, granular team vault sharing, and automatic phishing alerts.",
      "longDescription": "A modern password and API credential manager operating on absolute client-side encryption. Keys are never transmitted in plain text. Master keys are securely verified client-side using customized cryptographic salts, and records support granular access permissions. Complete with a beautiful, dark-themed responsive dashboard.",
      "coverImage": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600",
      "tags": [
        "React",
        "Web Crypto API",
        "Tailwind CSS",
        "TypeScript"
      ],
      "githubLink": "https://github.com",
      "featured": false
    }
  ],
  "skills": [
    {
      "id": "sk_1",
      "name": "React, Next.js",
      "category": "frontend",
      "proficiency": 98,
      "level": "Expert"
    },
    {
      "id": "sk_2",
      "name": "TypeScript / JavaScript",
      "category": "frontend",
      "proficiency": 95,
      "level": "Expert"
    },
    {
      "id": "sk_3",
      "name": "Tailwind CSS & Styling",
      "category": "frontend",
      "proficiency": 96,
      "level": "Expert"
    },
    {
      "id": "sk_4",
      "name": "D3.js & Recharts Visuals",
      "category": "frontend",
      "proficiency": 88,
      "level": "Advanced"
    },
    {
      "id": "sk_5",
      "name": "HTML5 / WCAG 2.1 A11y",
      "category": "frontend",
      "proficiency": 92,
      "level": "Expert"
    },
    {
      "id": "sk_6",
      "name": "Node.js & Express API",
      "category": "backend",
      "proficiency": 94,
      "level": "Expert"
    },
    {
      "id": "sk_7",
      "name": "PostgreSQL & Complex SQL",
      "category": "backend",
      "proficiency": 89,
      "level": "Advanced"
    },
    {
      "id": "sk_8",
      "name": "Redis Cache Store",
      "category": "backend",
      "proficiency": 85,
      "level": "Advanced"
    },
    {
      "id": "sk_9",
      "name": "REST / GraphQL & gRPC",
      "category": "backend",
      "proficiency": 90,
      "level": "Advanced"
    },
    {
      "id": "sk_10",
      "name": "Docker & App Containerization",
      "category": "devops",
      "proficiency": 87,
      "level": "Advanced"
    },
    {
      "id": "sk_11",
      "name": "AWS Cloud Infrastructure",
      "category": "devops",
      "proficiency": 84,
      "level": "Advanced"
    },
    {
      "id": "sk_12",
      "name": "GitHub Actions CI/CD Pipelines",
      "category": "devops",
      "proficiency": 90,
      "level": "Expert"
    },
    {
      "id": "sk_13",
      "name": "Terraform & IaC",
      "category": "devops",
      "proficiency": 75,
      "level": "Proficient"
    },
    {
      "id": "sk_14",
      "name": "Git Version Control",
      "category": "tools",
      "proficiency": 96,
      "level": "Expert"
    },
    {
      "id": "sk_15",
      "name": "Jest, Mocha & Cypress Testing",
      "category": "tools",
      "proficiency": 88,
      "level": "Advanced"
    },
    {
      "id": "sk_16",
      "name": "Linux Systems & Bash scripting",
      "category": "tools",
      "proficiency": 82,
      "level": "Proficient"
    },
    {
      "id": "sk_17",
      "name": "Figma UI/UX & High-Fi Prototyping",
      "category": "tools",
      "proficiency": 85,
      "level": "Advanced"
    }
  ],
  "blogs": [
    {
      "id": "blog_1",
      "title": "The Mechanics of Modern Web Hydration & React Server Components",
      "slug": "modern-web-hydration-rsc",
      "summary": "An in-depth investigation into how SSR, hydration, static regeneration, and React Server Components work behind the scenes to optimize visual load speeds.",
      "content": `The modern web is shifting rapidly towards server-driven optimization. For years, Single Page Applications (SPAs) downloaded hefty JavaScript bundles, letting the client's browser figure out the visual rendering from scratch. While extremely fast for sub-navigation, it proved painful for initial paint speeds and Search Engine Optimization (SEO).

To battle this, developers developed Server Side Rendering (SSR). In standard SSR, the server returns immediately styled HTML representing the request. But HTML alone is static—buttons don't function, links don't capture state, and dynamic components are frozen. The process of binding React events, handlers, and state management hooks to this pre-cooked server HTML in the browser is called **Hydration**.

### The Cost of Standard Hydration
During hydration, the client must still download the complete JavaScript application code. It runs a virtual pass matching the static elements with compiled React components. If a mismatch occurs, visual flickers or costly layout shifts happen.

### Enter React Server Components (RSC)
React Server Components change the rendering rule completely. Instead of sending all rendering logic and components to the client, RSCs execute *exclusively* on the server. The client only receives a clean, light metadata JSON indicating the nested layout structure. 

This model means:
* Zero client bundle size for packages used purely within Server Components (like database connectors or heavy markdown parsers).
* Secure direct queries to databases or backend microservices without exposing endpoints.
* Progressive stream rendering directly into the page hierarchy as chunks resolve on the server.

By combining Server Components for static parts of your layout and interactive Client Components (with standard hook files) for stateful controls, developers compile applications that load instantaneously, feel native, and require extremely lightweight client processing.`,
      "category": "Architecture",
      "date": "2026-04-12",
      "readTime": "6 min read",
      "coverImage": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
    },
    {
      "id": "blog_2",
      "title": "Achieving Pristine WCAG 2.1 Accessibility in Complex React Apps",
      "slug": "inclusive-accessibility-react",
      "summary": "Practical guide to constructing screen-reader safe inputs, handling focus traps in interactive modals, and achieving optimal readability.",
      "content": `Accessibility is not just a feature tickbox; it is a fundamental aspect of digital craftsmanship. Making sure that everyone, regardless of sensory or physical circumstances, can navigate your portfolio or product with dignity is a vital design goal.

For web applications, the World Wide Web Consortium (W3C) establishes the Web Content Accessibility Guidelines (WCAG) 2.1. Let's break down the three most common pitfalls in React developer portfolios and how to solve them with pure semantic markup and custom hooks.

### 1. Semantic Markup and Implicit Roles
Many modern portfolios are constructed entirely of generic \`<div/>\` wrappers styled with CSS grid or flex. If you replace standard buttons with clickable divs without keyboard triggers or aria flags, screen-readers will treat them as inert text.

\`\`\`tsx
// ❌ BAD: Text behaves like a button but is completely invisible to tab keys
<div onClick={handleClick} className="bg-blue-600 px-4 py-2 text-white">
  Click Me
</div>

// ✅ GOOD: Semantic, fully accessible naturally
<button onClick={handleClick} className="bg-blue-600 px-4 py-2 text-white focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  Click Me
</button>
\`\`\`

Using semantic structural tags like \`<header/>\`, \`<main/>\`, \`<footer/>\`, and \`<section/>\` with clear heading structures (\`<h1/>\` through \`<h6/>\`) automatically provides a navigable document outline for screen-readers.

### 2. Tab Focus Traps in Dashboard Modals
When presenting modals to display project summaries or edit forms in your content management dashboard, interactive keyboard focus must not escape the boundary of the modal. If a screen-reader user tabs past the 'submit' button, focus should cycle back to the modal header or 'close' button instead of focusing on elements behind the modal.

You can construct a simple React hook utilizing \`useRef\` to hook keydown listeners and restrict focus within interactive nodes:

\`\`\`typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea');
    const first = focusables[0] as HTMLElement;
    const last = focusables[focusables.length - 1] as HTMLElement;
    
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
\`\`\`

### 3. Clear Color Contrasts
Ensure text matches or exceeds a contrast ratio of 4.5:1 against the background under light or dark modes. This ensures readability for users with mild visual impairments or screen glare. Testing your color selections using standard developers inspector panels is a fantastic way to verify that your portfolio passes with elegant typography.`,
      "category": "A11y & UX",
      "date": "2026-05-18",
      "readTime": "8 min read",
      "coverImage": "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400"
    }
  ],
  publications: [
    {
      id: "pub_1",
      title: "Real-Time Decentralized Synchronization in Cloud Analytical Environments",
      authors: "Amirul Sadikin, Jane Doe, Sarah Smith",
      journal: "IEEE Transactions on Cloud Computing",
      year: "2024",
      url: "https://scholar.google.com",
      description: "Proposed a novel conflict-free replicated data type (CRDT) optimization mapping for low-latency state synchronization with high-availability cloud targets."
    }
  ],
  visibility: {
    callingCard: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    blogs: true,
    publications: true,
    contact: true
  }
};
