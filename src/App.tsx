/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, GraduationCap, Code, Layers, BookOpen, Mail, 
  Settings, Printer, ChevronRight, Github, Linkedin, ExternalLink, 
  MapPin, Phone, Globe, Calendar, Clock, Send, MessageSquare, 
  CheckCircle, ArrowUpRight, ArrowLeft, Bookmark, X, RotateCw,
  FileText, Download
} from 'lucide-react';
import { PortfolioData, Project, BlogPost, SubmittedMessage, Publication } from './types';
import { defaultPortfolioData } from './defaultData';
import { ThemeSelector, ThemePresetVal, THEME_OPTIONS } from './components/ThemeSelector';
import { CMSDashboard } from './components/CMSDashboard';
import { ResumePDF } from './components/ResumePDF';

export default function App() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 1. Core Profile & Portfolio State
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => {
    const cached = localStorage.getItem('developer-portfolio-schema');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error('Failed to parse cached portfolio data', err);
      }
    }
    return defaultPortfolioData;
  });

  const vis = {
    callingCard: portfolioData.visibility?.callingCard ?? true,
    education: portfolioData.visibility?.education ?? true,
    experience: portfolioData.visibility?.experience ?? true,
    projects: portfolioData.visibility?.projects ?? true,
    skills: portfolioData.visibility?.skills ?? true,
    blogs: portfolioData.visibility?.blogs ?? true,
    publications: portfolioData.visibility?.publications ?? true,
    contact: portfolioData.visibility?.contact ?? true,
  };

  // 2. Theme Management State
  const [theme, setTheme] = useState<ThemePresetVal>(() => {
    // Priority 1: URL query parameter (?theme=nord)
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') as ThemePresetVal;
    
    const validThemes: ThemePresetVal[] = ['dark', 'light', 'nord', 'neo_tokyo', 'earthy_warm'];
    if (urlTheme && validThemes.includes(urlTheme)) {
      return urlTheme;
    }

    // Priority 2: Cache in localStorage
    const cachedTheme = localStorage.getItem('developer-portfolio-theme') as ThemePresetVal;
    if (cachedTheme && validThemes.includes(cachedTheme)) {
      return cachedTheme;
    }

    // Default Fallback
    return 'dark';
  });

  // 3. submitted contact messages local logs
  const [messages, setMessages] = useState<SubmittedMessage[]>(() => {
    const cached = localStorage.getItem('recruiter-inbox-messages');
    return cached ? JSON.parse(cached) : [];
  });

  // 4. Interface state togglers
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [cvPrintMode, setCvPrintMode] = useState<'fancy' | 'plain'>('fancy');
  const [cvShowProfilePic, setCvShowProfilePic] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [cardViewMode, setCardViewMode] = useState<'flip' | 'all-in-one'>('flip');

  // 5. Contact Form Fields
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // 6. Project filter state
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>('all');

  // 7. Dynamic JSON Schema Remote Import Status
  const [importStatus, setImportStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // 8. Mode Context (Only show CMS controls when ?mode=dev)
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'dev';
  });

  // Optional: check for loadjson query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let loadJsonUrl = params.get('loadjson');
    if (params.has('loadjson')) {
      if (!loadJsonUrl || loadJsonUrl === 'true' || loadJsonUrl === '1') {
        loadJsonUrl = 'https://www.amirul.cloud/amirul.json';
      }
    }

    if (loadJsonUrl) {
      setImportStatus({ status: 'loading', message: `Importing remote portfolio schema from: ${loadJsonUrl}...` });
      fetch(loadJsonUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.profile && Array.isArray(data.projects) && Array.isArray(data.experience)) {
            setPortfolioData(data);
            localStorage.setItem('developer-portfolio-schema', JSON.stringify(data));
            setImportStatus({ status: 'success', message: `Portfolio schema successfully loaded and rendered from ${loadJsonUrl}!` });
            setTimeout(() => {
              setImportStatus({ status: 'idle', message: '' });
            }, 6000);
          } else {
            throw new Error('Fetched file structure does not match standard portfolio data schema configuration.');
          }
        })
        .catch(err => {
          console.error('Error importing custom layout via URL query:', err);
          setImportStatus({
            status: 'error',
            message: `Failed to fetch remote JSON schema: ${err instanceof Error ? err.message : String(err)}`
          });
          setTimeout(() => {
            setImportStatus({ status: 'idle', message: '' });
          }, 8000);
        });
    }
  }, []);

  // Trigger HTML document root styling updates whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('developer-portfolio-theme', theme);
  }, [theme]);

  // Synchronize dynamic portfolio changes directly to local storage cache
  const handleUpdateData = (newData: PortfolioData) => {
    setPortfolioData(newData);
    localStorage.setItem('developer-portfolio-schema', JSON.stringify(newData));
  };

  // Handle Contact Form Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSubmitting(true);

    const newMsg: SubmittedMessage = {
      id: `msg_${Date.now()}`,
      senderName: contactName,
      senderEmail: contactEmail,
      senderSubject: contactSubject || 'General Portfolio Inquiry',
      messageText: contactMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('recruiter-inbox-messages', JSON.stringify(updatedMessages));

    setTimeout(() => {
      setIsSubmitting(false);
      setFormSuccess(true);
      // Reset input fields
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      
      // Auto close success alert after 4 seconds
      setTimeout(() => setFormSuccess(false), 4500);
    }, 800);
  };

  const handleClearMessages = () => {
    setMessages([]);
    localStorage.removeItem('recruiter-inbox-messages');
  };

  const handleDeleteMessage = (id: string) => {
    const filtered = messages.filter(m => m.id !== id);
    setMessages(filtered);
    localStorage.setItem('recruiter-inbox-messages', JSON.stringify(filtered));
  };

  // Get unique tags for projects filtering
  const allProjectTags = Array.from(
    new Set(portfolioData.projects.flatMap(p => p.tags))
  );

  const filteredProjects = activeProjectFilter === 'all'
    ? portfolioData.projects
    : portfolioData.projects.filter(p => p.tags.includes(activeProjectFilter));

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] transition-all duration-305 flex flex-col justify-between min-h-screen selection:bg-[var(--accent-primary)] selection:text-white">

      {/* ──────────────────────────────────────────────────────────────────
          Accessibility: Skip Navigation Link for Keyboard Seekers
          ────────────────────────────────────────────────────────────────── */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg font-bold shadow-xl border border-white/20"
      >
        Skip to main content
      </a>

      {/* ──────────────────────────────────────────────────────────────────
          Floating Navigation Control Utility Hub (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 no-print">
        <button
          onClick={() => setIsResumeOpen(true)}
          className="w-12 h-12 rounded-full bg-[var(--accent-primary)] hover:scale-105 hover:bg-[var(--accent-hover)] text-white shadow-xl flex items-center justify-center transition-all cursor-pointer relative group-hover"
          title="Print & Download Resume"
          aria-label="Toggle Resume PDF view"
        >
          <Printer className="w-5 h-5" />
          <span className="absolute -left-36 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
            Printable PDF CV
          </span>
        </button>

        {isDevMode && (
          <button
            onClick={() => setIsCmsOpen(true)}
            className="w-12 h-12 rounded-full bg-slate-950 hover:scale-105 text-white border border-slate-800 shadow-xl flex items-center justify-center transition-all cursor-pointer relative group ring-2 ring-indigo-500/20"
            title="Manage Content (CMS Dashboard)"
            aria-label="Open CMS Content dashboard"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
            <span className="absolute -left-36 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              Manage Portfolio CMS
            </span>
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          Pristine Global Header Navigation Bar
          ────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2">
            <span className="font-display font-extrabold uppercase text-lg sm:text-xl tracking-wider text-[var(--text-primary)]">
              {portfolioData.profile.name.split(' ')[0]}
              <span className="text-[var(--accent-primary)]">.cloud</span>
            </span>
          </a>

          {/* Nav scroll anchor markers */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tracking-wider cursor-pointer font-sans">Biography</a>
            {vis.experience && (
              <a href="#experience" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tracking-wider cursor-pointer font-sans">Timeline</a>
            )}
            {vis.projects && (
              <a href="#projects" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tracking-wider cursor-pointer font-sans">Projects</a>
            )}
            {vis.skills && (
              <a href="#skills" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tracking-wider cursor-pointer font-sans">Competencies</a>
            )}
            {vis.blogs && (
              <a href="#blog" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] tracking-wider cursor-pointer font-sans">Articles</a>
            )}
            {vis.contact && (
              <a href="#contact" className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text(--text-primary) tracking-wider cursor-pointer font-sans">Contact</a>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* Quick dashboard trigger */}
            <button
              onClick={() => setIsCmsOpen(true)}
              className="text-xs font-bold uppercase tracking-wider bg-[var(--accent-light)] hover:bg-[var(--accent-primary)] text-[var(--accent-primary)] hover:text-white px-3.5 py-1.5 rounded-lg border border-[var(--accent-primary)]/20 transition-all cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CMS Panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
          Primary Main Page Body — Responsive Bento Grid Theme Layout
          ────────────────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">

        {/* Dynamic Schema Import State Info Drawer */}
        {importStatus.status !== 'idle' && (
          <div className="no-print transition-all duration-300">
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              importStatus.status === 'loading' ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' :
              importStatus.status === 'success' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' :
              'bg-rose-600/10 border-rose-500/20 text-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {importStatus.status === 'loading' && (
                  <RotateCw className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
                )}
                {importStatus.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {importStatus.status === 'error' && (
                  <X className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-semibold tracking-wide">
                  {importStatus.message}
                </p>
              </div>
              <button 
                onClick={() => setImportStatus({ status: 'idle', message: '' })}
                className="hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer text-current"
                aria-label="Dismiss message banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Master Bento Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* CARD 1: Profile biography & Main Bio Display */}
          <section id="about" className={`bento-card-base ${vis.callingCard ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col justify-between min-h-[440px] relative overflow-hidden group`}>
            {/* Corner visual blur blob matching current accent */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--accent-primary)]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[var(--accent-primary)]/15 transition-all duration-500"></div>
            
            <div className="z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-center md:items-start text-center md:text-left">
              {/* Avatar frame */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl relative bg-[var(--bg-primary)] overflow-hidden shrink-0 border border-[var(--border-color)] shadow-md select-none">
                <img 
                  src={portfolioData.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'} 
                  alt={`${portfolioData.profile.name} Avatar`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Identity labels */}
              <div className="flex-1 flex flex-col gap-2.5">
                <span className="bento-pill max-w-max mx-auto md:mx-0">
                  {portfolioData.profile.currentRole}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-[var(--text-primary)]">
                  {portfolioData.profile.name}
                </h1>
                <p className="text-base font-semibold text-[var(--accent-primary)] leading-tight">
                  {portfolioData.profile.title}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {portfolioData.profile.aboutBrief}
                </p>

                {/* Locator metrics */}
                <div className="flex flex-wrap justify-center md:justify-start gap-y-1.5 gap-x-4 text-xs text-[var(--text-secondary)] font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    {portfolioData.profile.location}
                  </span>
                  <span className="hidden sm:inline text-[var(--border-color)]">|</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    {portfolioData.profile.email}
                  </span>
                  {portfolioData.profile.phone && (
                    <>
                      <span className="hidden sm:inline text-[var(--border-color)]">|</span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                        <span>{portfolioData.profile.phone}</span>
                        <a
                          href={`https://wa.me/${portfolioData.profile.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="inline-flex items-center justify-center p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors leading-none"
                        >
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Long detail block */}
            <div className="mt-6 pt-5 border-t border-[var(--border-color)]/70 relative z-10">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">About Me / Story</span>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {portfolioData.profile.aboutLong}
              </p>
            </div>

            {/* Social action launchers */}
            <div className="flex flex-wrap gap-2.5 mt-6 relative z-10">
              <button
                onClick={() => setIsResumeOpen(true)}
                className="px-4.5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <Printer className="w-3.5 h-3.5" /> Printable CV / PDF
              </button>
              
              {portfolioData.profile.githubUrl && (
                <a
                  href={portfolioData.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              
              {portfolioData.profile.linkedInUrl && (
                <a
                  href={portfolioData.profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}

              {portfolioData.profile.googleScholarUrl && (
                <a
                  href={portfolioData.profile.googleScholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-xs font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4" /> Google Scholar
                </a>
              )}
            </div>
          </section>

          {vis.callingCard && (
            <section className="bento-card-base lg:col-span-4 flex flex-col justify-between group relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <div className="flex justify-between items-center gap-1.5 flex-wrap">
                <span className="bento-pill">Calling Card Preview</span>
                
                {/* Mode Selector Option tabs */}
                <div className="flex bg-[var(--bg-primary)] border border-[var(--border-color)] p-0.5 rounded-lg select-none">
                  <button
                    onClick={() => setCardViewMode('flip')}
                    className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide rounded ${
                      cardViewMode === 'flip' 
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    } transition-all duration-200 cursor-pointer`}
                    title="3D Flip Mode"
                  >
                    3D Flip
                  </button>
                  <button
                    onClick={() => setCardViewMode('all-in-one')}
                    className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide rounded ${
                      cardViewMode === 'all-in-one' 
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    } transition-all duration-200 cursor-pointer`}
                    title="All-In-One Flat Mode"
                  >
                    All-in-One
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-baseline">
                <h3 className="text-base font-bold font-display tracking-tight text-[var(--text-primary)]">Interactive Business Pass</h3>
                {cardViewMode === 'flip' && (
                  <button 
                    onClick={() => setCardSide(prev => prev === 'front' ? 'back' : 'front')}
                    className="text-[8px] font-extrabold uppercase tracking-wider text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    Flip Over ⟲
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                A modern digital coordinate code card. Overridable QR and active coordinates connect scanning parties straight to secure ports.
              </p>
            </div>

            {/* Calling Card rendering block based on mode selection */}
            {cardViewMode === 'flip' ? (
              /* Interactive Physical 3D Flip Card mockup container */
              <div 
                className="my-5 relative w-full h-56 select-none perspective-1000 cursor-pointer"
                onClick={() => setCardSide(prev => prev === 'front' ? 'back' : 'front')}
              >
                <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${cardSide === 'back' ? 'rotate-y-180' : ''}`}>
                  
                  {/* FRONT SIDE (Design focusing on identity and academic/education) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 flex flex-col justify-between overflow-hidden shadow-md group-hover:border-[var(--accent-primary)]/60 transition-colors">
                    {/* Digital circuit vector backing lines */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[var(--accent-primary)]/10 blur-xl rounded-full pointer-events-none"></div>
                    
                    <div className="flex gap-3.5 items-start">
                      {/* Picture (Avatar) */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] shadow-sm shrink-0">
                        <img 
                          src={portfolioData.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'} 
                          alt="Profile avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Identification labels */}
                      <div className="space-y-0.5 overflow-hidden">
                        <h4 className="font-display font-black text-sm text-[var(--text-primary)] tracking-wide uppercase truncate">
                          {portfolioData.profile.name}
                        </h4>
                        <p className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider truncate">
                          {portfolioData.profile.title}
                        </p>
                        <p className="text-[9px] text-[var(--text-secondary)] font-semibold truncate">
                          {portfolioData.profile.currentRole}
                        </p>
                      </div>
                    </div>

                    {/* Picture Education logs */}
                    <div className="border-t border-[var(--border-color)]/50 pt-3 relative z-10 space-y-1">
                      <p className="font-bold text-xs text-[var(--text-primary)] font-display">
                        Master in Computer Science
                      </p>
                      <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-wider">
                        {portfolioData.profile.title}
                      </p>
                    </div>

                    {/* Pass footer labels */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-secondary)] opacity-50 pt-1">
                      <span>AMIRUL.CLOUD PASS</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        FRONT SIDE
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE (Design focusing on contact coordinates and QR) */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-color)] p-4 flex flex-col justify-between overflow-hidden shadow-md group-hover:border-[var(--accent-primary)]/60 transition-colors">
                    <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[var(--accent-primary)]/10 blur-xl rounded-full pointer-events-none"></div>

                    <div className="flex gap-3 items-center h-full">
                      {/* Contact Email & Phone */}
                      <div className="flex-1 space-y-2.5 overflow-hidden">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] font-mono">
                          CONTACT
                        </span>
                        <div className="space-y-1.5 text-[10px] text-[var(--text-primary)] font-semibold">
                          {/* Email */}
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                            <span className="truncate">{portfolioData.profile.email}</span>
                          </div>
                          {/* Phone */}
                          {portfolioData.profile.phone && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                              <span className="truncate">{portfolioData.profile.phone}</span>
                            </div>
                          )}
                          {/* Location */}
                          <div className="flex items-center gap-1.5 truncate text-[9px] text-[var(--text-secondary)]">
                            <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                            <span className="truncate">{portfolioData.profile.location}</span>
                          </div>
                        </div>

                        {/* Overridable Link description badge */}
                        <span className="inline-block bg-[var(--accent-light)] text-[var(--accent-primary)] font-mono font-extrabold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded">
                          {portfolioData.profile.qrOverrideContent ? "Custom Override" : "Website link"}
                        </span>
                      </div>

                      {/* QR Code */}
                      <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-[var(--border-color)]/60 flex items-center justify-center shrink-0 relative shadow-sm group-hover:border-[var(--accent-primary)]/40 transition-colors">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portfolioData.profile.qrOverrideContent || portfolioData.profile.websiteUrl || currentUrl)}`} 
                          alt="Calling Card secure QR link" 
                          className="w-full h-full object-contain filter invert-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Pass Back footer */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-secondary)] opacity-50 pt-2 border-t border-[var(--border-color)]/40">
                      <span>ENCODED COORDINATES</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></span>
                        BACK SIDE
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* All-in-One Flat single page list rendering (Both sides rendered simultaneously online) */
              <div className="my-5 flex flex-col gap-4">
                
                {/* FRONT RENDER VIEW */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)] p-3.5 flex flex-col justify-between overflow-hidden shadow-sm hover:border-[var(--accent-primary)]/40 transition-colors">
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[var(--accent-primary)]/10 blur-xl rounded-full pointer-events-none"></div>
                  
                  <div className="flex gap-3.5 items-start">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] shadow-sm shrink-0 font-sans">
                      <img 
                        src={portfolioData.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'} 
                        alt="Profile avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h4 className="font-display font-black text-xs sm:text-sm text-[var(--text-primary)] tracking-wide uppercase truncate">
                        {portfolioData.profile.name}
                      </h4>
                      <p className="text-[9px] font-bold text-[var(--accent-primary)] uppercase tracking-wider truncate">
                        {portfolioData.profile.title}
                      </p>
                      <p className="text-[8px] text-[var(--text-secondary)] font-semibold truncate">
                        {portfolioData.profile.currentRole}
                      </p>
                    </div>
                  </div>

                  {/* Picture Academic logs */}
                  <div className="border-t border-[var(--border-color)]/50 pt-2.5 space-y-1">
                    <p className="font-bold text-xs text-[var(--text-primary)] font-display">
                      Master in Computer Science
                    </p>
                    <p className="text-[9px] text-[var(--accent-primary)] font-bold uppercase tracking-wider">
                      {portfolioData.profile.title}
                    </p>
                  </div>

                  {/* Pass footer labels */}
                  <div className="flex justify-between items-center text-[8px] font-mono text-[var(--text-secondary)] opacity-50 pt-1">
                    <span>AMIRUL.CLOUD PASS</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      FRONT SIDE
                    </span>
                  </div>
                </div>

                {/* BACK RENDER VIEW */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-color)] p-3.5 flex flex-col justify-between overflow-hidden shadow-sm hover:border-[var(--accent-primary)]/40 transition-colors">
                  <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-[var(--accent-primary)]/10 blur-xl rounded-full pointer-events-none"></div>

                  <div className="flex gap-2.5 items-center h-full">
                    {/* Contact Email & Phone */}
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <span className="block text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)] font-mono pb-0.5">
                        CONTACT
                      </span>
                      <div className="space-y-1 text-[9px] font-semibold text-[var(--text-primary)]">
                        {/* Email */}
                        <div className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                          <span className="truncate">{portfolioData.profile.email}</span>
                        </div>
                        {/* Phone */}
                        {portfolioData.profile.phone && (
                          <div className="flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                            <span className="truncate">{portfolioData.profile.phone}</span>
                          </div>
                        )}
                        {/* Location */}
                        <div className="flex items-center gap-1 truncate text-[8px] text-[var(--text-secondary)]">
                          <MapPin className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                          <span className="truncate">{portfolioData.profile.location}</span>
                        </div>
                      </div>

                      {/* Overridable Link description badge */}
                      <span className="inline-block bg-[var(--accent-light)] text-[var(--accent-primary)] font-mono font-extrabold uppercase tracking-wider text-[7px] px-1.5 py-0.5 rounded mt-3">
                        {portfolioData.profile.qrOverrideContent ? "Custom Override" : "Website link"}
                      </span>
                    </div>

                    {/* QR Code */}
                    <div className="w-20 h-20 bg-white p-1 rounded-xl border border-[var(--border-color)]/60 flex items-center justify-center shrink-0 relative shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(portfolioData.profile.qrOverrideContent || portfolioData.profile.websiteUrl || currentUrl)}`} 
                        alt="Calling Card secure QR link" 
                        className="w-full h-full object-contain filter invert-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Pass Back footer */}
                  <div className="flex justify-between items-center text-[8px] font-mono text-[var(--text-secondary)] opacity-50 pt-1.5 border-t border-[var(--border-color)]/40">
                    <span>ENCODED COORDINATES</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"></span>
                      BACK SIDE
                    </span>
                  </div>
                </div>

              </div>
            )}

            <button
              onClick={() => setIsResumeOpen(true)}
              className="w-full text-center py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer z-10"
            >
              Print Clean CV PDF
            </button>
          </section>
          )}

          {vis.experience && (
            <section id="experience" className={`bento-card-base ${vis.skills ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col justify-between group min-h-[460px] relative overflow-hidden`}>
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-[var(--accent-primary)]/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
                <h3 className="text-base font-bold uppercase tracking-wider font-display">Employment History</h3>
              </div>

              {portfolioData.experience.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic text-center p-8 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                  Employment Chronicles is currently empty. Open CMS system.
                </p>
              ) : (
                <div className="relative border-l border-[var(--border-color)] pl-4.5 space-y-6 max-h-[300px] overflow-y-auto pr-1">
                  {portfolioData.experience.map((exp) => (
                    <div key={exp.id} className="relative text-xs">
                      {/* Node circle */}
                      <span className="absolute -left-[23px] top-1 w-2 h-2 rounded-full bg-[var(--bg-primary)] border border-[var(--accent-primary)] inline-block" />
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline gap-1 mb-1.5">
                        <h4 className="font-bold text-sm text-[var(--text-primary)]">
                          {exp.role} <span className="text-[var(--accent-primary)]">@ {exp.company}</span>
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] px-2 py-0.5 rounded">
                          {exp.startDate} – {exp.endDate}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium italic -mt-0.5 mb-1.5">{exp.location}</p>
                      
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">
                        {exp.description}
                      </p>

                      <div className="flex flex-wrap gap-1 select-none">
                        {exp.techUsed.map((tech) => (
                          <span key={tech} className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a href="#detailed-chronicles" className="mt-4 text-xs font-bold text-[var(--accent-primary)] hover:translate-x-1 duration-200 transition-transform flex items-center gap-1">
              Check Achievements & Metrics →
            </a>
          </section>
          )}

          {vis.skills && (
            <section id="skills" className={`bento-card-base ${vis.experience ? 'lg:col-span-4' : 'lg:col-span-12'} flex flex-col justify-between group`}>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
                <h3 className="text-base font-bold uppercase tracking-wider font-display">Aesthetic Skills</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                Structured frameworks proficiency and implementation level metrics.
              </p>

              <div className="space-y-4">
                {['frontend', 'backend', 'devops', 'tools'].map((catKey) => {
                  const s = portfolioData.skills.filter(sk => sk.category === catKey).slice(0, 3);
                  if (s.length === 0) return null;

                  const titles: Record<string, string> = {
                    frontend: 'Interface Foundations',
                    backend: 'Server Engineering',
                    devops: 'Clouds & CI/CD',
                    tools: 'Utilities Framework'
                  };

                  return (
                    <div key={catKey} className="space-y-1 rounded-xl bg-[var(--bg-primary)]/50 p-2.5 border border-[var(--border-color)]/50">
                      <span className="text-[9px] font-bold text-[var(--accent-primary)] tracking-widest uppercase font-mono">
                        {titles[catKey] || catKey}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.map(it => (
                          <span key={it.id} className="text-[10px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold px-2 py-0.5 rounded font-mono">
                            {it.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <a 
              href="#detailed-competencies" 
              className="mt-4 text-xs font-bold text-[var(--accent-primary)] hover:translate-x-1 duration-200 transition-transform flex items-center gap-1"
            >
              Analyze Metrics Matrix →
            </a>
          </section>
          )}

          {vis.projects && (
            <section id="projects" className="lg:col-span-12 flex flex-col gap-4 scroll-mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1 bg-transparent">
                  <Code className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
                  <h3 className="text-lg font-extrabold uppercase tracking-wider font-display">Engineering Case Studies</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Click on any case article to review comprehensive architectural diagrams and parameters.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-1 select-none">
                <button
                  onClick={() => setActiveProjectFilter('all')}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all ${
                    activeProjectFilter === 'all'
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  All Projects
                </button>
                {allProjectTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveProjectFilter(tag)}
                    className={`text-[10px] px-3 py-1.5 rounded-lg border font-mono transition-all ${
                      activeProjectFilter === tag
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Empty results matching this tag filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((p) => (
                  <article 
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="bento-card-base hover:border-[var(--accent-primary)] cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail mockup frame */}
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-[var(--border-color)]">
                        <img 
                          src={p.coverImage} 
                          alt={p.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        {p.featured && (
                          <span className="absolute top-2 left-2 bg-[var(--accent-primary)] text-white font-mono text-[8px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded">
                            Featured Build
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-tight mb-2">
                        {p.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 h-8 mb-4">
                        {p.briefDescription}
                      </p>
                    </div>

                    <div className="space-y-3 mt-auto">
                      <div className="flex flex-wrap gap-1 select-none">
                        {p.tags.slice(0, 3).map((tg) => (
                          <span key={tg} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            {tg}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-[var(--accent-primary)] font-bold flex items-center gap-0.5">
                        Read Analytics Specs <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          )}

          {vis.blogs && (
            <section id="blog" className={`bento-card-base ${vis.contact ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col justify-between group scroll-mt-6`}>
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-display">Engineering Journal</h3>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase text-[var(--text-secondary)]">Tech Insights</span>
              </div>

              {portfolioData.blogs.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic text-center p-6">No journal log chronicles found.</p>
              ) : (
                <div className="space-y-4">
                  {portfolioData.blogs.slice(0, 2).map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedBlog(post)}
                      className="flex gap-4 items-start group/item cursor-pointer p-2.5 rounded-xl hover:bg-[var(--bg-primary)] transition-all"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[var(--border-color)] bg-[var(--bg-tertiary)] select-none">
                        <img 
                          src={post.coverImage} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-secondary)] mb-1">
                          <span className="text-[var(--accent-primary)] font-bold">{post.category}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                        </div>
                        <h4 className="font-bold text-xs text-[var(--text-primary)] group-hover/item:text-[var(--accent-primary)] leading-snug line-clamp-1 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 leading-normal">
                          {post.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                const el = document.getElementById('detailed-journal');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="mt-6 text-xs font-bold text-[var(--accent-primary)] hover:translate-x-1 duration-200 transition-transform text-left"
            >
              Check Comprehensive Research Articles →
            </button>
          </section>
          )}

          {vis.contact && (
            <section id="contact" className={`bento-card-base ${vis.blogs ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col justify-between group scroll-mt-6`}>
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="bento-pill">Communications Hub</span>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--text-secondary)] uppercase">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Live Coordinates
                </div>
              </div>

              <h3 className="text-base font-bold font-display tracking-tight text-[var(--text-primary)] mb-1">Get in Touch</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                Interested in booking a code assessment or hiring pipeline? Drop a direct message instantly below.
              </p>

              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-1.5 animate-bounce-short">
                  <CheckCircle className="w-4 h-4" /> Message submitted! Inspect via CMS Inbox panel.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <input 
                      type="text" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Your Email"
                      required
                      className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <input 
                    type="text" 
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Subject coordinates"
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                  />
                </div>

                <div className="space-y-0.5">
                  <textarea 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Project details, timeline guidelines, test guidelines..."
                    required
                    rows={2}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 focus:ring-1 focus:ring-[var(--accent-primary)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Log Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Message coordinates
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
          )}

        </div>

        {/* ──────────────────────────────────────────────────────────────────
            DETAILED DRILL DOWN MAPS FOR RECRUITERS
            Provides deep alphabetical history, full competencies list, 
            and long form research logs with elegant scannable outlines.
            ────────────────────────────────────────────────────────────────── */}
        <div id="detailed-drilldowns" className="pt-16 border-t border-[var(--border-color)]/70 space-y-16">
          
          {/* Detailed Chronicles Section */}
          {vis.experience && (
            <section id="detailed-chronicles" className="space-y-8 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                Chronological Archive & Achievements
              </h2>
            </div>

            {portfolioData.experience.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No historical timeline items provided. Open CMS.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.experience.map((exp) => (
                  <div key={exp.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-semibold text-xs text-[var(--accent-primary)] tracking-wide font-mono uppercase">
                          {exp.startDate} - {exp.endDate}
                        </span>
                        <span className="text-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold font-mono px-2 py-0.5 rounded">
                          {exp.location}
                        </span>
                      </div>
                      <h4 className="font-display font-extrabold text-base text-[var(--text-primary)] leading-tight mb-1">
                        {exp.role}
                      </h4>
                      <h5 className="font-semibold text-xs text-[var(--text-secondary)] mb-4 font-sans">{exp.company}</h5>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{exp.description}</p>
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Core Contributions:</span>
                          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--text-secondary)]">
                            {exp.achievements.map((ach, idx) => (
                              <li key={idx} className="leading-snug pl-1.5"><span className="font-sans text-[Var(--text-secondary)]">{ach}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Academic Logs Section */}
          {vis.education && (
            <section id="detailed-academics" className="space-y-8 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <GraduationCap className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                Academics & Educational Levels
              </h2>
            </div>

            {portfolioData.education.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No educational records provided. Open CMS.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioData.education.map((edu) => (
                  <div key={edu.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-[var(--accent-primary)] tracking-wider">
                          {edu.degree}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                          {edu.startDate} – {edu.endDate}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] leading-tight mb-1">
                        {edu.fieldOfStudy}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mb-3">{edu.institution}</p>
                      {edu.description && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-2 mt-2 italic">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Detailed Skill Matrix Categories */}
          {vis.skills && (
            <section id="detailed-competencies" className="space-y-8 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                Proficiency Metrics Matrix
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['frontend', 'backend', 'devops', 'tools'].map((catTier) => {
                const s = portfolioData.skills.filter(sk => sk.category === catTier);
                if (s.length === 0) return null;

                const prettyHeaders: Record<string, string> = {
                  frontend: 'Frontend Systems & Styling Frameworks',
                  backend: 'Backend APIs & Relational Storage',
                  devops: 'Clouds & CI/CD Pipelines Deployment',
                  tools: 'Testing, CLI & Prototyping Utilities'
                };

                return (
                  <div key={catTier} className="bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
                    <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                      {prettyHeaders[catTier] || catTier}
                    </h4>
                    
                    <div className="space-y-4">
                      {s.map((sk) => (
                        <div key={sk.id} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-bold text-[var(--text-primary)]">{sk.name}</span>
                            <span className="font-mono text-[10px] text-[var(--text-secondary)] font-bold">
                              {sk.level} • {sk.proficiency}%
                            </span>
                          </div>
                          <div className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-1000" 
                              style={{ width: `${sk.proficiency}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          )}

          {/* Publications Section */}
          {vis.publications && portfolioData.publications && portfolioData.publications.length > 0 && (
            <section id="detailed-publications" className="space-y-8 scroll-mt-24">
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Globe className="w-5 h-5 text-[var(--accent-primary)]" />
                <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                  Publications & Research Work
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.publications.map((pub) => (
                  <div key={pub.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col justify-between hover:border-[var(--accent-primary)]/45 shadow-sm transition-all duration-300">
                    <div>
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-3 pb-2.5 border-b border-[var(--border-color)]/60">
                        <div className="flex flex-wrap items-center gap-2">
                          {pub.publicationDate ? (
                            <span className="text-[10px] font-mono font-bold uppercase text-[var(--accent-primary)] bg-[var(--accent-light)] px-2.5 py-1 rounded flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[var(--accent-primary)]" /> {pub.publicationDate}
                            </span>
                          ) : pub.year ? (
                            <span className="text-[10px] font-mono font-bold uppercase text-[var(--accent-primary)] bg-[var(--accent-light)] px-2.5 py-1 rounded flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[var(--accent-primary)]" /> {pub.year}
                            </span>
                          ) : null}

                          {pub.pdfFileName && (
                            <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded border border-[var(--border-color)]/60 flex items-center gap-1.5 shrink-0 max-w-[150px] truncate" title={pub.pdfFileName}>
                              <FileText className="w-3 h-3 text-[var(--text-secondary)] shrink-0" /> {pub.pdfFileName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {pub.pdfUrl && (
                            <a
                              href={pub.pdfUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md transition-colors border border-emerald-200/50 dark:border-emerald-850"
                            >
                              <Download className="w-3.5 h-3.5" /> Download PDF
                            </a>
                          )}
                          {pub.url && (
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              Read Info <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)] leading-tight mb-2 font-display">
                        {pub.title}
                      </h4>
                      <p className="text-xs text-[var(--text-primary)] font-medium mb-1">
                        Authors: <span className="font-semibold text-[var(--text-secondary)]">{pub.authors}</span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mb-3 font-medium">
                        Venue: <span className="italic">{pub.journal}</span>
                      </p>
                      {pub.description && (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)]/60 pt-2.5 mt-2">
                          {pub.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full Blogs Archive list */}
          {vis.blogs && (
            <section id="detailed-journal" className="space-y-8 sm:space-y-10 scroll-mt-24">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <BookOpen className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                Comprehensive Insights & Articles
              </h2>
            </div>

            {portfolioData.blogs.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No blogs currently set. Open CMS.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioData.blogs.map((article) => (
                  <article 
                    key={article.id}
                    onClick={() => setSelectedBlog(article)}
                    className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] rounded-2xl p-6 hover:border-[var(--accent-primary)]/45 shadow-sm transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="flex gap-4 sm:gap-5">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)] bg-[var(--bg-tertiary)] select-none">
                        <img 
                          src={article.coverImage} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono">
                          <span className="bg-[var(--accent-light)] text-[var(--accent-primary)] font-bold uppercase px-2 py-0.5 rounded leading-none">
                            {article.category}
                          </span>
                          <span className="text-[var(--text-secondary)]">{article.date}</span>
                        </div>
                        <h4 className="font-display font-bold text-sm tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mb-1.5 line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5" /> Read Time: {article.readTime}
                      </span>
                      <span className="group-hover:translate-x-1 duration-200 transition-transform text-[var(--accent-primary)] font-bold flex items-center">
                        Read Article Log <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          )}

        </div>

      </main>

      {/* ──────────────────────────────────────────────────────────────────
          Footer Segmentations
          ────────────────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-8 mt-12 text-center text-xs text-[var(--text-secondary)] no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} {portfolioData.profile.name}. Handcrafted utilizing React 19, TypeScript, and Tailwind v4.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
            >
              Scroll to Top
            </button>
            {isDevMode && (
              <>
                <span className="text-[var(--border-color)]">|</span>
                <button
                  onClick={() => setIsCmsOpen(true)}
                  className="hover:underline hover:text-[var(--accent-primary)] font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" /> Dashboard Login
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* ──────────────────────────────────────────────────────────────────
          MODAL LIGHTBOX: Project In-Depth Analytical View
          ────────────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-fade-in">
          <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Aspect image cover banner */}
            <div className="relative aspect-video border-b border-[var(--border-color)]">
              <img 
                src={selectedProject.coverImage} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors"
                aria-label="Close project log"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-[var(--accent-light)] text-[var(--accent-primary)] px-2.5 py-1 rounded inline-block mb-3 select-none">
                  Portfolio Documentation
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">
                  {selectedProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic mt-1 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
                  {selectedProject.briefDescription}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1 mb-2.5">
                  Analytical Breakdown & Systems Overview
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedProject.longDescription}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-[var(--text-secondary)] mb-2">
                  Integrated Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {selectedProject.tags.map((tag) => (
                    <span key={tag} className="text-[10px] sm:text-xs font-mono font-bold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2.5 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Handles links */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border-color)]">
                {selectedProject.githubLink && (
                  <a 
                    href={selectedProject.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider rounded-lg border border-[var(--border-color)] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" /> Source Code
                  </a>
                )}
                {selectedProject.liveLink && (
                  <a 
                    href={selectedProject.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Launch Sandbox
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL LIGHTBOX: Article Reading Overlay
          ────────────────────────────────────────────────────────────────── */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print animate-fade-in">
          <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Header controls inside modal */}
            <div className="p-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] flex justify-between items-center sm:px-6">
              <span className="text-xs font-mono font-bold text-[var(--accent-primary)] flex items-center gap-1 select-none">
                <Bookmark className="w-4 h-4 shrink-0" /> Article: {selectedBlog.category}
              </span>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-xs font-bold cursor-pointer bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--border-color)] border border-[var(--border-color)] px-3 py-1.5 focus:outline-none"
                aria-label="Close article"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Close
              </button>
            </div>

            {/* Reading view body */}
            <div className="overflow-y-auto p-6 scroll-smooth sm:p-10 flex-1 space-y-6">
              
              <div className="space-y-3.5">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-display mb-1">
                  {selectedBlog.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-mono border-b border-[var(--border-color)] pb-4.5">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> Published {selectedBlog.date}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {selectedBlog.readTime}
                  </span>
                </div>
              </div>

              {/* Cover cover illustration */}
              {selectedBlog.coverImage && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-sm bg-[var(--bg-tertiary)]">
                  <img 
                    src={selectedBlog.coverImage} 
                    alt={selectedBlog.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Render article body text blocks */}
              <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-4 font-sans max-w-none pr-1">
                {selectedBlog.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h4 key={index} className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-display pt-4 border-l-3 border-[var(--accent-primary)] pl-3">
                        {paragraph.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (paragraph.startsWith('* ')) {
                    const bullets = paragraph.split('\n').filter(Boolean);
                    return (
                      <ul key={index} className="list-disc list-inside space-y-1 pl-4 text-xs font-medium">
                        {bullets.map((b, i) => (
                          <li key={i}>{b.replace('* ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('// ') || paragraph.startsWith('```')) {
                    return (
                      <pre key={index} className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono text-xs p-4 rounded-xl border border-[var(--border-color)] overflow-x-auto select-all leading-normal">
                        <code>{paragraph.replace(/```tsx|```typescript|```/g, '').trim()}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={index} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

            </div>

            {/* Read bottom button */}
            <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex justify-end">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Mark as read
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          CMS DASHBOARD OVERLAY MODAL (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isCmsOpen && isDevMode && (
        <CMSDashboard 
          data={portfolioData}
          onUpdateData={handleUpdateData}
          messages={messages}
          onClearMessages={handleClearMessages}
          onDeleteMessage={handleDeleteMessage}
          onClose={() => setIsCmsOpen(false)}
          currentTheme={theme}
          onThemeChange={setTheme}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PRINT / DOWNLOAD RESUME OVERLAY VIEW (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isResumeOpen && (
        <ResumePDF 
          data={portfolioData}
          onClose={() => setIsResumeOpen(false)}
          printMode={cvPrintMode}
          onChangePrintMode={setCvPrintMode}
          showProfilePic={cvShowProfilePic}
          onChangeShowProfilePic={setCvShowProfilePic}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────
          Print-Only Version styled strictly for US Letter formatting
          * Automatically activates when window.print() is fired.
          ────────────────────────────────────────────────────────────────── */}
      <div className="print-only">
        {cvPrintMode === 'plain' ? (
          <div className="text-black bg-white p-12 space-y-6 text-xs leading-normal font-sans">
            {/* Plain Mode Header / Basic Info */}
            <div className="border-b border-slate-300 pb-5">
              <div className="flex items-center gap-5">
                {cvShowProfilePic && portfolioData.profile.avatarUrl && (
                  <img 
                    src={portfolioData.profile.avatarUrl} 
                    alt={portfolioData.profile.name} 
                    className="w-20 h-20 rounded-full object-cover border border-slate-300 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{portfolioData.profile.name}</h1>
                  <p className="text-sm text-slate-650 font-medium">{portfolioData.profile.resumeSubtitle || portfolioData.profile.title}</p>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-2">Basic Info</h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-slate-700 list-none p-0">
                  {portfolioData.profile.location && <li><strong>Location:</strong> {portfolioData.profile.location}</li>}
                  {portfolioData.profile.email && <li><strong>Email:</strong> {portfolioData.profile.email}</li>}
                  {portfolioData.profile.phone && <li><strong>Phone:</strong> {portfolioData.profile.phone}</li>}
                  {portfolioData.profile.websiteUrl && <li><strong>Website:</strong> {portfolioData.profile.websiteUrl}</li>}
                  {portfolioData.profile.githubUrl && <li><strong>GitHub:</strong> {portfolioData.profile.githubUrl}</li>}
                  {portfolioData.profile.linkedInUrl && <li><strong>LinkedIn:</strong> {portfolioData.profile.linkedInUrl}</li>}
                </ul>
              </div>

              {portfolioData.profile.aboutLong && (
                <div className="mt-4 text-xs text-slate-700 bg-slate-55 p-3 rounded border border-slate-150">
                  <strong>Professional Summary:</strong> {portfolioData.profile.aboutLong}
                </div>
              )}
            </div>

            {/* Section: Work Experience */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-850 border-b border-slate-300 pb-1.5 mb-3">Work Experience</h2>
              <ul className="space-y-4 list-none p-0">
                {portfolioData.experience.map((exp) => (
                  <li key={exp.id} className="text-xs text-slate-700">
                    <div className="flex justify-between font-bold text-slate-900 text-xs text-left">
                      <span>{exp.role} — {exp.company}</span>
                      <span className="font-mono">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5 mb-1">{exp.location}</div>
                    <p className="leading-normal text-[11px]">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[10px] text-slate-600">
                        {exp.achievements.map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section: Education */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-850 border-b border-slate-300 pb-1.5 mb-3">Education</h2>
              <ul className="space-y-3 list-none p-0">
                {portfolioData.education.map((edu) => (
                  <li key={edu.id} className="text-xs text-slate-700">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="font-mono">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{edu.institution}</div>
                    {edu.description && <p className="text-[11px] text-slate-500 italic mt-0.5">{edu.description}</p>}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section: Skills */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-850 border-b border-slate-300 pb-1.5 mb-3">Skills</h2>
              <ul className="grid grid-cols-2 gap-4 list-none p-0">
                {['frontend', 'backend', 'devops', 'tools'].map((cat) => {
                  const catSkills = portfolioData.skills.filter((sk) => sk.category === cat);
                  if (catSkills.length === 0) return null;
                  
                  const labelMap: Record<string, string> = {
                    frontend: 'Frontend Technologies',
                    backend: 'Backend & Databases',
                    devops: 'Infrastructure & Systems',
                    tools: 'Utilities & General'
                  };

                  return (
                    <li key={cat} className="text-xs">
                      <strong className="text-slate-850 block mb-0.5 text-[10px] uppercase tracking-wider">{labelMap[cat] || cat}:</strong>
                      <span className="text-slate-650 font-semibold">
                        {catSkills.map(s => s.name).join(', ')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Publications if present */}
            {portfolioData.publications && portfolioData.publications.length > 0 && (
              <section className="print-page-break">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-855 border-b border-slate-300 pb-1.5 mb-3">Publications</h2>
                <ul className="space-y-4 list-none p-0">
                  {portfolioData.publications.map((pub) => (
                    <li key={pub.id} className="text-xs text-slate-700">
                      <div className="flex justify-between font-bold text-slate-900 text-xs">
                        <span>{pub.title}</span>
                        <span className="font-mono">{pub.publicationDate || pub.year}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {pub.authors} &bull; <span className="italic">{pub.journal}</span>
                      </div>
                      
                      {/* PDF download details */}
                      {(pub.pdfUrl || pub.pdfFileName) && (
                        <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1 bg-slate-50 p-1.5 rounded border border-slate-200 font-mono">
                          {pub.pdfUrl && (
                            <span>
                              <strong>PDF URL:</strong> <a href={pub.pdfUrl} className="underline text-indigo-600 font-medium" target="_blank" rel="noopener noreferrer">{pub.pdfUrl}</a>
                            </span>
                          )}
                          {pub.pdfFileName && (
                            <span>
                              <strong>File:</strong> {pub.pdfFileName}
                            </span>
                          )}
                        </div>
                      )}

                      {pub.description && <p className="text-[11px] text-slate-500 mt-1 leading-normal">{pub.description}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="text-[9px] text-slate-400 font-mono border-t border-slate-200 pt-3 flex justify-between items-center mt-6">
              <span>Plain layout compiled on {new Date().toLocaleDateString()}</span>
              <span>{portfolioData.profile.email}</span>
            </footer>
          </div>
        ) : (
          <div className="text-black bg-white p-12 space-y-6 text-xs leading-normal">
            <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-4">
                  {cvShowProfilePic && portfolioData.profile.avatarUrl && (
                    <img 
                      src={portfolioData.profile.avatarUrl} 
                      alt={portfolioData.profile.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold uppercase font-display text-slate-900">{portfolioData.profile.name}</h1>
                    <h2 className="text-md text-slate-600 font-medium">{portfolioData.profile.resumeSubtitle || portfolioData.profile.title}</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-500">
                  <span>Location: {portfolioData.profile.location}</span>
                  <span>Email: {portfolioData.profile.email}</span>
                  <span>Phone: {portfolioData.profile.phone}</span>
                  <span>Website: {portfolioData.profile.websiteUrl || currentUrl}</span>
                </div>
              </div>
              {/* Printable QR backlink */}
              <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 shrink-0">
                <div className="text-right text-[10px] max-w-[100px] leading-tight text-slate-500">
                  Scan to explore live demo, blogs, and switch themes.
                </div>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(portfolioData.profile.qrOverrideContent || portfolioData.profile.websiteUrl || currentUrl)}`} 
                  alt="Resume QR redirection" 
                  className="w-14 h-14"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <section>
              <h3 className="text-xs uppercase font-bold tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">My Profile</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">{portfolioData.profile.aboutLong}</p>
            </section>

            <section>
              <h3 className="text-xs uppercase font-bold tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Tech Stacks</h3>
              <div className="grid grid-cols-4 gap-4 text-[11px]">
                {['frontend', 'backend', 'devops', 'tools'].map((cat) => {
                  const s = portfolioData.skills.filter(sk => sk.category === cat);
                  if (s.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="font-bold text-slate-800 uppercase text-[10px] mb-1">{cat}</h4>
                      <span className="text-slate-600 font-medium">{s.map(i => i.name).join(', ')}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase font-bold tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Work History</h3>
              <div className="space-y-4">
                {portfolioData.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between font-bold text-slate-900 text-xs">
                      <span>{exp.role} @ {exp.company}</span>
                      <span>{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mb-1">{exp.location}</p>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{exp.description}</p>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 pl-1 mt-1">
                      {exp.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase font-bold tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Academics</h3>
              <div className="space-y-2">
                {portfolioData.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.degree} in {edu.fieldOfStudy}</span>
                      <span>{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-medium">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

    </div>
  );
}
