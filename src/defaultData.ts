import { PortfolioData } from './types';

export const defaultPortfolioData: PortfolioData = {
  "profile": {
    "name": "AMIRUL SADIKIN",
    "title": "AI ENGINEER",
    "currentRole": "Computer Vision Developer @ Butterfly Innovative Technologies",
    "location": "Menara Maxis, Kuala Lumpur",
    "email": "ai.amirul.sadikin@gmailc.om",
    "phone": "+60197769497",
    "githubUrl": "https://github.com/aiamirul",
    "linkedInUrl": "https://linkedin.com",
    "websiteUrl": "https://portfolio.alexmercer.dev",
    "avatarUrl": "https://i.imgur.com/4Qdm6OI.png",
    "aboutBrief": "A man of focus.",
    "aboutLong": "A problem solver does not stop within a single discipline. Like a MacGyver, if something does not exist, I try to build it.\n\nI work across computer vision, web development, and research projects. I build systems that solve real problems, especially where speed, accuracy, and reliability matter.\n\nIn computer vision, I designed full pipelines from data collection, training models, deployment, and real-time video event detection. I also build simulation tools and improve models to work better in different environments.\n\nIn web development, I use Laravel, MySQL, JavaScript, HTML5, and Bootstrap to build full web applications, dashboards, and backend systems.\n\nI also manage research projects and grants, including planning, milestones, reporting, budgeting, and equipment handling.\n\nMost of my learning came from hands-on work, testing, and solving problems step by step, often using documentation and Stack Overflow.\n\nMy focus is simple: understand the problem, build a working solution, and improve it until it works well in real life.\n",
    "resumeSubtitle": "AI ENGINEER",
    "googleScholarUrl": "https://scholar.google.com",
    "qrOverrideContent": "",
    "aiAgentUrl": "",
    "aiCustomPrompt": "",
    "aiPromptMode": "append"
  },
  "education": [
    {
      "id": "edu_1",
      "institution": "Universiti Teknologi MARA",
      "degree": "Master of Computer Science",
      "fieldOfStudy": "Artificial Intelligence",
      "startDate": "2020",
      "endDate": "2022",
      "description": "Anomalous sound event detection in forest, a study to detect poachers and illegal tree felling. using only sound to cover large areas without visual clarity"
    },
    {
      "id": "edu_2",
      "institution": "Universiti Teknologi MARA",
      "degree": "Bachelor of Intelligent Systems Engineering",
      "fieldOfStudy": "Computer Science (Software Engineering)",
      "startDate": "2016",
      "endDate": "2020",
      "description": "AI Basics"
    }
  ],
  "experience": [
    {
      "id": "exp_1779953051091",
      "company": "UNIVERSITI TEKNOLOGI MARA",
      "role": "Research Assistant",
      "location": "Shah Alam",
      "startDate": "2020-01",
      "endDate": "2022-01",
      "current": false,
      "description": "Managed research grants from proposal development through project completion, including project planning, system design, milestone tracking, reporting, documentation, equipment procurement, vendor coordination, and budget management. Coordinated project timelines and deliverables to ensure compliance with grant requirements while supporting research operations, technical implementation, and resource allocation.",
      "achievements": [
        "Project architect",
        "Budget projection for equipment and resources"
      ],
      "techUsed": [
        "TensorFlow",
        "Jupyter",
        "Python",
        "Pytorch",
        "Weka"
      ]
    },
    {
      "id": "exp_1",
      "company": "BUTTERFLY INNOVATIVE TECHNOLOGIES SDN BHD",
      "role": "Computer Vision Developer",
      "location": "Menara Maxis, Kuala Lumpur",
      "startDate": "2022-05",
      "endDate": "Present",
      "current": true,
      "description": "Built and maintained end-to-end computer vision systems for real-time video event detection, where fast and accurate detection within seconds was critical. Worked on the full pipeline including data collection, data cleaning, model training, deployment, and system maintenance. Managed video and data processing pipelines, created simulation tools for testing and risk analysis, and adjusted detection logic for different market needs. Improved feature extraction methods to help models generalize better across different environments and scenarios.",
      "achievements": [
        "Custom Labeling software development",
        "Custom semantic sequence model",
        "Real-time Asynchronous Processing"
      ],
      "techUsed": [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Node.js",
        "Express",
        "PostgreSQL",
        "Redis",
        "Docker",
        "Yolo",
        "Pytorch",
        "Deepsort",
        "Tensorflow",
        "Mysql",
        "kafka",
        "websockets",
        "FastApi",
        "PHP"
      ]
    },
    {
      "id": "exp_3",
      "company": "SHAB ELECTRONICS PLT",
      "role": "Web Developer",
      "location": "Shah Alam",
      "startDate": "2018-06",
      "endDate": "2022-08",
      "current": false,
      "description": "Worked as a web developer building and maintaining web applications using Laravel, MySQL, JavaScript, HTML5, and Bootstrap. Developed backend systems, database structures, APIs, and frontend interfaces for internal and client-facing applications. Integrated JavaScript libraries and plugins to improve user experience and functionality. Handled debugging, server-side logic, database queries, and deployment tasks. Worked in a self-learning environment where most problem solving, troubleshooting, and learning came from documentation, forums, and Stack Overflow before modern AI coding assistants were widely available.",
      "achievements": [
        "Develop system from ground up, design ERD for database structures, understanding business data",
        "Import Bootstrap UI with laravel blade",
        "Maintain backups and security on aws servers"
      ],
      "techUsed": [
        "JavaScript",
        "HTML5 Canvas",
        "CSS Modules",
        "MySQL",
        "Laravel",
        "PHP"
      ]
    }
  ],
  "projects": [
    {
      "id": "proj_1",
      "title": "Real-Time Collaborative Analytics",
      "briefDescription": "A multi-user analytical dashboard dashboard with real-time cursor tracking, live charting, and instant report exports.",
      "longDescription": "A secure, resilient collaborative dashboard platform built for high-performance telemetry checking. It allows multiple team members to connect to the same analytical view, filter records, inspect data points, draw shapes, and discuss metrics live. Includes dynamic dark/light theme triggers, responsive chart displays utilizing Recharts, and instant report compilation with high-fidelity PDF outputs.",
      "coverImage": "https://i.imgur.com/X0TIPhi.png",
      "tags": [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Recharts",
        "Node.js"
      ],
      "githubLink": "https://github.com",
      "liveLink": "https://www.amirul.cloud/app/SIM.html",
      "featured": true
    },
    {
      "id": "proj_2",
      "title": "Oriented Object Labeling Tool",
      "briefDescription": "High-performance key-value distributed cache database featuring replication, memory eviction policies, and HTTP/gRPC interfaces.",
      "longDescription": "An experimental, deeply performant key-value store crafted to explore distributed storage mechanics. It supports standard CRUD operations over a lightweight JSON-over-HTTP or gRPC interface. Features active TTL-based memory eviction, leader-follower synchronization replication logs, and a clean web-based command execution console with a real-time cluster health visualizer.",
      "coverImage": "https://i.imgur.com/vp4qN2o.png",
      "images": [
        "https://i.imgur.com/dE9ajMb.mp4"
      ],
      "tags": [
        "Go",
        "gRPC",
        "Docker",
        "React",
        "TypeScript"
      ],
      "githubLink": "https://github.com",
      "featured": true,
      "liveLink": "https://www.amirul.cloud/app/OBJ.html"
    },
    {
      "id": "proj_3",
      "title": "OCR data collection tool",
      "briefDescription": "Interactive, canvas-based editor for mockups, vector drawings, and workflow diagrams, styled entirely with custom widgets.",
      "longDescription": "An advanced, mobile-friendly browser drawing app that lets engineers compose beautiful interface outlines, entity diagrams, or workflow charts. Built with custom interactive touch-target elements, fluid keyboard shortcut triggers, dynamic layout guidelines, and a local storage autosave engine supporting quick import/export of vector bundles.",
      "coverImage": "https://i.imgur.com/1AkssXW.png",
      "tags": [
        "React",
        "HTML5 Canvas",
        "Tailwind",
        "CSS Grid"
      ],
      "githubLink": "https://github.com",
      "liveLink": "https://www.amirul.cloud/app/OCR.html",
      "featured": false
    },
    {
      "id": "proj_4",
      "title": "Network Mapper",
      "briefDescription": "Zero-knowledge, web-vault manager using PBKDF2 cryptography, granular team vault sharing, and automatic phishing alerts.",
      "longDescription": "A modern password and API credential manager operating on absolute client-side encryption. Keys are never transmitted in plain text. Master keys are securely verified client-side using customized cryptographic salts, and records support granular access permissions. Complete with a beautiful, dark-themed responsive dashboard.",
      "coverImage": "https://i.imgur.com/mZY18Yd.png",
      "tags": [
        "React",
        "Web Crypto API",
        "Tailwind CSS",
        "TypeScript"
      ],
      "githubLink": "https://github.com",
      "featured": false,
      "liveLink": "https://shabpltsystem.com/app/networkmap/"
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
      "content": "The modern web is shifting rapidly towards server-driven optimization. For years, Single Page Applications (SPAs) downloaded hefty JavaScript bundles, letting the client's browser figure out the visual rendering from scratch. While extremely fast for sub-navigation, it proved painful for initial paint speeds and Search Engine Optimization (SEO).\n\nTo battle this, developers developed Server Side Rendering (SSR). In standard SSR, the server returns immediately styled HTML representing the request. But HTML alone is static—buttons don't function, links don't capture state, and dynamic components are frozen. The process of binding React events, handlers, and state management hooks to this pre-cooked server HTML in the browser is called **Hydration**.\n\n### The Cost of Standard Hydration\nDuring hydration, the client must still download the complete JavaScript application code. It runs a virtual pass matching the static elements with compiled React components. If a mismatch occurs, visual flickers or costly layout shifts happen.\n\n### Enter React Server Components (RSC)\nReact Server Components change the rendering rule completely. Instead of sending all rendering logic and components to the client, RSCs execute *exclusively* on the server. The client only receives a clean, light metadata JSON indicating the nested layout structure. \n\nThis model means:\n* Zero client bundle size for packages used purely within Server Components (like database connectors or heavy markdown parsers).\n* Secure direct queries to databases or backend microservices without exposing endpoints.\n* Progressive stream rendering directly into the page hierarchy as chunks resolve on the server.\n\nBy combining Server Components for static parts of your layout and interactive Client Components (with standard hook files) for stateful controls, developers compile applications that load instantaneously, feel native, and require extremely lightweight client processing.",
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
      "content": "Accessibility is not just a feature tickbox; it is a fundamental aspect of digital craftsmanship. Making sure that everyone, regardless of sensory or physical circumstances, can navigate your portfolio or product with dignity is a vital design goal.\n\nFor web applications, the World Wide Web Consortium (W3C) establishes the Web Content Accessibility Guidelines (WCAG) 2.1. Let's break down the three most common pitfalls in React developer portfolios and how to solve them with pure semantic markup and custom hooks.\n\n### 1. Semantic Markup and Implicit Roles\nMany modern portfolios are constructed entirely of generic `<div/>` wrappers styled with CSS grid or flex. If you replace standard buttons with clickable divs without keyboard triggers or aria flags, screen-readers will treat them as inert text.\n\n```tsx\n// ❌ BAD: Text behaves like a button but is completely invisible to tab keys\n<div onClick={handleClick} className=\"bg-blue-600 px-4 py-2 text-white\">\n  Click Me\n</div>\n\n// ✅ GOOD: Semantic, fully accessible naturally\n<button onClick={handleClick} className=\"bg-blue-600 px-4 py-2 text-white focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\">\n  Click Me\n</button>\n```\n\nUsing semantic structural tags like `<header/>`, `<main/>`, `<footer/>`, and `<section/>` with clear heading structures (`<h1/>` through `<h6/>`) automatically provides a navigable document outline for screen-readers.\n\n### 2. Tab Focus Trap in Dashboard Modals\nWhen presenting modals to display project summaries or edit forms in your content management dashboard, interactive keyboard focus must not escape the boundary of the modal. If a screen-reader user tabs past the 'submit' button, focus should cycle back to the modal header or 'close' button instead of focusing on elements behind the modal.\n\nYou can construct a simple React hook utilizing `useRef` to hook keydown listeners and restrict focus within interactive nodes:\n\n```typescript\nuseEffect(() => {\n  const handleKeyDown = (e: KeyboardEvent) => {\n    if (e.key !== 'Tab' || !modalRef.current) return;\n    const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea');\n    const first = focusables[0] as HTMLElement;\n    const last = focusables[focusables.length - 1] as HTMLElement;\n    \n    if (e.shiftKey && document.activeElement === first) {\n      last.focus();\n      e.preventDefault();\n    } else if (!e.shiftKey && document.activeElement === last) {\n      first.focus();\n      e.preventDefault();\n    }\n  };\n  window.addEventListener('keydown', handleKeyDown);\n  return () => window.removeEventListener('keydown', handleKeyDown);\n}, []);\n```\n\n### 3. Clear Color Contrasts\nEnsure text matches or exceeds a contrast ratio of 4.5:1 against the background under light or dark modes. This ensures readability for users with mild visual impairments or screen glare. Testing your color selections using standard developers inspector panels is a fantastic way to verify that your portfolio passes with elegant typography.",
      "category": "A11y & UX",
      "date": "2026-05-18",
      "readTime": "8 min read",
      "coverImage": "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400"
    }
  ],
  "publications": [
    {
      "id": "pub_1779954547135",
      "title": "A sound event detection based on hybrid convolution neural network and random forest",
      "authors": "AMIRUL SADIKIN, MARINA YUSOFF",
      "journal": "IAES International Journal of Artificial Intelligence (IJ-AI)",
      "year": "2022",
      "url": "https://scholar.google.com",
      "description": "Sound event detection (SED) assists in the detainment of intruders. In recent decades, several SED methods such as support vector machine (SVM), K-Means clustering, principal component analysis, and convolution neural network (CNN) on urban sound have been developed. Advanced work on SED in a rare sound event is challenging because it has limited exploration, especially for surveillance in a forest environment. This research provides an alternative method that uses informative features of sound event data from a natural forest environment and evaluates the CNN capabilities of the detection performances. A hybrid CNN and random forest (RF) are proposed to utilize a distinctive sound pattern. The feature extraction involves mel log energies. The detection processes include refinement parameters and postprocessing threshold determination to reduce false alarms rate. The proposed CNN-RF and custom CNN-RF models have been validated with three types of sound events. The results of the suggested approach have been compared with well-regarded sound event algorithms. The experiment results demonstrate that the CNN-RF assesses the superiority with remarkable improvement in performance, up to a 0.82 F1 score with a minimum false alarms rate at 10%. The performance shows a functional advantage over previous methods.",
      "pdfFileName": "2022 - A sound event detection based on hybrid convolution neural network and random forest.pdf",
      "pdfUrl": "https://github.com/aiamirul/Publications/blob/main/2022%20-%20A%20sound%20event%20detection%20based%20on%20hybrid%20convolution%20neural%20network%20and%20random%20forest.pdf",
      "publicationDate": "2022-1"
    },
    {
      "id": "pub_1779954445016",
      "title": "Mel-log energies analysis of authentic audible intrusion",
      "authors": "Amirul Sadikin Md Afendi, Marina Yusoff, Megawati Omar",
      "journal": "Bulletin of Electrical Engineering and Informatics",
      "year": "2020",
      "url": "https://scholar.google.com",
      "description": "Wildlife has been endangered due to illegal activities. This requires more effective surveillance measures. Felling timber and poaching are regular illegal activities but challenging to detect. Hence authorities should resort to modern technologies such as employing autonomous surveillance to stop them. The Malaysian forest audio data were recorded to lay a foundation in initiating a cheaper and practical approach. Hence this paper reports the collection, processing and analysis of audio data in preparation to develop an autonomous sound event detection system. The recording was an emulation of possible illegal activities in a reserved forest. Sounds of chainsaw and hand hatchet cutting tree trunks were taken. It was found that there was a distinct pattern in the Mel-log energies audio feature of the sound, which could be used to identify illegal activities. Thus, it is believed that a detection through audio is a possible approach to be employed as one of the methods to stop illegal activities in the tropical reserve forests like those in Malaysia",
      "pdfFileName": "Mel-log energies analysis of authentic audible intrusion.pdf",
      "publicationDate": "2020-02",
      "pdfUrl": "https://github.com/aiamirul/Publications/blob/main/2021%20-%20Mel-log%20energies%20analysis%20of%20authentic%20audible%20intrusion.pdf"
    },
    {
      "id": "pub_1779954244318",
      "title": "Tuberculosis X-Ray Images Classification based Dynamic Update Particle Swarm",
      "authors": "Marina Yusoff, Mohamad Syafiq Irfan Saaidi2, Amirul Sadikin Md Afendi, Azrin Mohd Hassan",
      "journal": "Journal of Hunan University (Natural Sciences)",
      "year": "2021",
      "url": "https://scholar.google.com",
      "description": "The classification of tuberculosis (TB) based on chest X-Ray (CXR) remains a time-consuming activity that requires an expert's interpretation. An automated TB classification on the CXR can be a significant clinical utility to overcome this issue as the disruptive technology is concerned. Most recent research focused on deep learning solutions but identifying the suitable network architecture remains a challenge as it depends on the image features. One of the network architectures is at the classification layer. This paper highlighted a proposed hybrid CNN and enhanced Particle Swarm Optimization (CNN-ePSO) to find an optimal architecture of a connected layer at the classification network layer. We proposed a discrete and real value representation of the particle and a dynamic update strategy of the particle. A series of experiments are performed using Montgomery and Shenzhen CXR for the image classification performance. Formulation of a suitable particle representation has shown a workable particle representation and successfully achieved its aim. The outcome assesses that the hybrid CNN-ePSO with image enhancement is superior to the CNN-PSO without image enhancement and other single CNN models with a remarkable improvement. Thus, a novel ePSO algorithm embedded with CNN captures significant attention on the classification result, mainly for CXR images. In the future, additional work on deep feature layer optimization would be possible for a better result and application of the most recent algorithm like cuckoo search and firefly algorithm.",
      "pdfFileName": "Tuberculosis X-Ray Images Classification based Dynamic Update Particle Swarm.pdf",
      "pdfUrl": "https://github.com/aiamirul/Publications/blob/main/2020%20-%20Tuberculosis%20X-Ray%20Images%20Classification%20based%20Dynamic%20Update%20Particle%20Swarm.pdf",
      "publicationDate": "2021-09"
    },
    {
      "id": "pub_1779953556626",
      "title": "A Review of anomalous sound event detection approaches",
      "authors": "AMIRUL SADIKIN, MARINA YUSOFF",
      "journal": "IAES International Journal of Artificial Intelligence (IJ-AI)",
      "year": "2019",
      "url": "https://scholar.google.com",
      "description": "This paper presents a review of anomalous sound event detection (SED) approaches. SED is becoming more applicable for real-world applications such as security, fire determination or other emergency alarms. Despite many research outcome previously, further research is required to reduce false positives and improve accuracy. SED approaches are comprehensively organized by methods covering system pipeline components of acoustic descriptors, classification engine, and decision finalization method. The review compares multiple approaches that is applied on a specific dataset. Security relies on anomalous events in order to prevent it one must find these anomalous events. Audio surveillance has become more efficient as that artificial intelligence has stepped up the game. Autonomous SED could be used for early detection and prevention. It is found that the state of the art method viable used in SED using features of log-mel energies in convolutional recurrent neural network (CRNN) with long short term memory (LSTM) with a verification step of thresholding has obtained 93.1% F1 score and 0.1307 ER. It is found that feature extraction of log mel energies are highly reliable method showing promising results on multiple experiments.",
      "pdfFileName": "Review of anomalous sound event detection approaches.pdf",
      "publicationDate": "2019-09-03",
      "pdfUrl": "https://github.com/aiamirul/Publications/blob/main/2019%20-%20Review%20of%20anomalous%20sound%20event%20detection%20approaches.pdf"
    },
    {
      "id": "pub_1",
      "title": "Build Confidence in our children",
      "authors": "Amirul Sadikin",
      "journal": "The Star (National Newspaper)",
      "year": "2018",
      "url": "https://scholar.google.com",
      "description": "Build Confidence in our children - The Star Newspaper article",
      "pdfUrl": "https://github.com/aiamirul/Publications/blob/main/2018%20-%20Build%20Confidence%20in%20our%20children%20-%20The%20Star%20News.pdf",
      "pdfFileName": "Build Confidence in our children - The Star News.pdf",
      "publicationDate": "2018-10-31"
    }
  ],
  "visibility": {
    "callingCard": true,
    "education": true,
    "experience": true,
    "projects": true,
    "skills": false,
    "blogs": false,
    "publications": true,
    "contact": false
  }
};
