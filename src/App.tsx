/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, GraduationCap, Code, Layers, BookOpen, Mail, 
  Settings, Printer, ChevronLeft, ChevronRight, Github, Linkedin, ExternalLink, 
  MapPin, Phone, Globe, Calendar, Clock, Send, MessageSquare, 
  CheckCircle, ArrowUpRight, ArrowLeft, Bookmark, X, RotateCw, RotateCcw,
  FileText, Download, Sparkles, BarChart2, Maximize2, Activity, Terminal, ShieldAlert, Copy
} from 'lucide-react';
import { PortfolioData, Project, BlogPost, SubmittedMessage, Publication } from './types';
import { defaultPortfolioData } from './defaultData';
import { ThemeSelector, ThemePresetVal, THEME_OPTIONS } from './components/ThemeSelector';
import { CMSDashboard } from './components/CMSDashboard';
import { ResumePDF } from './components/ResumePDF';
import { AiAssistantModal } from './components/AiAssistantModal';
import { TokenStatsModal } from './components/TokenStatsModal';
import { GanttChart } from './components/GanttChart';
import { sortTimelineItems } from './utils/dateSorter';

interface ParsedLog {
  ip?: string;
  timestamp?: string;
  callType?: string;
  agent?: string;
  protocol?: string;
  model?: string;
  endpoint?: string;
  system?: string;
  maxTokens?: string;
  httpCode?: string;
  elapsedSec?: string;
  inputToks?: string;
  outputToks?: string;
  totalToks?: string;
  messageQuestion?: string;
  conversationHistory?: string;
  responseOutput?: string;
  raw: string;
}

function parseLogFile(raw: string): ParsedLog {
  const result: ParsedLog = { raw };
  
  const fields: { key: keyof ParsedLog; pattern: RegExp }[] = [
    { key: 'ip', pattern: /Source IP\s*:\s*(.*)/i },
    { key: 'timestamp', pattern: /Timestamp\s*:\s*(.*)/i },
    { key: 'callType', pattern: /Call Type\s*:\s*(.*)/i },
    { key: 'agent', pattern: /Agent\s*:\s*(.*)/i },
    { key: 'protocol', pattern: /Protocol\s*:\s*(.*)/i },
    { key: 'model', pattern: /Model\s*:\s*(.*)/i },
    { key: 'endpoint', pattern: /Endpoint\s*:\s*(.*)/i },
    { key: 'system', pattern: /System\s*:\s*(.*)/i },
    { key: 'maxTokens', pattern: /Max Tokens\s*:\s*(.*)/i },
    { key: 'httpCode', pattern: /HTTP Code\s*:\s*(.*)/i },
    { key: 'elapsedSec', pattern: /Elapsed\s*:\s*(.*)/i },
    { key: 'inputToks', pattern: /Input Toks\s*:\s*(.*)/i },
    { key: 'outputToks', pattern: /Output Toks\s*:\s*(.*)/i },
    { key: 'totalToks', pattern: /Total Toks\s*:\s*(.*)/i },
  ];

  fields.forEach(({ key, pattern }) => {
    const match = raw.match(pattern);
    if (match) {
      result[key] = match[1].trim();
    }
  });

  // Extract sections
  const msgIndex = raw.indexOf('--- Message / Question ---');
  const convIndex = raw.indexOf('--- CONVERSATION HISTORY ---');
  const responseHeaderIndex = raw.indexOf('--- Response Output ---');
  const endLogIndex = raw.indexOf('END OF LOG');

  if (msgIndex !== -1) {
    const end = convIndex !== -1 ? convIndex : (raw.indexOf('RESPONSE') !== -1 ? raw.indexOf('RESPONSE') : raw.length);
    result.messageQuestion = raw.substring(msgIndex + '--- Message / Question ---'.length, end).trim();
  }

  if (convIndex !== -1) {
    const end = raw.indexOf('RESPONSE') !== -1 ? raw.indexOf('RESPONSE') : raw.length;
    result.conversationHistory = raw.substring(convIndex + '--- CONVERSATION HISTORY ---'.length, end).trim();
  }

  if (responseHeaderIndex !== -1) {
    const end = endLogIndex !== -1 ? endLogIndex : raw.length;
    result.responseOutput = raw.substring(responseHeaderIndex + '--- Response Output ---'.length, end).trim();
  }

  return result;
}

export default function App() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 1. Core Profile & Portfolio State
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => {
    let data = defaultPortfolioData;
    const cached = localStorage.getItem('developer-portfolio-schema');
    if (cached) {
      try {
        data = JSON.parse(cached);
      } catch (err) {
        console.error('Failed to parse cached portfolio data', err);
      }
    }
    // Auto-sort timeline part on load
    if (data.experience) {
      data.experience = sortTimelineItems(data.experience);
    }
    if (data.education) {
      data.education = sortTimelineItems(data.education);
    }
    return data;
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [cvPrintMode, setCvPrintMode] = useState<'fancy' | 'plain'>('fancy');
  const [cvShowProfilePic, setCvShowProfilePic] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectCarouselIndex, setProjectCarouselIndex] = useState(0);
  const [isProjectDescExpanded, setIsProjectDescExpanded] = useState(false);
  const [expandedPubs, setExpandedPubs] = useState<Record<string, boolean>>({});
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  const [showBentoGantt, setShowBentoGantt] = useState<boolean>(false);
  const [showDetailedGantt, setShowDetailedGantt] = useState<boolean>(true);

  useEffect(() => {
    setProjectCarouselIndex(0);
    setIsProjectDescExpanded(false);
  }, [selectedProject]);

  // Global Escape key event handler to return to all closed popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullScreenImageUrl) {
          setFullScreenImageUrl(null);
        } else {
          setSelectedProject(null);
          setSelectedBlog(null);
          setIsAiModalOpen(false);
          setIsStatsOpen(false);
          setIsResumeOpen(false);
          setIsCmsOpen(false);
          setIsSettingsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenImageUrl]);



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

  // 8. Mode Context (Only show CMS controls when ?mode=dev or help copy when ?mode=copy)
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'dev';
  });
  const [isCopyMode, setIsCopyMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'copy';
  });
  const [isJsonMode, setIsJsonMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'json';
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);
  const [jsonSaveSuccess, setJsonSaveSuccess] = useState<boolean>(false);

  const handleSetMode = (mode: string | null) => {
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set('mode', mode);
    } else {
      url.searchParams.delete('mode');
    }
    window.history.pushState({}, '', url.toString());
    
    // Synchronize states
    setIsDevMode(mode === 'dev');
    setIsCopyMode(mode === 'copy');
    setIsJsonMode(mode === 'json');
  };

  // Sync rawJsonText when JSON Mode is opened
  useEffect(() => {
    if (isJsonMode) {
      setRawJsonText(JSON.stringify(portfolioData, null, 2));
      setJsonValidationError(null);
      setJsonSaveSuccess(false);
    }
  }, [isJsonMode, portfolioData]);

  // 9. AmiruLLM Chatbot State
  const [isFullscreenChat, setIsFullscreenChat] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('fullscreen') === 'chat';
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatElapsedTime, setChatElapsedTime] = useState(0);
  const [chatLengthMode, setChatLengthMode] = useState<'short' | 'long'>('short');
  const [chatToneMode, setChatToneMode] = useState<'professional' | 'funny' | 'arrogant'>('professional');
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isDonation?: boolean;
  }[]>([]);

  // 10. AmiruLLM Fullscreen Advanced Features Tab & API States
  const [fullscreenLeftTab, setFullscreenLeftTab] = useState<'budget' | 'logs' | 'quota' | 'comparison'>('budget');
  const [hideChatInComparison, setHideChatInComparison] = useState<boolean>(true);
  const [jobDescriptionInput, setJobDescriptionInput] = useState<string>('');
  const [comparisonReport, setComparisonReport] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState<boolean>(false);
  const [coverLetterError, setCoverLetterError] = useState<string>('');
  const [selectedLogFilename, setSelectedLogFilename] = useState<string | null>(null);
  const [activeLogSectionTab, setActiveLogSectionTab] = useState<'overview' | 'dialogue' | 'raw'>('overview');
  const [copiedLogStatus, setCopiedLogStatus] = useState<boolean>(false);
  const [copiedItemKey, setCopiedItemKey] = useState<string | null>(null);
  const [apiLogsData, setApiLogsData] = useState<any>(null);
  const [apiLogsLoading, setApiLogsLoading] = useState<boolean>(false);
  const [apiLogsError, setApiLogsError] = useState<string>('');

  const [apiQuotaData, setApiQuotaData] = useState<any>(null);
  const [apiQuotaLoading, setApiQuotaLoading] = useState<boolean>(false);
  const [apiQuotaError, setApiQuotaError] = useState<string>('');

  const fetchApiLogs = async () => {
    setApiLogsLoading(true);
    setApiLogsError('');
    try {
      const response = await fetch('https://amirul.cloud/app/API.php?info=mylogs');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      setApiLogsData(data);
    } catch (e: any) {
      console.error("Error fetching logs:", e);
      setApiLogsError(e.message || 'Failed to retrieve logs from server.');
    } finally {
      setApiLogsLoading(false);
    }
  };

  const fetchApiQuota = async () => {
    setApiQuotaLoading(true);
    setApiQuotaError('');
    try {
      const response = await fetch('https://amirul.cloud/app/API.php?info=myquota');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      setApiQuotaData(data);
    } catch (e: any) {
      console.error("Error fetching quota:", e);
      // Fallback state assuming maxed tokens and allowed false as requested
      const fallbackQuota = {
        ip: "113.211.212.159",
        quota: {
          limit_24h: 50000,
          used_24h: 53510,
          remaining_24h: 0,
          calls_24h: 7,
          reset_at: "2026-06-28T05:51:45+00:00",
          allowed: false
        },
        all_time: {
          total_calls: 7,
          total_tokens: 53510
        },
        timestamp: new Date().toISOString()
      };
      setApiQuotaData(fallbackQuota);
      setApiQuotaError(e.message || 'Daily limit reached. Server requires Touch \'n Go sponsorship.');
    } finally {
      setApiQuotaLoading(false);
    }
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItemKey(key);
    setTimeout(() => {
      setCopiedItemKey((current) => current === key ? null : current);
    }, 2000);
  };

  useEffect(() => {
    if (isFullscreenChat) {
      if (fullscreenLeftTab === 'logs') {
        fetchApiLogs();
      } else if (fullscreenLeftTab === 'quota') {
        fetchApiQuota();
      }
    }
  }, [fullscreenLeftTab, isFullscreenChat]);

  // Timer Effect to calculate live duration while chatbot represents a request
  useEffect(() => {
    let timerId: any;
    if (isChatLoading) {
      setChatElapsedTime(0);
      timerId = setInterval(() => {
        setChatElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setChatElapsedTime(0);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isChatLoading]);

  // Initialize AmiruLLM floating greeting message
  useEffect(() => {
    setChatMessages([
      {
        id: 'msg_greet',
        role: 'assistant',
        content: `Hi there! I am AmiruLLM, the Virtual AI Career Representative for ${portfolioData.profile.name || 'Amirul Sadikin'}. Ask me questions regarding my experience in computer vision, research publications, or core technologies!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [portfolioData.profile.name]);

  const handleRestartConversation = () => {
    console.log("%c==================== AMIRULLM CONVERSATION RESTARTED ====================", "color: #e11d48; font-weight: bold;");
    setChatMessages([
      {
        id: `msg_greet_${Date.now()}`,
        role: 'assistant',
        content: `Hi there! I am AmiruLLM, the Virtual AI Career Representative for ${portfolioData.profile.name || 'Amirul Sadikin'}. Ask me questions regarding my experience in computer vision, research publications, or core technologies!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setIsChatLoading(false);
  };

  const calculateLocalMatchScore = (jd: string): number => {
    const text = jd.toLowerCase();
    let score = 70; // baseline
    if (text.includes('python') || text.includes('pytorch') || text.includes('yolo')) score += 10;
    if (text.includes('react') || text.includes('typescript')) score += 8;
    if (text.includes('laravel') || text.includes('php') || text.includes('mysql')) score += 7;
    if (text.includes('.net') || text.includes('c#')) score -= 3; // compensated in report
    if (text.includes('computer vision') || text.includes('ai') || text.includes('image')) score += 10;
    return Math.min(98, Math.max(50, score));
  };

  const buildLocalFallbackReport = (jd: string, score: number): string => {
    const text = jd.toLowerCase();
    const hasDotNet = text.includes('.net') || text.includes('c#');
    const hasLaravel = text.includes('laravel');

    let report = `### MATCH SCORE: ${score}%\n\n`;
    report += `#### Match Summary & Alignment Analytics\n`;
    report += `AmiruLLM has evaluated the job description against AMIRUL SADIKIN's master CV and professional background. With a **${score}% alignment score**, the candidate presents an exceptional fit, especially in intelligent systems architecture, real-time data streaming, and full-stack web platforms.\n\n`;

    report += `#### Key Strengths & Core Synergies\n`;
    report += `- **Computer Vision & AI Pipelines**: Expert in training PyTorch models, deploying real-time event detectors (YOLO, DeepSORT), and managing video streams.\n`;
    report += `- **Full-Stack Engineering & Scalable backends**: Proven capability in building robust applications using TypeScript, Node.js, PHP, PostgreSQL, and Redis.\n`;
    report += `- **Agile Problem Solver**: Master's degree in Computer Science (Artificial Intelligence) combined with a hands-on 'MacGyver' engineering mentality.\n\n`;

    report += `#### Potential Skill Gaps & Strategic Compensations\n`;
    if (hasDotNet) {
      report += `- **Requirement: .NET / C# (CV Gap compensated)**: Although .NET is requested and not directly listed as a primary language on his current CV, Amirul possesses extremely deep system foundations in C++, Python, and Node.js. Since programming concepts translate fluidly across modern typing and runtime systems, his core expertise in PyTorch and asynchronous network architectures guarantees he can adapt and achieve production efficiency in the .NET framework within days.\n`;
    } else {
      report += `- **Requirement: Enterprise Backend Ecosystems (CV Gap compensated)**: If alternative enterprise backends like .NET, Java, or Go are required, Amirul's deep systems software foundation in high-performance Python engines (FastAPI) and TypeScript/Node.js guarantees a smooth and virtually instant technical onboarding.\n`;
    }

    if (hasLaravel) {
      report += `- **Requirement: Laravel & PHP (High Match)**: Fully covered! Amirul has substantial experience using PHP and Laravel, MySQL, and modern responsive interfaces to build complete administration dashboards, custom labeling systems, and APIs.\n`;
    } else {
      report += `- **Requirement: MVC & Laravel Systems**: Laravel is built on the MVC (Model-View-Controller) architecture. Amirul has extensive experience in full-stack web applications, PHP/Laravel, Node.js/Express, and React, so transition to any modern MVC paradigm is completely trivial from a fundamental engineering standpoint.\n`;
    }

    report += `\n#### Recommended Next Steps for Hiring Teams\n`;
    report += `1. **Technical Briefing**: Initiate an interview to discuss his real-time computer vision deployment pipelines (Butterfly Innovative Tech).\n`;
    report += `2. **System Design Task**: Assign a small, complex backend or architecture problem to witness his quick learning loop and clean design patterns in real-time.\n`;
    report += `3. **Reference Verification**: Verify his outstanding history as a Research Assistant and systems solver.`;

    return report;
  };

  const handleJobComparison = async () => {
    if (!jobDescriptionInput.trim()) {
      setComparisonError("Please paste a valid job description to evaluate.");
      return;
    }
    setIsComparing(true);
    setComparisonError('');
    setComparisonReport('');

    const startTime = Date.now();
    const finalUrl = 'https://amirul.cloud/app/API.php';

    try {
      const fullJsonStr = JSON.stringify(portfolioData, null, 2);
      const prompt = `Act as AmiruLLM, the Virtual AI Career Representative for AMIRUL SADIKIN.
Perform a highly comprehensive, objective, and professional Job Description Comparison and Alignment Report for the candidate against the provided Job Description.

Candidate Resume/Portfolio Details (full JSON):
${fullJsonStr}

Job Description to Compare:
${jobDescriptionInput}

MANDATE FOR THE COMPARISON REPORT:
1. Provide a "Match Summary & Estimated Fit Score" (percentage). Make sure to output the score clearly in the format: "MATCH SCORE: XX%" (e.g. MATCH SCORE: 85%).
2. Detail the "Key Strengths & Synergies" (where the candidate excels, like React, TypeScript, Python, PyTorch, computer vision developer role, YOLO, Laravel, databases).
3. Identify "Potential Skill Gaps & Gaps Compensation" with high-fidelity, positive reassurance for the employer:
   - For any skills/technologies mentioned in the job description that are NOT found in the candidate's CV (such as .NET, C#, Java, Go, etc.), provide "added compensation" in the description. Explain that the candidate is an expert in other core backend/systems ecosystems (Node.js, Express, FastApi, Python, PHP, databases) and possesses extreme adaptability, fast learning loops, and deep analytical foundations to bridge the gap in no time.
   - For example, if .NET / C# is required but not in the CV, suggest their strong PyTorch / Python / Node.js background makes them highly capable of transferring system concepts.
   - Specifically, if Laravel or general MVC architecture is mentioned, highlight that "Laravel is an MVC framework, which is fundamentally similar to their backend and web systems background and therefore not far off from a software engineering standpoint" (and indeed, he has PHP and Laravel experience).
4. Provide customized "Recommended Next Steps" to proceed with interviewing or onboarding.

Output the report in elegant, clean markdown with high readability, spacing, and bullet points.`;

      // Pretty print database & conversation details for high-fidelity developer debugging
      console.log("%c==================== AMIRULLM OUTGOING CONTEXT DEBUG ====================", "color: #4f46e5; font-weight: bold; font-size: 11px;");
      console.log("%c[Profile Scope]%c candidate details payload mapped:", "color: #9333ea; font-weight: bold;", "color: inherit;", JSON.parse(fullJsonStr));
      console.log("%c[Job Match Scope]%c comparison request sent to backend", "color: #9333ea; font-weight: bold;", "color: inherit;");
      console.log("%c[Network Target]%c target API URL with POST payload:", "color: #9333ea; font-weight: bold;", "color: inherit;", finalUrl);
      console.log("==========================================================================");

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt
        })
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[AmiruLLM Job Matcher Debug] Received API status ${response.status} in ${duration}s (Expected minimum ~7.0s)`);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const rawText = await response.text();
      let replyValue = '';
      try {
        const jsonResult = JSON.parse(rawText);
        if (jsonResult && jsonResult.choices && jsonResult.choices[0] && jsonResult.choices[0].message && jsonResult.choices[0].message.content) {
          replyValue = jsonResult.choices[0].message.content;
        } else if (jsonResult.response) {
          replyValue = jsonResult.response;
        } else if (jsonResult.message) {
          replyValue = jsonResult.message;
        } else if (jsonResult.text) {
          replyValue = jsonResult.text;
        } else if (jsonResult.reply) {
          replyValue = jsonResult.reply;
        } else {
          replyValue = typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult);
        }
      } catch (e) {
        replyValue = rawText;
      }

      if (!replyValue || !replyValue.trim()) {
        throw new Error("Received empty response");
      }

      setComparisonReport(replyValue.trim());

      // Save Telemetry metrics for Job Matcher run
      try {
        let pTokens = 0;
        let cTokens = 0;
        let tTokens = 0;
        let rTokens = 0;
        let caTokens = 0;

        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(rawText);
        } catch (e) {}

        if (parsedJson && parsedJson.usage) {
          const usageObj = parsedJson.usage;
          pTokens = usageObj.prompt_tokens || 0;
          cTokens = usageObj.completion_tokens || 0;
          tTokens = usageObj.total_tokens || (pTokens + cTokens);
          
          if (usageObj.completion_tokens_details) {
            rTokens = usageObj.completion_tokens_details.reasoning_tokens || 0;
          }
          if (usageObj.prompt_tokens_details) {
            caTokens = usageObj.prompt_tokens_details.cached_tokens || 0;
          }
        } else {
          pTokens = Math.max(150, Math.floor((prompt || '').length / 4.2));
          cTokens = Math.max(100, Math.floor(replyValue.length / 3.8));
          tTokens = pTokens + cTokens;
          rTokens = Math.floor(cTokens * 0.22);
          caTokens = Math.floor(pTokens * 0.5);
        }

        const runLog: any[] = [];
        const existingLogs = localStorage.getItem('amirullm-token-usage-history');
        if (existingLogs) {
          try {
            const parsed = JSON.parse(existingLogs);
            if (Array.isArray(parsed)) {
              runLog.push(...parsed);
            }
          } catch (err) {}
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        runLog.push({
          id: `tx_real_comparison_${Date.now()}`,
          timestamp: `${dateStr} ${timeStr}`,
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: tTokens,
          reasoningTokens: rTokens,
          cachedTokens: caTokens,
          mode: 'comparison'
        });

        localStorage.setItem('amirullm-token-usage-history', JSON.stringify(runLog));
        console.log("%c[AmiruLLM Telemetry Captured (Job Matcher)]%c recorded usage values:", "color: #10b981; font-weight: bold;", "color: inherit;", {
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: tTokens,
          reasoningTokens: rTokens,
          cachedTokens: caTokens
        });
      } catch (logErr) {
        console.error("Telemetry tracker exception", logErr);
      }

      // Automatically refresh logs and quota list
      fetchApiLogs();
      fetchApiQuota();

    } catch (err: any) {
      console.error("Comparison request failed, fallback initiated:", err);
      const score = calculateLocalMatchScore(jobDescriptionInput);
      const generatedFallbackReport = buildLocalFallbackReport(jobDescriptionInput, score);
      setComparisonReport(generatedFallbackReport);
    } finally {
      setIsComparing(false);
    }
  };

  const downloadCoverLetter = () => {
    if (!coverLetter) return;
    const element = document.createElement("a");
    const file = new Blob([coverLetter], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `Amirul_Sadikin_Cover_Letter_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const buildLocalFallbackCoverLetter = (jd: string): string => {
    const text = jd.toLowerCase();
    let roleTitle = "Full-Stack Software Engineer / AI Specialist";
    if (text.includes("vision") || text.includes("pytorch") || text.includes("yolo")) {
      roleTitle = "Computer Vision & Deep Learning Specialist";
    } else if (text.includes("laravel") || text.includes("php")) {
      roleTitle = "Senior Full-Stack MVC Engineer (Laravel & React)";
    } else if (text.includes("react") || text.includes("typescript") || text.includes("frontend")) {
      roleTitle = "Senior Full-Stack Engineer (React & TypeScript)";
    }

    let letter = `Dear Hiring Team,\n\n`;
    letter += `I am writing to express my enthusiastic interest in the ${roleTitle} position. With a Master’s degree in Computer Science specializing in Artificial Intelligence and hands-on experience deploying complex machine learning pipelines and scalable web architectures, I am eager to contribute to your team's engineering goals.\n\n`;
    
    letter += `Throughout my career, I have thrived on bridging advanced research with production-grade engineering:\n`;
    letter += `- **Intelligent Systems**: I have designed real-time object detection and tracking pipelines using PyTorch, YOLO, and GStreamer, managing asynchronous video streams with minimal latency.\n`;
    letter += `- **Scalable Web Architectures**: I have built secure, full-stack systems using React, TypeScript, Node.js, PHP, and Laravel, coupled with high-concurrency storage systems like PostgreSQL, Redis, and MySQL.\n`;
    letter += `- **Adaptability & Engineering Rigor**: Known for a 'MacGyver' mindset, I excel at dissecting high-ambiguity requirements, adopting unfamiliar technologies rapidly (such as quickly mastering complex database optimization or enterprise workflows), and delivering clean, maintainable, well-tested code.\n\n`;

    if (text.includes("laravel") || text.includes("php")) {
      letter += `I am particularly excited about your focus on MVC frameworks and robust backends. Having developed bespoke systems with Laravel and PHP, I understand the importance of elegant model relationships, secure request cycles, and streamlined middleware orchestration.\n\n`;
    } else if (text.includes(".net") || text.includes("c#") || text.includes("java")) {
      letter += `While my immediate CV showcases extensive work in Python, TypeScript, and PHP, my deep software systems foundation allows me to seamlessly transition into other robust backend ecosystems. I am highly confident in mastering your tech stack and bringing immediate architectural value to your workflows.\n\n`;
    }

    letter += `I would welcome the opportunity to discuss how my combination of technical depth, fast learning loops, and passion for elegant systems can serve your objectives. Thank you for your time and consideration.\n\n`;
    letter += `Sincerely,\n`;
    letter += `Amirul Sadikin\n`;
    letter += `Virtual Representative: AmiruLLM`;

    return letter;
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescriptionInput.trim()) {
      setCoverLetterError("Please paste a valid job description first.");
      return;
    }
    setIsGeneratingCoverLetter(true);
    setCoverLetterError('');
    setCoverLetter('');

    const startTime = Date.now();
    const finalUrl = 'https://amirul.cloud/app/API.php';

    try {
      const fullJsonStr = JSON.stringify(portfolioData, null, 2);
      const prompt = `Act as AmiruLLM, the Virtual AI Career Representative for AMIRUL SADIKIN.
Generate a highly professional, persuasive, and custom-tailored COVER LETTER for the candidate, specifically written in response to the target Job Description below.

Candidate Resume/Portfolio Details (full JSON):
${fullJsonStr}

Job Description:
${jobDescriptionInput}

MANDATE FOR THE COVER LETTER:
1. Address the cover letter to "Hiring Team" or "Hiring Manager".
2. Tailor the opening paragraph directly to the job role or themes specified in the job description.
3. Highlight relevant core technical strengths of Amirul (such as PyTorch/YOLO/computer vision pipelines, React/TypeScript web apps, PHP/Laravel architectures, and databases), matching them directly with the key requirements of the job description.
4. Address any tech stack gaps (like C#, .NET, Go, etc.) beautifully and confidently, highlighting his strong computer science master's foundation, high systems agility, and proven quick-learning capability.
5. End with a strong, highly professional closing and call to action.
6. Write in a clear, compelling, respectful, and articulate tone. Keep formatting professional with clean line breaks and paragraphs (suitable for copy-pasting or saving as a PDF/text file). Do not use placeholders like [Your Name] or [Date] - output actual details (using AMIRUL SADIKIN, Virtual Rep AmiruLLM, etc.) so it's fully ready.`;

      console.log("%c==================== AMIRULLM OUTGOING COVER LETTER DEBUG ====================", "color: #10b981; font-weight: bold; font-size: 11px;");
      console.log("%c[Profile Scope]%c candidate details payload mapped:", "color: #06b6d4; font-weight: bold;", "color: inherit;", JSON.parse(fullJsonStr));
      console.log("%c[Network Target]%c target API URL:", "color: #06b6d4; font-weight: bold;", "color: inherit;", finalUrl);
      console.log("==========================================================================");

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt
        })
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[AmiruLLM Cover Letter Debug] Received API status ${response.status} in ${duration}s`);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const rawText = await response.text();
      let replyValue = '';
      try {
        const jsonResult = JSON.parse(rawText);
        if (jsonResult && jsonResult.choices && jsonResult.choices[0] && jsonResult.choices[0].message && jsonResult.choices[0].message.content) {
          replyValue = jsonResult.choices[0].message.content;
        } else if (jsonResult.response) {
          replyValue = jsonResult.response;
        } else if (jsonResult.message) {
          replyValue = jsonResult.message;
        } else if (jsonResult.text) {
          replyValue = jsonResult.text;
        } else if (jsonResult.reply) {
          replyValue = jsonResult.reply;
        } else {
          replyValue = typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult);
        }
      } catch (e) {
        replyValue = rawText;
      }

      if (!replyValue || !replyValue.trim()) {
        throw new Error("Received empty response");
      }

      setCoverLetter(replyValue.trim());

      // Save Telemetry metrics for Cover Letter run
      try {
        let pTokens = 0;
        let cTokens = 0;
        let tTokens = 0;
        let rTokens = 0;
        let caTokens = 0;

        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(rawText);
        } catch (e) {}

        if (parsedJson && parsedJson.usage) {
          const usageObj = parsedJson.usage;
          pTokens = usageObj.prompt_tokens || 0;
          cTokens = usageObj.completion_tokens || 0;
          tTokens = usageObj.total_tokens || (pTokens + cTokens);
          
          if (usageObj.completion_tokens_details) {
            rTokens = usageObj.completion_tokens_details.reasoning_tokens || 0;
          }
          if (usageObj.prompt_tokens_details) {
            caTokens = usageObj.prompt_tokens_details.cached_tokens || 0;
          }
        } else {
          pTokens = Math.max(150, Math.floor((prompt || '').length / 4.2));
          cTokens = Math.max(100, Math.floor(replyValue.length / 3.8));
          tTokens = pTokens + cTokens;
          rTokens = Math.floor(cTokens * 0.22);
          caTokens = Math.floor(pTokens * 0.5);
        }

        const runLog: any[] = [];
        const existingLogs = localStorage.getItem('amirullm-token-usage-history');
        if (existingLogs) {
          try {
            const parsed = JSON.parse(existingLogs);
            if (Array.isArray(parsed)) {
              runLog.push(...parsed);
            }
          } catch (err) {}
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        runLog.push({
          id: `tx_real_cover_letter_${Date.now()}`,
          timestamp: `${dateStr} ${timeStr}`,
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: tTokens,
          reasoningTokens: rTokens,
          cachedTokens: caTokens,
          mode: 'cover_letter'
        });

        localStorage.setItem('amirullm-token-usage-history', JSON.stringify(runLog));
      } catch (logErr) {
        console.error("Telemetry tracker exception", logErr);
      }

      fetchApiLogs();
      fetchApiQuota();

    } catch (err: any) {
      console.error("Cover Letter request failed, fallback initiated:", err);
      const generatedFallbackCoverLetter = buildLocalFallbackCoverLetter(jobDescriptionInput);
      setCoverLetter(generatedFallbackCoverLetter);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const renderComparisonReport = (text: string) => {
    if (!text) return null;

    // Parse Match Score first
    const scoreMatch = text.match(/MATCH\s*SCORE:\s*(\d+)%/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 85;

    // Clean match score lines from the text to present cleanly
    const cleanedText = text.replace(/#*\s*MATCH\s*SCORE:\s*\d+%/gi, '').trim();

    // Split into lines/paragraphs or parse simple headers/bullets
    const lines = cleanedText.split('\n');
    const parsedBlocks: React.ReactNode[] = [];

    // Let's render the Match Score gauge beautifully first!
    parsedBlocks.push(
      <div key="score-gauge" className="bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 mb-6 shadow-md animate-fade-in select-none">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">AMIRULLM ALIGNMENT MATCH SCALE</span>
        <div className="relative flex items-center justify-center w-28 h-28 mt-2">
          {/* Circular progress bar */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="52"
              className="stroke-indigo-500"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-black text-slate-100 leading-none">{score}%</span>
            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase mt-1 tracking-wider">FIT SCORE</span>
          </div>
        </div>
        <div className="max-w-md mt-1">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            This job alignment rating represents the compatibility of Amirul's systems, web systems (Laravel/React), and machine learning background with the requested requirements.
          </p>
        </div>
      </div>
    );

    // Let's group lines into sections to render beautifully
    let blockIndex = 0;
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('#### ') || trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const title = trimmed.replace(/^#+\s*/, '');
        parsedBlocks.push(
          <h4 key={`heading-${blockIndex++}`} className="text-xs font-bold uppercase tracking-wider text-indigo-400 mt-6 mb-2.5 font-display border-b border-indigo-500/10 pb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{title}</span>
          </h4>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const item = trimmed.replace(/^[-*]\s*/, '');
        // Check if has bullet name, like **Title**: desc
        const boldMatch = item.match(/^\*\*(.*?)\*\*:(.*)/);
        if (boldMatch) {
          parsedBlocks.push(
            <div key={`li-${blockIndex++}`} className="bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 rounded-xl p-3 mb-2 transition-all text-left">
              <span className="text-[11px] font-extrabold text-slate-200 block mb-1 font-sans flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                {boldMatch[1]}
              </span>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px] pl-3">
                {boldMatch[2]}
              </p>
            </div>
          );
        } else {
          parsedBlocks.push(
            <div key={`li-${blockIndex++}`} className="flex gap-2 p-2 mb-1.5 text-left items-start font-sans text-[11px] text-slate-300 leading-relaxed">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          );
        }
      } else {
        // Plain paragraph
        parsedBlocks.push(
          <p key={`p-${blockIndex++}`} className="text-[11.5px] text-slate-300 leading-relaxed font-sans mb-3 text-left">
            {trimmed}
          </p>
        );
      }
    });

    return (
      <div className="space-y-4 font-sans select-text pb-6">
        {parsedBlocks}
      </div>
    );
  };

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const fullscreenChatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const isFull = params.get('fullscreen') === 'chat';
      setIsFullscreenChat(isFull);
      setIsCopyMode(params.get('mode') === 'copy');
      setIsDevMode(params.get('mode') === 'dev');
      setIsJsonMode(params.get('mode') === 'json');
      if (isFull && params.get('tab') === 'comparison') {
        setFullscreenLeftTab('comparison');
      }
    };
    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, isChatOpen]);

  useEffect(() => {
    if (isFullscreenChat && fullscreenChatEndRef.current) {
      fullscreenChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, isFullscreenChat]);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    const newUserMsgObj = {
      id: `user_msg_${Date.now()}`,
      role: 'user' as const,
      content: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMsgObj]);
    setChatInput('');
    setIsChatLoading(true);

    if (apiQuotaData?.quota?.allowed === false) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: `reply_msg_limit_${Date.now()}`,
          role: 'assistant',
          content: `You are asking a lot of questions and it's reaching the limit for today.

To support the server costs of AmiruLLM, please consider donating:
• **Touch 'n Go**: +0197767497 (AMIRUL SADIKIN)
<img src=https://amirul.cloud/pay.jpg>`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDonation: true
        }]);
        setIsChatLoading(false);
      }, 1200);
      return;
    }

    try {
      // Build full portfolio data JSON context as requested by the user
      const fullJsonStr = JSON.stringify(portfolioData, null, 2);

      // Maintain complete conversation continuity by including all historical messages plus current query
      const fullHistory = [
        ...chatMessages,
        newUserMsgObj
      ];

      const formattedHistory = fullHistory.map(msg => {
        const uppercaseRole = msg.role === 'assistant' ? 'ASSISTANT' : 'USER';
        return `${uppercaseRole}: ${msg.content}`;
      }).join('\n\n');

      // Assemble a default CONTEXT using the required role of assistant asking and answering details about the resume JSON
      const lengthDirective = chatLengthMode === 'short'
        ? "CRITICAL MANDATE: Your response MUST be extremely brief and concise. Under no circumstances should your response exceed 50 words."
        : "CRITICAL MANDATE: Your response should be detailed, comprehensive, and thorough, but MUST NOT exceed 300 words.";

      let toneDirective = "";
      if (chatToneMode === 'professional') {
        toneDirective = "CRITICAL TONE MANDATE: Maintain an extremely professional, helpful, polite, and elegant representation of the candidate.";
      } else if (chatToneMode === 'funny') {
        toneDirective = "CRITICAL TONE MANDATE: Be extremely funny, humorous, playful, and conversational! Crack jokes, make witty puns, and add funny remarks related to the query or resume details wherever possible in your response.";
      } else if (chatToneMode === 'arrogant') {
        toneDirective = "CRITICAL TONE MANDATE: Be arrogant, grumpy, sarcastic, highly confident, and sassy! Act as if you are slightly annoyed or bored by answering these questions, but still answer them with a hilarious, grumpy, superior attitude for fun.";
      }

      const contextTemplate = `Act in the role of an assistant asking and answering questions about the following candidate resume JSON:
${fullJsonStr}

--- SYSTEM CONFIGURATION DIRECTIVES ---
- ${lengthDirective}
- ${toneDirective}

--- CONVERSATION HISTORY ---
${formattedHistory}

User Query message: ${userMsg}`;

      const finalUrl = 'https://amirul.cloud/app/API.php';
      
      const startTime = Date.now();
      
      // Pretty print database & conversation details for high-fidelity developer debugging
      console.log("%c==================== AMIRULLM OUTGOING CONTEXT DEBUG ====================", "color: #4f46e5; font-weight: bold; font-size: 11px;");
      console.log("%c[Profile Scope]%c candidate details payload mapped:", "color: #9333ea; font-weight: bold;", "color: inherit;", JSON.parse(fullJsonStr));
      console.log("%c[Chat Scope]%c conversation history sequence:\n", "color: #9333ea; font-weight: bold;", "color: inherit;", 
        fullHistory.map(m => `  • [${m.role.toUpperCase()}] ${m.timestamp}: "${m.content}"`).join("\n")
      );
      console.log("%c[Network Target]%c target API URL with POST payload:", "color: #9333ea; font-weight: bold;", "color: inherit;", finalUrl);
      console.log("==========================================================================");

      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: contextTemplate
        })
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[AmiruLLM Chatbot Debug] Received API status ${response.status} in ${duration}s (Expected minimum ~7.0s)`);

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      // Read reply securely handling both plaintext & JSON structures (including OpenAI choices/completion style)
      let replyValue = '';
      const rawText = await response.text();
      console.log("[AmiruLLM Chatbot Debug] Raw Response Text:", rawText);

      try {
        const jsonResult = JSON.parse(rawText);
        console.log("[AmiruLLM Chatbot Debug] Parsed JSON Response Object:", jsonResult);
        if (jsonResult && jsonResult.choices && jsonResult.choices[0] && jsonResult.choices[0].message && jsonResult.choices[0].message.content) {
          replyValue = jsonResult.choices[0].message.content;
        } else if (jsonResult.response) {
          replyValue = jsonResult.response;
        } else if (jsonResult.message) {
          replyValue = jsonResult.message;
        } else if (jsonResult.text) {
          replyValue = jsonResult.text;
        } else if (jsonResult.reply) {
          replyValue = jsonResult.reply;
        } else {
          replyValue = typeof jsonResult === 'string' ? jsonResult : JSON.stringify(jsonResult);
        }
      } catch (e) {
        console.log("[AmiruLLM Chatbot Debug] Response is plaintext/not JSON. Using raw text.");
        replyValue = rawText;
      }

      if (!replyValue || !replyValue.trim()) {
        replyValue = "I represent Amirul Sadikin, and while the AmiruLLM brain returned an empty response, I'm delighted to discuss his computer vision, AI, and systems engineering achievements!";
      }

      // amirullm telemetry persistent log saver
      try {
        let pTokens = 0;
        let cTokens = 0;
        let tTokens = 0;
        let rTokens = 0;
        let caTokens = 0;

        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(rawText);
        } catch (e) {}

        if (parsedJson && parsedJson.usage) {
          const usageObj = parsedJson.usage;
          pTokens = usageObj.prompt_tokens || 0;
          cTokens = usageObj.completion_tokens || 0;
          tTokens = usageObj.total_tokens || (pTokens + cTokens);
          
          if (usageObj.completion_tokens_details) {
            rTokens = usageObj.completion_tokens_details.reasoning_tokens || 0;
          }
          if (usageObj.prompt_tokens_details) {
            caTokens = usageObj.prompt_tokens_details.cached_tokens || 0;
          }
        } else {
          // Dynamic text-character based fallback metrics
          pTokens = Math.max(120, Math.floor((contextTemplate || '').length / 4.2));
          cTokens = Math.max(60, Math.floor(replyValue.length / 3.8));
          tTokens = pTokens + cTokens;
          rTokens = Math.floor(cTokens * 0.22);
          caTokens = Math.floor(pTokens * 0.5);
        }

        const runLog: any[] = [];
        const existingLogs = localStorage.getItem('amirullm-token-usage-history');
        if (existingLogs) {
          try {
            const parsed = JSON.parse(existingLogs);
            if (Array.isArray(parsed)) {
              runLog.push(...parsed);
            }
          } catch (err) {}
        }

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        runLog.push({
          id: `tx_real_${Date.now()}`,
          timestamp: `${dateStr} ${timeStr}`,
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: tTokens,
          reasoningTokens: rTokens,
          cachedTokens: caTokens
        });

        localStorage.setItem('amirullm-token-usage-history', JSON.stringify(runLog));
        console.log("%c[AmiruLLM Telemetry Captured]%c recorded usage values:", "color: #10b981; font-weight: bold;", "color: inherit;", {
          promptTokens: pTokens,
          completionTokens: cTokens,
          totalTokens: tTokens,
          reasoningTokens: rTokens,
          cachedTokens: caTokens
        });
      } catch (logErr) {
        console.error("Telemetry tracker exception", logErr);
      }

      setChatMessages(prev => [...prev, {
        id: `reply_msg_${Date.now()}`,
        role: 'assistant',
        content: replyValue.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.log('AmiruLLM custom brain connection error:', error);
      
      const fallbackQuota = {
        ip: "113.211.212.159",
        quota: {
          limit_24h: 50000,
          used_24h: 53510,
          remaining_24h: 0,
          calls_24h: 7,
          reset_at: "2026-06-28T05:51:45+00:00",
          allowed: false
        },
        all_time: {
          total_calls: 7,
          total_tokens: 53510
        },
        timestamp: new Date().toISOString()
      };
      setApiQuotaData(fallbackQuota);

      // Local graceful fallback response with limit warning & donation
      setChatMessages(prev => [...prev, {
        id: `reply_msg_limit_fallback_${Date.now()}`,
        role: 'assistant',
        content: `You are asking a lot of questions and it's reaching the limit for today.

To support the server costs of AmiruLLM, please consider donating:
• **Touch 'n Go**: +0197767497 (AMIRUL SADIKIN)
<img src=https://amirul.cloud/pay.jpg>`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDonation: true
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Optional: check for loadjson query parameter on load, fallback/default to specified URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let loadJsonUrl = params.get('loadjson') || 'https://www.amirul.cloud/data/amirul.json';
    if (params.has('loadjson')) {
      const qVal = params.get('loadjson');
      if (!qVal || qVal === 'true' || qVal === '1') {
        loadJsonUrl = 'https://www.amirul.cloud/data/amirul.json';
      } else {
        loadJsonUrl = qVal;
      }
    }

    if (loadJsonUrl) {
      setImportStatus({ status: 'loading', message: `Checking for online/remote portfolio schema updates...` });
      fetch(loadJsonUrl)
        .then(response => {
          if (!response.ok) {
            console.log('Remote portfolio fetch failed response:', response);
            throw new Error(`HTTP Error status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data && data.profile && Array.isArray(data.projects) && Array.isArray(data.experience)) {
            // Apply sorting for safety
            const sorted = { ...data };
            if (sorted.experience) sorted.experience = sortTimelineItems(sorted.experience);
            if (sorted.education) sorted.education = sortTimelineItems(sorted.education);
            setPortfolioData(sorted);
            localStorage.setItem('developer-portfolio-schema', JSON.stringify(sorted));
            setImportStatus({ status: 'success', message: 'Portfolio schema successfully synchronized!' });
            setTimeout(() => {
              setImportStatus({ status: 'idle', message: '' });
            }, 3000);
          } else {
            throw new Error('Fetched file structure does not match standard portfolio data schema configuration.');
          }
        })
        .catch(err => {
          console.log('Error importing custom layout via URL or default fetch:', err);
          
          // Use default JSON constant
          const sorted = { ...defaultPortfolioData };
          if (sorted.experience) sorted.experience = sortTimelineItems(sorted.experience);
          if (sorted.education) sorted.education = sortTimelineItems(sorted.education);
          setPortfolioData(sorted);
          localStorage.setItem('developer-portfolio-schema', JSON.stringify(sorted));

          setImportStatus({
            status: 'error',
            message: `Loaded offline system template.`
          });
          setTimeout(() => {
            setImportStatus({ status: 'idle', message: '' });
          }, 3000);
        });
    }
    fetchApiQuota();
  }, []);

  // Trigger HTML document root styling updates whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('developer-portfolio-theme', theme);
  }, [theme]);

  // Synchronize dynamic portfolio changes directly to local storage cache
  const handleUpdateData = (newData: PortfolioData) => {
    const sorted = { ...newData };
    if (sorted.experience) {
      sorted.experience = sortTimelineItems(sorted.experience);
    }
    if (sorted.education) {
      sorted.education = sortTimelineItems(sorted.education);
    }
    setPortfolioData(sorted);
    localStorage.setItem('developer-portfolio-schema', JSON.stringify(sorted));
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
      {!isFullscreenChat && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 no-print">
          {/* Toggle AmiruLLM Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer relative group shadow-xl ${
              isChatOpen 
                ? 'bg-rose-500 hover:bg-rose-650 ring-4 ring-rose-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 ring-4 ring-indigo-500/10'
            } text-white`}
            title="Chat with AmiruLLM"
            aria-label="Toggle AmiruLLM Chatbox"
          >
            {isChatOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MessageSquare className="w-5 h-5" />
            )}
            <span className="absolute -left-36 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              Chat with AmiruLLM
            </span>
            {!isChatOpen && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white animate-pulse border border-[var(--bg-primary)]">
                AI
              </span>
            )}
          </button>

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

          {/* Advanced Configuration Settings Cog (Opens Modes Console) */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-12 h-12 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-755 hover:scale-105 text-slate-100 hover:text-white shadow-xl flex items-center justify-center transition-all cursor-pointer relative group ring-2 ring-violet-500/20"
            title="Advanced System Modes Settings Cog"
            aria-label="Open system configuration modes modal panel"
          >
            <Settings className="w-5 h-5 animate-spin-slow text-violet-400" />
            <span className="absolute -left-48 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
              Advanced Settings Console (Cog)
            </span>
          </button>

          {isDevMode && (
            <button
              onClick={() => setIsCmsOpen(true)}
              className="w-12 h-12 rounded-full bg-slate-950 hover:scale-105 text-white border border-slate-800 shadow-xl flex items-center justify-center transition-all cursor-pointer relative group ring-2 ring-indigo-500/20"
              title="Manage Content (CMS Dashboard)"
              aria-label="Open CMS Content dashboard"
            >
              <Settings className="w-5 h-5" />
              <span className="absolute -left-36 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                Manage Portfolio CMS
              </span>
            </button>
          )}
        </div>
      )}

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
            {/* Sparkles AI button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="text-xs font-bold uppercase tracking-wider bg-purple-500/10 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-400 px-3.5 py-1.5 rounded-lg border border-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-purple-500"
              title="Open Dynamic AI Interview & QA Assistant Room"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talk to my AI Agent</span>
            </button>

            {/* Quick dashboard trigger (Dev Mode Only) */}
            {isDevMode && (
              <button
                onClick={() => setIsCmsOpen(true)}
                className="text-xs font-bold uppercase tracking-wider bg-[var(--accent-light)] hover:bg-[var(--accent-primary)] text-[var(--accent-primary)] hover:text-white px-3.5 py-1.5 rounded-lg border border-[var(--accent-primary)]/20 transition-all cursor-pointer flex items-center gap-1.5 focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CMS Panel</span>
              </button>
            )}
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
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
                    <h3 className="text-base font-bold uppercase tracking-wider font-display">Employment History</h3>
                  </div>
                  {portfolioData.experience.length > 0 && (
                    <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-color)] select-none shrink-0">
                      <button
                        onClick={() => setShowBentoGantt(false)}
                        className={`px-2.5 py-1 text-[10px] font-bold font-sans rounded-md transition-all cursor-pointer ${
                          !showBentoGantt
                            ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Timeline List
                      </button>
                      <button
                        onClick={() => setShowBentoGantt(true)}
                        className={`px-2.5 py-1 text-[10px] font-bold font-sans rounded-md transition-all cursor-pointer ${
                          showBentoGantt
                            ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Gantt Chart
                      </button>
                    </div>
                  )}
                </div>

                {portfolioData.experience.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] italic text-center p-8 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
                    Employment Chronicles is currently empty. Open CMS system.
                  </p>
                ) : showBentoGantt ? (
                  <div className="animate-fade-in py-1">
                    <GanttChart experience={portfolioData.experience} />
                  </div>
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
                  <h3 className="text-lg font-extrabold uppercase tracking-wider font-display">Projects</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">Click on any project to review comprehensive architectural details, screenshots, and live parameters.</p>
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
            <section id="detailed-chronicles" className="space-y-8 scroll-mt-24 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-color)] pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--accent-primary)]" />
                <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase">
                  Work Experience
                </h2>
              </div>
              
              {portfolioData.experience.length > 0 && (
                <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-xl border border-[var(--border-color)] select-none shrink-0">
                  <button
                    onClick={() => setShowDetailedGantt(true)}
                    className={`px-3.5 py-1.5 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      showDetailedGantt
                        ? 'bg-[var(--accent-primary)] text-white shadow font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Interactive Gantt Chart</span>
                  </button>
                  <button
                    onClick={() => setShowDetailedGantt(false)}
                    className={`px-3.5 py-1.5 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      !showDetailedGantt
                        ? 'bg-[var(--accent-primary)] text-white shadow font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Detailed Cards View</span>
                  </button>
                </div>
              )}
            </div>

            {portfolioData.experience.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No historical timeline items provided. Open CMS.</p>
            ) : showDetailedGantt ? (
              <div className="animate-fade-in">
                <GanttChart experience={portfolioData.experience} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
                              <li key={idx} className="leading-snug pl-1.5"><span className="font-sans text-[var(--text-secondary)]">{ach}</span></li>
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
                Education
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
                <h2 className="text-xl font-extrabold tracking-tight font-display text-[var(--text-primary)] uppercase flex items-center gap-2.5">
                  <span>Publications & Research Work</span>
                  <span className="text-xs font-mono font-bold bg-[var(--accent-light)] text-[var(--accent-primary)] px-2.5 py-0.5 rounded-full border border-[var(--accent-primary)]/10 shadow-xs">
                    {portfolioData.publications.length}
                  </span>
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
                        <div className="border-t border-[var(--border-color)]/60 pt-2.5 mt-2 space-y-2">
                          <p className={`text-xs text-[var(--text-secondary)] leading-relaxed transition-all duration-350 ${expandedPubs[pub.id] ? '' : 'line-clamp-2'}`}>
                            {pub.description}
                          </p>
                          {pub.description.length > 100 && (
                            <button
                              onClick={() => setExpandedPubs(prev => ({ ...prev, [pub.id]: !prev[pub.id] }))}
                              className="text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2 py-1 rounded-md w-fit select-none"
                            >
                              {expandedPubs[pub.id] ? 'Show Less ▴' : 'Read More ▾'}
                            </button>
                          )}
                        </div>
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
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedProject(null); }}
          className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-print animate-fade-in cursor-pointer"
        >
          <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] w-full max-w-[94vw] lg:max-w-7xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[85vh] md:h-[80vh] max-h-[90vh] animate-scale-up cursor-default">
            
            {/* Left Part: 50% width dynamic media slider / carousel */}
            <div className="relative w-full md:w-1/2 bg-[var(--bg-tertiary)] border-b md:border-b-0 md:border-r border-[var(--border-color)] flex flex-col justify-center min-h-[220px] sm:min-h-[280px] md:min-h-0 h-1/3 md:h-full select-none">
              {(() => {
                const carouselImages = [
                  selectedProject.coverImage,
                  ...(selectedProject.images || [])
                ].filter((url, idx, self) => url && self.indexOf(url) === idx);
                
                const hasMultiple = carouselImages.length > 1;
                const currentImgUrl = carouselImages[projectCarouselIndex] || selectedProject.coverImage;
                
                const isVideoUrl = (url?: string): boolean => {
                  if (!url) return false;
                  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || url.includes('/mp4') || url.includes('.mp4');
                };

                return (
                  <>
                    {isVideoUrl(currentImgUrl) ? (
                      <video 
                        key={currentImgUrl}
                        src={currentImgUrl}
                        controls
                        autoPlay
                        muted
                        playsInline
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full group/zoom-preview overflow-hidden">
                        <img 
                          src={currentImgUrl} 
                          alt={`${selectedProject.title} slide ${projectCarouselIndex + 1}`} 
                          className="w-full h-full object-cover transition-all duration-350 cursor-zoom-in group-hover/zoom-preview:scale-[1.03]"
                          referrerPolicy="no-referrer"
                          onClick={() => setFullScreenImageUrl(currentImgUrl)}
                        />
                        <div 
                          onClick={() => setFullScreenImageUrl(currentImgUrl)}
                          className="absolute inset-0 bg-black/35 opacity-0 group-hover/zoom-preview:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-6 cursor-zoom-in pointer-events-auto"
                        >
                          <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-[var(--accent-primary)] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit shadow-lg animate-pulse select-none">
                            <Maximize2 className="w-3.5 h-3.5" /> Click to Expand Full Screen
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Close action button for mobile only inside left media banner */}
                    <button 
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white cursor-pointer transition-colors shadow-md md:hidden"
                      aria-label="Close project details"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {hasMultiple && (
                      <>
                        {/* Left Chevron arrow */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectCarouselIndex(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                          title="Previous Slide"
                          aria-label="Previous Slide"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Right Chevron arrow */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectCarouselIndex(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                          title="Next Slide"
                          aria-label="Next Slide"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Slide counters indicator badge */}
                        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 text-white font-mono text-[9px] font-bold tracking-wider select-none shadow">
                          {projectCarouselIndex + 1} / {carouselImages.length}
                        </div>

                        {/* Slide dots selector indicators container */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs select-none">
                          {carouselImages.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectCarouselIndex(dotIdx);
                              }}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                dotIdx === projectCarouselIndex 
                                  ? 'bg-white scale-125' 
                                  : 'bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Go to slide ${dotIdx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Right Part: 50% width scrollable details */}
            <div className="w-full md:w-1/2 flex flex-col h-2/3 md:h-full overflow-hidden relative">
              {/* Close Button for desktop layout inside details */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-full hidden md:flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                aria-label="Close project details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 pr-4 scrollbar-thin">
                <div>
                  <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-[var(--accent-light)] text-[var(--accent-primary)] px-2.5 py-1 rounded inline-block mb-3 select-none animate-pulse">
                    Portfolio Documentation
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-[var(--text-primary)] leading-snug">
                    {selectedProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic mt-2 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
                    {selectedProject.briefDescription}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1 mb-2.5">
                    Analytical Breakdown & Systems Overview
                  </h4>
                  {(() => {
                    const text = selectedProject.longDescription || '';
                    const limit = 280;
                    const isTooLong = text.length > limit;
                    const displayText = isTooLong && !isProjectDescExpanded ? text.substring(0, limit) + '...' : text;
                    
                    // Parsing lines to allow custom points
                    const lines = displayText.split('\n');
                    const elements: React.ReactNode[] = [];
                    let currentList: React.ReactNode[] = [];
                    
                    lines.forEach((line, lineIdx) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                        const content = trimmed.substring(1).trim();
                        currentList.push(
                          <li key={`bullet-${lineIdx}`} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                            <span className="text-[var(--accent-primary)] mt-1.5 select-none font-extrabold text-[8px] sm:text-[10px] shrink-0">●</span>
                            <span>{content}</span>
                          </li>
                        );
                      } else {
                        if (currentList.length > 0) {
                          elements.push(
                            <ul key={`list-${lineIdx}`} className="space-y-1.5 py-1 pl-2">
                              {currentList}
                            </ul>
                          );
                          currentList = [];
                        }
                        if (trimmed) {
                          elements.push(
                            <p key={`p-${lineIdx}`} className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                              {trimmed}
                            </p>
                          );
                        }
                      }
                    });
                    
                    if (currentList.length > 0) {
                      elements.push(
                        <ul key="list-final" className="space-y-1.5 py-1 pl-2">
                          {currentList}
                        </ul>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        <div className={`space-y-2.5 ${isProjectDescExpanded ? 'max-h-[220px] sm:max-h-[300px] overflow-y-auto pr-3 scrollbar-thin bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]/80 text-left' : 'pr-1'}`}>
                          {elements}
                        </div>
                        {isTooLong && (
                          <button
                            onClick={() => setIsProjectDescExpanded(!isProjectDescExpanded)}
                            className="text-xs font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer flex items-center gap-1 mt-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg w-fit"
                          >
                            {isProjectDescExpanded ? 'Show Less ▴' : 'Read More ▾'}
                          </button>
                        )}
                      </div>
                    );
                  })()}
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
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL LIGHTBOX: Article Reading Overlay
          ────────────────────────────────────────────────────────────────── */}
      {selectedBlog && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedBlog(null); }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print animate-fade-in cursor-pointer"
        >
          <div className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-scale-up cursor-default">
            
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
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-sm bg-[var(--bg-tertiary)] group/blog-zoom relative">
                  <img 
                    src={selectedBlog.coverImage} 
                    alt={selectedBlog.title} 
                    className="w-full h-full object-cover cursor-zoom-in transition-all duration-350 group-hover/blog-zoom:scale-[1.02]"
                    referrerPolicy="no-referrer"
                    onClick={() => setFullScreenImageUrl(selectedBlog.coverImage)}
                  />
                  <div 
                    onClick={() => setFullScreenImageUrl(selectedBlog.coverImage)}
                    className="absolute inset-0 bg-black/35 opacity-0 group-hover/blog-zoom:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-6 cursor-zoom-in pointer-events-auto"
                  >
                    <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase bg-[var(--accent-primary)] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit shadow-lg animate-pulse select-none">
                      <Maximize2 className="w-3.5 h-3.5" /> Direct Full Screen View
                    </span>
                  </div>
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
          AI ASSISTANT SEED/PROMPT ROOM MODAL (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isAiModalOpen && (
        <AiAssistantModal 
          data={portfolioData}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────
          AMIRULLM INTERACTIVE FLOATING CHAT PANEL (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isChatOpen && (
        <div 
          id="amirullm-chat-dialog" 
          className="fixed bottom-22 right-6 w-[88vw] sm:w-[380px] md:w-[410px] h-[520px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-scale-up no-print transition-all duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-650 via-indigo-700 to-purple-800 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center border border-white/20 shadow-inner">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-pulse animate-spin-slow" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full animate-ping"></span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full"></span>
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">AmiruLLM</h4>
                <p className="text-[9px] text-indigo-200 font-semibold tracking-wide">Interactive Professional Representative</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsStatsOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Token Analytics & Eco-Budget Stats"
                aria-label="View Usage Stats"
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[10px] font-bold hidden sm:inline">Stats</span>
              </button>
              <button
                onClick={() => {
                  setIsFullscreenChat(true);
                  setIsChatOpen(false);
                  setFullscreenLeftTab('comparison');
                  const url = new URL(window.location.href);
                  url.searchParams.set('fullscreen', 'chat');
                  url.searchParams.set('tab', 'comparison');
                  window.history.pushState({}, '', url.toString());
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Open Job Matcher Mode"
                aria-label="Job Matcher"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[10px] font-bold hidden sm:inline">Job Matcher</span>
              </button>
              <button
                onClick={() => {
                  setIsFullscreenChat(true);
                  setIsChatOpen(false);
                  const url = new URL(window.location.href);
                  url.searchParams.set('fullscreen', 'chat');
                  window.history.pushState({}, '', url.toString());
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Enter Fullscreen Split Chat Mode"
                aria-label="Fullscreen Chat"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[10px] font-bold hidden sm:inline">Fullscreen</span>
              </button>
              <button
                onClick={handleRestartConversation}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Restart Conversation"
                aria-label="Restart Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline">Restart</span>
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Minimize Chat"
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-Header Controls */}
          <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-2.5 flex flex-col gap-2 shrink-0 select-none text-xs font-sans">
            {/* Length toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Response Style:</span>
              <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-color)] shrink-0">
                <button
                  type="button"
                  onClick={() => setChatLengthMode('short')}
                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                    chatLengthMode === 'short'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Short (≤50w)
                </button>
                <button
                  type="button"
                  onClick={() => setChatLengthMode('long')}
                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                    chatLengthMode === 'long'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Long (≤300w)
                </button>
              </div>
            </div>

            {/* Personality toggle */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Personality:</span>
              <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-color)] shrink-0">
                {(['professional', 'funny', 'arrogant'] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setChatToneMode(tone)}
                    className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer capitalize ${
                      chatToneMode === tone
                        ? tone === 'professional'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : tone === 'funny'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-rose-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tone === 'funny' ? 'Funny 😜' : tone === 'arrogant' ? 'Arrogant 😠' : 'Professional 💼'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-primary)]/30 scrollbar-thin flex flex-col text-left">
            {chatMessages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 shrink-0 flex items-center justify-center text-[9px] font-extrabold select-none">
                    AI
                  </div>
                )}
                <div>
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-sans whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-xs text-left'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {(() => {
                      const imgRegex = /<img\s+src=["']?([^"'>\s]+)["']?\s*\/?>/gi;
                      const parts = msg.content.split(imgRegex);
                      if (parts.length === 1) {
                        return msg.content;
                      }
                      return parts.map((part, i) => {
                        if (i % 2 === 1) {
                          return (
                            <div key={i} className="my-2.5 overflow-hidden rounded-xl border border-white/10 max-w-[220px] bg-white p-2 shadow-lg transition-transform hover:scale-[1.02]">
                              <a 
                                href={part} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="Click to view image"
                                className="block cursor-zoom-in"
                              >
                                <img 
                                  src={part} 
                                  alt="Embedded Content" 
                                  className="w-full h-auto rounded"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                            </div>
                          );
                        }
                        return part ? <span key={i}>{part}</span> : null;
                      });
                    })()}
                  </div>
                  <span className={`text-[8px] text-[var(--text-secondary)] mt-1 font-mono block px-1 ${msg.role === 'user' && 'text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Loading indicators */}
            {isChatLoading && (
              <div className="flex gap-2.5 mr-auto max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-indigo-505/10 text-[var(--accent-primary)] shrink-0 flex items-center justify-center text-[9px] font-bold">
                  AI
                </div>
                <div>
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-3.5 rounded-2xl rounded-tl-xs text-xs flex flex-col gap-2 shadow-xs max-w-[270px] sm:max-w-[310px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      <span className="font-mono text-[9px] text-[var(--text-secondary)] font-bold ml-1 flex items-center gap-1">
                        Reasoning time: <span className="text-rose-500 text-[10px] animate-pulse">{chatElapsedTime}s</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                      {chatElapsedTime < 4 && "⚡ Connecting to custom brain on amirul.cloud..."}
                      {chatElapsedTime >= 4 && chatElapsedTime < 9 && "🎯 Initializing resume context of Amirul..."}
                      {chatElapsedTime >= 9 && chatElapsedTime < 15 && "🧠 Analysing computer vision achievements..."}
                      {chatElapsedTime >= 15 && chatElapsedTime < 22 && "⏳ Deep reasoning with MiMo-v2.5-pro (customary: ~20s)..."}
                      {chatElapsedTime >= 22 && "🚀 Formulating finalized answer response..."}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll Anchor */}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          <div className="px-3.5 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/70 overflow-x-auto flex gap-1.5 scrollbar-none whitespace-nowrap">
            {[
              'Explain computer vision experience',
              'What publications do you have?', 
              'List core tech skills', 
              'Who is your current employer?'
            ].map((suggest, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChatInput(suggest)}
                className="text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-2.5 py-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-455 hover:border-indigo-500 transition-colors cursor-pointer select-none"
              >
                {suggest}
              </button>
            ))}
          </div>

          {/* Message Input Box Form */}
          <form
            onSubmit={handleSendChatMessage}
            className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Query AmiruLLM regarding this CV..."
              disabled={isChatLoading}
              className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer shadow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Transmit Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
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

      {/* AmiruLLM Eco Metrics & Token Usage Analytics Dialog Overlay */}
      {isStatsOpen && (
        <TokenStatsModal onClose={() => setIsStatsOpen(false)} />
      )}

      {/* ADVANCED CONFIGURATION SYSTEM MODES PANEL OVERLAY */}
      {isSettingsModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 no-print select-none"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col p-5 sm:p-6 text-left animate-scale-up z-[60]"
          >
            {/* Header Dialog */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-inner">
                  <Settings className="w-5 h-5 text-violet-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 font-sans">
                    Advanced Settings Console
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide font-sans">
                    System-Level Application View & Access Controllers
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Dismiss (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Mode Selection Card Cards */}
            <div className="space-y-3.5 my-2">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
                Select Active Workspace Mode
              </span>

              {/* Mode card 1: Standard */}
              <div 
                onClick={() => {
                  handleSetMode(null);
                  setIsSettingsModalOpen(false);
                }}
                className={`group border rounded-xl p-3.5 flex items-start gap-3.5 cursor-pointer transition-all ${
                  !isDevMode && !isCopyMode && !isJsonMode
                    ? 'bg-indigo-600/10 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                  !isDevMode && !isCopyMode && !isJsonMode
                    ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-white/5 text-slate-400 group-hover:text-indigo-400'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 block font-sans">Pixel-Perfect Portfolio View</span>
                    {!isDevMode && !isCopyMode && !isJsonMode && (
                      <span className="bg-indigo-600/25 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-401 font-medium leading-normal mt-0.5 font-sans">
                    Standard visitor experience. Elegantly displays work history, research publications, and fully immersive AI integrations.
                  </p>
                </div>
              </div>

              {/* Mode card 2: CMS Mode */}
              <div 
                onClick={() => {
                  handleSetMode('dev');
                  setIsSettingsModalOpen(false);
                }}
                className={`group border rounded-xl p-3.5 flex items-start gap-3.5 cursor-pointer transition-all ${
                  isDevMode 
                    ? 'bg-indigo-600/10 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                  isDevMode
                    ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-white/5 text-slate-400 group-hover:text-amber-400'
                }`}>
                  <Settings className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 block font-sans">CMS Dashboard Panel Mode (?mode=dev)</span>
                    {isDevMode && (
                      <span className="bg-indigo-600/25 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-401 font-medium leading-normal mt-0.5 font-sans">
                    Empowers recruiters or content owners with real-time UI inputs to edit candidate profiles, adjust section aliases, and preview updates dynamically.
                  </p>
                </div>
              </div>

              {/* Mode card 3: Copy Console */}
              <div 
                onClick={() => {
                  handleSetMode('copy');
                  setIsSettingsModalOpen(false);
                }}
                className={`group border rounded-xl p-3.5 flex items-start gap-3.5 cursor-pointer transition-all ${
                  isCopyMode
                    ? 'bg-indigo-600/10 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                  isCopyMode
                    ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-white/5 text-slate-400 group-hover:text-emerald-400'
                }`}>
                  <Copy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 block font-sans">Resume Copy Console (?mode=copy)</span>
                    {isCopyMode && (
                      <span className="bg-indigo-600/25 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-401 font-medium leading-normal mt-0.5 font-sans">
                    A single-column clipboard-optimized console designed for streamlined copy-pasting of work experience items, bios, and specific contacts.
                  </p>
                </div>
              </div>

              {/* Mode card 4: JSON Editor */}
              <div 
                onClick={() => {
                  handleSetMode('json');
                  setIsSettingsModalOpen(false);
                }}
                className={`group border rounded-xl p-3.5 flex items-start gap-3.5 cursor-pointer transition-all ${
                  isJsonMode
                    ? 'bg-indigo-600/10 border-indigo-500/40 shadow-inner'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                  isJsonMode
                    ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-white/5 text-slate-400 group-hover:text-purple-400'
                }`}>
                  <Code className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 block font-sans">Model JSON Editor Console (?mode=json)</span>
                    {isJsonMode && (
                      <span className="bg-indigo-600/25 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-401 font-medium leading-normal mt-0.5 font-sans">
                    Direct access to raw profile model schemas with code compression tools, syntax linter checking, and an interactive save pipeline.
                  </p>
                </div>
              </div>

            </div>

            {/* Reset Factory settings at base */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={() => {
                  if (confirm("This will erase all content optimizations saved in local storage and restore original default data. Continue?")) {
                    localStorage.removeItem('developer-portfolio-schema');
                    setPortfolioData(defaultPortfolioData);
                    setIsSettingsModalOpen(false);
                    handleSetMode(null);
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-1.5 bg-[var(--bg-primary)] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-[10px] font-bold font-mono uppercase rounded-xl border border-white/5 hover:border-rose-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                type="button"
                title="Wipe database cache"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Format Cache & Reset</span>
              </button>

              <div className="text-[10px] text-slate-500 font-medium font-mono">
                Active: <span className="text-indigo-400">{isDevMode ? 'CMS/Dev' : isCopyMode ? 'Copy Mode' : isJsonMode ? 'JSON Mode' : 'Standard'}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX OVERLAY */}
      {fullScreenImageUrl && (
        <div 
          onClick={() => setFullScreenImageUrl(null)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 no-print select-none cursor-zoom-out animate-fade-in"
        >
          {/* Close button top right */}
          <button 
            onClick={() => setFullScreenImageUrl(null)}
            className="absolute top-6 right-6 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center cursor-pointer transition-all border border-white/20 shadow-2xl focus:outline-none"
            title="Close Fullscreen (ESC)"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Centered Image Frame */}
          <div className="relative max-w-full max-h-[85vh] flex justify-center items-center shadow-2xl rounded-xl overflow-hidden select-none">
            <img 
              src={fullScreenImageUrl} 
              alt="Project Fullscreen Showcase" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none animate-scale-up border border-white/10"
              referrerPolicy="no-referrer"
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenImageUrl(null);
              }}
            />
          </div>

          {/* Bottom Context Info Indicator Bar */}
          <div className="mt-6 text-center text-white/60 space-y-1.5">
            <p className="text-xs font-mono tracking-widest font-bold uppercase text-[var(--accent-primary)] select-none">
              In-Depth Analytical Showcase
            </p>
            <p className="text-[10px] text-white/45 tracking-wider uppercase font-medium select-none">
              Click anywhere or press <kbd className="bg-white/15 text-white/90 px-1.5 py-0.5 rounded font-mono text-[9px] mx-1">ESC</kbd> to return
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          EXPRESSIVE COPY CONSOLE / ONE-COLUMN COPIER BOARD (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isCopyMode && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen no-print select-text animate-fade-in overflow-hidden font-sans"
        >
          {/* Header Bar */}
          <header className="p-4 bg-slate-900 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-3">
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
                <Copy className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Resume Copy Console
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                  1-Column Instant Clipboarding & Fast Copy Hub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  const resumeSections: string[] = [];
                  resumeSections.push(`# ${portfolioData.profile.name}\n${portfolioData.profile.title} - ${portfolioData.profile.currentRole}`);
                  resumeSections.push(`Email: ${portfolioData.profile.email} | Phone: ${portfolioData.profile.phone} | Location: ${portfolioData.profile.location}`);
                  resumeSections.push(`Portfolio: ${portfolioData.profile.websiteUrl || window.location.origin} | GitHub: ${portfolioData.profile.githubUrl} | LinkedIn: ${portfolioData.profile.linkedInUrl}`);
                  
                  if (portfolioData.profile.aboutLong || portfolioData.profile.aboutBrief) {
                    resumeSections.push(`## Professional Summary\n${portfolioData.profile.aboutLong || portfolioData.profile.aboutBrief}`);
                  }

                  if (portfolioData.experience && portfolioData.experience.length > 0) {
                    const expStr = portfolioData.experience.map(exp => {
                      const achievementsStr = exp.achievements && exp.achievements.length > 0 
                        ? exp.achievements.map(ach => `* ${ach}`).join('\n') 
                        : '';
                      return `### ${exp.role} @ ${exp.company}\n${exp.startDate} - ${exp.endDate} | ${exp.location || ''}\n\n${exp.description || ''}\n${achievementsStr}`;
                    }).join('\n\n');
                    resumeSections.push(`## Work History\n${expStr}`);
                  }

                  if (portfolioData.education && portfolioData.education.length > 0) {
                    const eduStr = portfolioData.education.map(edu => {
                      return `### ${edu.degree} in ${edu.fieldOfStudy}\n${edu.institution} | ${edu.startDate} - ${edu.endDate}`;
                    }).join('\n\n');
                    resumeSections.push(`## Education\n${eduStr}`);
                  }

                  if (portfolioData.skills && portfolioData.skills.length > 0) {
                    const skillsStr = portfolioData.skills.map(s => s.name).join(', ');
                    resumeSections.push(`## Technical Skills\n${skillsStr}`);
                  }

                  handleCopyText('bulk-all', resumeSections.join('\n\n'));
                }}
                className={`px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 active:scale-95 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                  copiedItemKey === 'bulk-all' ? 'ring-2 ring-emerald-500' : ''
                }`}
                type="button"
                title="Copy standard Markdown profile to clipboard"
              >
                {copiedItemKey === 'bulk-all' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Entire CV Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full CV (MD)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsCopyMode(false);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('mode');
                  window.history.pushState({}, '', url.toString());
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer flex items-center gap-1 shadow select-none"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Copy Mode</span>
              </button>
            </div>
          </header>

          {/* Main copiable view in 1 column */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* SECTION: 1. Personal Identity */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">1. Personal Identity & Bio</span>
                  <div className="text-[10px] text-slate-500 font-medium">Click copy next to individual parameters</div>
                </div>

                <div className="space-y-4">
                  {/* Name field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Full Name</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.name}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('name', portfolioData.profile.name)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'name' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy full name"
                    >
                      {copiedItemKey === 'name' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Professional Title</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.title}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('title', portfolioData.profile.title)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'title' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy professional title"
                    >
                      {copiedItemKey === 'title' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Current role field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Current Role</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.currentRole}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('current-role', portfolioData.profile.currentRole)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'current-role' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy current role"
                    >
                      {copiedItemKey === 'current-role' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Location field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Address / Location</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.location}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('location', portfolioData.profile.location)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'location' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy location address"
                    >
                      {copiedItemKey === 'location' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Phone field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Phone Contact</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.phone}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('phone', portfolioData.profile.phone)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'phone' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy phone details"
                    >
                      {copiedItemKey === 'phone' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Email field */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Email Address</span>
                      <span className="text-sm font-semibold text-slate-100 block truncate">{portfolioData.profile.email}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('email', portfolioData.profile.email)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'email' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy email address"
                    >
                      {copiedItemKey === 'email' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                </div>
              </div>

              {/* SECTION: 2. Core Hyperlinks */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">2. Professional Portfolio & Profile URLs</span>
                  <div className="text-[10px] text-slate-500 font-medium">Quick copy links for applications</div>
                </div>

                <div className="space-y-4">
                  {/* Website Url / Link */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Website / Live Portfolio URL</span>
                      <span className="text-sm font-mono text-indigo-300 block truncate">{portfolioData.profile.websiteUrl || currentUrl}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText('website-url', portfolioData.profile.websiteUrl || currentUrl)}
                      className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                        copiedItemKey === 'website-url' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                      }`}
                      title="Copy website link"
                    >
                      {copiedItemKey === 'website-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* GitHub Profile */}
                  {portfolioData.profile.githubUrl && (
                    <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">GitHub Profile URL</span>
                        <span className="text-sm font-mono text-indigo-300 block truncate">{portfolioData.profile.githubUrl}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText('github-url', portfolioData.profile.githubUrl)}
                        className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                          copiedItemKey === 'github-url' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                        }`}
                        title="Copy GitHub URL link"
                      >
                        {copiedItemKey === 'github-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* LinkedIn Profile */}
                  {portfolioData.profile.linkedInUrl && (
                    <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">LinkedIn Profile URL</span>
                        <span className="text-sm font-mono text-indigo-300 block truncate">{portfolioData.profile.linkedInUrl}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText('linkedin-url', portfolioData.profile.linkedInUrl)}
                        className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                          copiedItemKey === 'linkedin-url' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                        }`}
                        title="Copy LinkedIn URL link"
                      >
                        {copiedItemKey === 'linkedin-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Google Scholar Profile */}
                  {portfolioData.profile.googleScholarUrl && (
                    <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider select-none">Google Scholar URL</span>
                        <span className="text-sm font-mono text-indigo-300 block truncate">{portfolioData.profile.googleScholarUrl}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText('scholars-url', portfolioData.profile.googleScholarUrl)}
                        className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                          copiedItemKey === 'scholars-url' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                        }`}
                        title="Copy Google Scholar link"
                      >
                        {copiedItemKey === 'scholars-url' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: 3. Summaries & Introduction Info */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">3. Profile Summary Statements</span>
                  <div className="text-[10px] text-slate-500 font-medium">Elevator pitch or resume description block</div>
                </div>

                <div className="space-y-4">
                  {/* Brief about summary */}
                  {portfolioData.profile.aboutBrief && (
                    <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-4 rounded-xl space-y-2.5 transition-colors">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Elevator About Pitch (Brief)</span>
                        <button
                          onClick={() => handleCopyText('about-brief', portfolioData.profile.aboutBrief)}
                          className={`p-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                            copiedItemKey === 'about-brief' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                          }`}
                          title="Copy brief intro summary"
                        >
                          {copiedItemKey === 'about-brief' ? <span className="text-[9.5px] font-bold px-1 text-emerald-400">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-350 bg-slate-950/30 p-2.5 rounded border border-white/5 leading-relaxed font-sans">{portfolioData.profile.aboutBrief}</p>
                    </div>
                  )}

                  {/* Long summary info */}
                  {portfolioData.profile.aboutLong && (
                    <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-4 rounded-xl space-y-2.5 transition-colors">
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Professional Bio Summary (Long)</span>
                        <button
                          onClick={() => handleCopyText('about-long', portfolioData.profile.aboutLong)}
                          className={`p-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-505/30 text-slate-400 hover:text-indigo-405 transition-all cursor-pointer ${
                            copiedItemKey === 'about-long' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                          }`}
                          title="Copy comprehensive biography summary"
                        >
                          {copiedItemKey === 'about-long' ? <span className="text-[9.5px] font-bold px-1 text-emerald-400">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-350 bg-slate-950/30 p-2.5 rounded border border-white/5 leading-relaxed font-sans max-h-[160px] overflow-y-auto whitespace-pre-wrap">{portfolioData.profile.aboutLong}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: 4. Extensive Employment & Experience History */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">4. Detailed Career Work History</span>
                  <button
                    onClick={() => {
                      const text = portfolioData.experience.map((exp, i) => {
                        const achievements = exp.achievements && exp.achievements.length > 0 
                          ? exp.achievements.map((ach) => `• ${ach}`).join('\n')
                          : '';
                        return `WORK EXPERIENCE ${i + 1}:\nCompany: ${exp.company}\nRole: ${exp.role}\nDuration: ${exp.startDate} - ${exp.endDate}\nLocation: ${exp.location || ''}\nDescription: ${exp.description}\n${achievements ? `Key Accomplishments:\n${achievements}\n` : ''}`;
                      }).join('\n============================\n\n');
                      handleCopyText('employment-bulk', text);
                    }}
                    className={`px-3 py-1.5 bg-slate-950 border border-white/5 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-lg text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center gap-1.5 ${
                      copiedItemKey === 'employment-bulk' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                    }`}
                    type="button"
                  >
                    {copiedItemKey === 'employment-bulk' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Copied All Corporate Roles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All Bulks</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  {portfolioData.experience.map((exp) => {
                    const formattedJobBlock = `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}) - ${exp.location || ''}\nSummary: ${exp.description}\n${
                      exp.achievements && exp.achievements.length > 0 ? `Accomplishments:\n${exp.achievements.map((item) => `* ${item}`).join('\n')}` : ''
                    }`;

                    return (
                      <div key={exp.id} className="border border-white/5 hover:border-white/10 bg-slate-950/20 rounded-xl p-4 flex flex-col space-y-4 group transition-colors">
                        
                        {/* Header Block of Job with single unified copy */}
                        <div className="flex justify-between items-start select-none border-b border-white/5 pb-2.5">
                          <div className="flex-1 pr-4">
                            <h3 className="text-[13px] font-black tracking-tight text-white">{exp.role}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-medium font-mono mt-0.5">
                              <span>{exp.company}</span>
                              <span>•</span>
                              <span className="text-slate-450">{exp.startDate} – {exp.endDate}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleCopyText(`job-comp-${exp.id}`, formattedJobBlock)}
                            className={`px-2.5 py-1 rounded bg-slate-950 hover:bg-indigo-650/10 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all font-mono text-[8px] uppercase tracking-wider font-bold shrink-0 flex items-center gap-1 ${
                              copiedItemKey === `job-comp-${exp.id}` ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                            }`}
                            title="Copy complete structured details of this job"
                          >
                            {copiedItemKey === `job-comp-${exp.id}` ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Complete Block Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Job Block</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Individual Parameter breakdowns */}
                        <div className="space-y-3.5 pt-1">
                          
                          {/* Company / Role separately copyable */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-950/40 p-2.5 border border-white/5 rounded-lg flex items-center justify-between gap-2.5">
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider select-none">Company Label</span>
                                <span className="text-[11px] text-slate-200 block truncate font-medium">{exp.company}</span>
                              </div>
                              <button
                                onClick={() => handleCopyText(`job-lbl-${exp.id}`, exp.company)}
                                className={`p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition-colors shrink-0 ${copiedItemKey === `job-lbl-${exp.id}` ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
                                title="Copy company label"
                              >
                                {copiedItemKey === `job-lbl-${exp.id}` ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            <div className="bg-slate-950/40 p-2.5 border border-white/5 rounded-lg flex items-center justify-between gap-2.5">
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider select-none">Designated Role</span>
                                <span className="text-[11px] text-slate-200 block truncate font-medium">{exp.role}</span>
                              </div>
                              <button
                                onClick={() => handleCopyText(`job-rol-${exp.id}`, exp.role)}
                                className={`p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition-colors shrink-0 ${copiedItemKey === `job-rol-${exp.id}` ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
                                title="Copy role title"
                              >
                                {copiedItemKey === `job-rol-${exp.id}` ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Role Description copy */}
                          <div className="bg-slate-950/40 p-3 border border-white/5 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center select-none">
                              <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Role Description Paragraph</span>
                              <button
                                onClick={() => handleCopyText(`job-desc-${exp.id}`, exp.description)}
                                className={`p-1 hover:bg-slate-800 rounded text-[9.5px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5 ${
                                  copiedItemKey === `job-desc-${exp.id}` ? 'text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5' : ''
                                }`}
                                title="Copy role description"
                              >
                                {copiedItemKey === `job-desc-${exp.id}` ? "Copied!" : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-350 leading-relaxed font-sans">{exp.description}</p>
                          </div>

                          {/* Achievements / Bullets listed */}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="bg-slate-950/40 p-3 border border-white/5 rounded-xl space-y-2.5">
                              <div className="flex justify-between items-center select-none">
                                <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Key Job Achievements ({exp.achievements.length})</span>
                                <button
                                  onClick={() => handleCopyText(`job-ach-${exp.id}`, exp.achievements.map((ach) => `• ${ach}`).join('\n'))}
                                  className={`p-1 hover:bg-slate-800 rounded text-[9.5px] font-bold text-indigo-400 tracking-wider hover:text-indigo-300 transition-colors flex items-center gap-0.5 uppercase ${
                                    copiedItemKey === `job-ach-${exp.id}` ? 'text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5' : ''
                                  }`}
                                  title="Copy accomplishments"
                                >
                                  {copiedItemKey === `job-ach-${exp.id}` ? "Accolades Copied!" : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span className="text-[8.5px] font-mono">Copy Bullets</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <ul className="text-[11px] text-slate-400 leading-relaxed font-sans space-y-1.5 pl-3 list-disc text-left">
                                {exp.achievements.map((ach, idx) => (
                                  <li key={idx} className="marker:text-slate-600 pl-0.5">{ach}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: 5. Academic Credentials & Education */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">5. Education & Qualifications</span>
                  <div className="text-[10px] text-slate-500 font-medium">Academic degrees</div>
                </div>

                <div className="space-y-4">
                  {portfolioData.education.map((edu) => {
                    const formattedEdu = `${edu.degree} in ${edu.fieldOfStudy}\n${edu.institution} (${edu.startDate} - ${edu.endDate})\n${edu.description || ''}`;

                    return (
                      <div key={edu.id} className="border border-white/5 bg-slate-950/40 p-4 rounded-xl flex items-start justify-between gap-4 transition-colors">
                        <div className="flex-1 min-w-0 text-left font-sans text-xs">
                          <h4 className="text-[12px] font-bold text-white">{edu.degree}</h4>
                          <p className="text-[11px] text-indigo-305 mt-1 font-semibold">{edu.fieldOfStudy}</p>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                            <strong>{edu.institution}</strong>
                            <span>•</span>
                            <span>{edu.startDate} – {edu.endDate}</span>
                          </div>
                          {edu.description && <p className="text-[10px] text-slate-450 mt-2 font-sans leading-relaxed">{edu.description}</p>}
                        </div>
                        <button
                          onClick={() => handleCopyText(`edu-${edu.id}`, formattedEdu)}
                          className={`p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                            copiedItemKey === `edu-${edu.id}` ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                          }`}
                          title="Copy academy details"
                        >
                          {copiedItemKey === `edu-${edu.id}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: 6. Skills Inventory & Tags Breakdown */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-lg p-5 text-left leading-relaxed">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-indigo-400">6. Technical Skills Inventory</span>
                  <div className="text-[10px] text-slate-500 font-medium">Raw list and categorized tags</div>
                </div>

                <div className="space-y-4">
                  {/* Raw list block */}
                  <div className="group border border-white/5 hover:border-white/10 bg-slate-950/40 p-4 rounded-xl space-y-2.5 transition-colors">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Raw Comma-Separated Skills List</span>
                      <button
                        onClick={() => {
                          const listStr = portfolioData.skills.map((s) => s.name).join(', ');
                          handleCopyText('skills-raw-list', listStr);
                        }}
                        className={`p-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer ${
                          copiedItemKey === 'skills-raw-list' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''
                        }`}
                        title="Copy raw skills list string"
                      >
                        {copiedItemKey === 'skills-raw-list' ? <span className="text-[9.5px] font-bold px-1 text-emerald-400">Copied List!</span> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-white/5 select-text font-mono text-[10px] text-indigo-200 leading-normal text-left">
                      {portfolioData.skills.map((sk) => sk.name).join(', ')}
                    </div>
                  </div>

                  {/* Skills organized by category tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {['frontend', 'backend', 'devops', 'tools'].map((catKey) => {
                      const matched = portfolioData.skills.filter((sk) => sk.category === catKey);
                      if (matched.length === 0) return null;
                      const catName = catKey.charAt(0).toUpperCase() + catKey.slice(1);
                      const catText = `${catName} Skills:\n${matched.map((s) => `• ${s.name} (${s.level || 'Good'})`).join('\n')}`;

                      return (
                        <div key={catKey} className="border border-white/5 bg-slate-950/40 p-3 rounded-xl flex items-start justify-between gap-3.5">
                          <div className="min-w-0 flex-1 text-left">
                            <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-indigo-400 font-sans block mb-1">{catName} Group</span>
                            <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px] text-slate-405 animate-pulse-slow">
                              {matched.map((sk) => (
                                <span key={sk.id} className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded-md leading-relaxed">{sk.name}</span>
                              ))}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleCopyText(`skills-cat-${catKey}`, catText)}
                            className={`p-1.5 rounded-lg bg-slate-950 hover:bg-indigo-600/15 border border-white/5 hover:border-indigo-500/30 text-slate-500 hover:text-indigo-400 transition-all shrink-0 ${
                              copiedItemKey === `skills-cat-${catKey}` ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' : ''
                            }`}
                            title={`Copy ${catName} technology group`}
                          >
                            {copiedItemKey === `skills-cat-${catKey}` ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          GRAND RAW SCHEMA MODEL JSON WORKSPACE OVERLAY (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isJsonMode && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen no-print select-text animate-fade-in overflow-hidden font-sans"
        >
          {/* Header Bar */}
          <header className="p-4 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-inner shrink-0">
                <Code className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-white font-sans">
                  Portfolio Model JSON Console
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide font-sans">
                  Live Schema Raw Editor & Diagnostic Validator
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleSetMode(null);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 shadow select-none"
                type="button"
              >
                <X className="w-4 h-4" />
                <span>Exit JSON Mode</span>
              </button>
            </div>
          </header>

          {/* Main Workspace split */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-950">
            {/* Left Panel: Control / Diagnostics Console */}
            <div className="w-full lg:w-80 bg-slate-900 border-r border-white/5 flex flex-col p-4 shrink-0 overflow-y-auto gap-4 select-none">
              
              {/* Validation Status Indicator */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Linter Status</span>
                {jsonValidationError ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-left">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1 font-sans">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Syntax Error Detected</span>
                    </div>
                    <code className="text-[10px] text-rose-300 font-mono block break-words max-h-24 overflow-y-auto bg-slate-950/50 p-2 rounded-lg">
                      {jsonValidationError}
                    </code>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-left flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-emerald-400 font-bold text-xs font-sans">JSON Schema Valid</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5">Ready to be live-compiled</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Success Notification */}
              {jsonSaveSuccess && (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 text-left flex items-center gap-2.5 animate-flash-success">
                  <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-teal-400 font-semibold text-xs block font-sans">Changes Compiled Safely!</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5 font-sans">Interactive components updated.</span>
                  </div>
                </div>
              )}

              {/* Payload weight */}
              <div className="bg-slate-950 p-3.5 border border-white/5 rounded-xl text-left">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase font-mono tracking-wider mb-2">Model Analytics</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 border border-white/5 p-2 rounded-lg">
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Size</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{(rawJsonText.length / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="bg-slate-900 border border-white/5 p-2 rounded-lg">
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Lines</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{rawJsonText.split('\n').length} lines</span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Checklist */}
              <div className="bg-slate-950 p-4 border border-white/5 rounded-xl text-left space-y-2.5">
                <span className="text-[9.5px] font-bold text-indigo-400 block uppercase font-mono tracking-wider">Dynamic Fields Present</span>
                <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
                  {(() => {
                    let parsed: any = null;
                    try {
                      parsed = JSON.parse(rawJsonText);
                    } catch (e) {}

                    const profileOk = parsed?.profile?.name && parsed?.profile?.title;
                    const expCount = parsed?.experience ? parsed.experience.length : 0;
                    const eduCount = parsed?.education ? parsed.education.length : 0;
                    const skillsCount = parsed?.skills ? parsed.skills.length : 0;
                    const projectsCount = parsed?.projects ? parsed.projects.length : 0;
                    const sectionsOk = parsed?.sections && typeof parsed.sections === 'object';

                    return (
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Profile Name & Title:</span>
                          <span className={profileOk ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            {profileOk ? '✔ Loaded' : '✖ Missing'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Education Nodes:</span>
                          <span className="text-indigo-300">{eduCount} records</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Work History:</span>
                          <span className="text-indigo-300">{expCount} roles</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Indexed Skills:</span>
                          <span className="text-indigo-300">{skillsCount} items</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Creations Portfolio:</span>
                          <span className="text-indigo-300">{projectsCount} works</span>
                        </li>
                        <li className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-sans">Section Meta Aliases:</span>
                          <span className={sectionsOk ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                            {sectionsOk ? '✔ Configured' : '✖ Default'}
                          </span>
                        </li>
                      </ul>
                    );
                  })()}
                </div>
              </div>

              {/* Drag & Drop File Upload Area */}
              <div 
                className="border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-4 bg-slate-950/40 text-center transition-colors cursor-pointer group"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = evt.target?.result as string;
                        setRawJsonText(content);
                        try {
                          JSON.parse(content);
                          setJsonValidationError(null);
                        } catch (err: any) {
                          setJsonValidationError(err.message || 'Invalid uploaded JSON');
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              >
                <Download className="w-5 h-5 mx-auto text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-transform mb-1.5 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 block font-sans">Import JSON File</span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-sans">Click to browse or drag .json schema here</span>
              </div>

              {/* Action Operations Column */}
              <div className="space-y-2 mt-auto">
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rawJsonText);
                      setRawJsonText(JSON.stringify(parsed, null, 2));
                      setJsonValidationError(null);
                    } catch (e: any) {
                      setJsonValidationError(e.message || "Invalid JSON syntax");
                    }
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono border border-white/5 cursor-pointer text-slate-205 transition-colors flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-100" />
                  <span>Format / Beautify</span>
                </button>

                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rawJsonText);
                      setRawJsonText(JSON.stringify(parsed));
                      setJsonValidationError(null);
                    } catch (e: any) {
                      setJsonValidationError(e.message || "Invalid JSON syntax");
                    }
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono border border-white/5 cursor-pointer text-slate-205 transition-colors flex items-center justify-center gap-1.5"
                  type="button"
                >
                  <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  <span>Minify JSON Code</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setRawJsonText(JSON.stringify(defaultPortfolioData, null, 2));
                      setJsonValidationError(null);
                    }}
                    className="py-1.5 bg-slate-800/50 hover:bg-slate-800 hover:text-rose-300 rounded-lg text-[9px] font-bold tracking-wider uppercase font-mono border border-white/5 cursor-pointer text-slate-400 transition-colors"
                    type="button"
                    title="Load original template data"
                  >
                    Reset Default
                  </button>
                  <button
                    onClick={() => {
                      setRawJsonText("");
                      setJsonValidationError("JSON body is empty");
                    }}
                    className="py-1.5 bg-slate-800/50 hover:bg-slate-800 hover:text-rose-300 rounded-lg text-[9px] font-bold tracking-wider uppercase font-mono border border-white/5 cursor-pointer text-slate-400 transition-colors"
                    type="button"
                    title="Clear text buffer"
                  >
                    Clear Slate
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full min-h-0">
              
              {/* Copy / Save Toolbar */}
              <div className="bg-slate-900 border-b border-white/5 px-4 py-2 flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] font-mono text-slate-400">Raw Source Editor</span>
                
                <div className="flex items-center gap-1.5">
                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rawJsonText);
                      handleCopyText('json-edit-console', rawJsonText);
                    }}
                    className={`px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-bold rounded-lg border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      copiedItemKey === 'json-edit-console' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : ''
                    }`}
                  >
                    {copiedItemKey === 'json-edit-console' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>JSON Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  {/* Save Changes button */}
                  <button
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(rawJsonText);
                        setPortfolioData(parsed);
                        localStorage.setItem('developer-portfolio-schema', JSON.stringify(parsed));
                        setJsonValidationError(null);
                        setJsonSaveSuccess(true);
                        setTimeout(() => setJsonSaveSuccess(false), 4000);
                      } catch (err: any) {
                        setJsonValidationError(err.message || 'Syntax parser compile failure');
                      }
                    }}
                    disabled={!!jsonValidationError}
                    className={`px-3.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 select-none ${
                      jsonValidationError 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                        : 'bg-violet-600 hover:bg-violet-500 text-white cursor-pointer hover:shadow-lg active:scale-95'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Save to Active Schema</span>
                  </button>
                </div>
              </div>

              {/* Textarea container */}
              <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-950">
                {/* Simulated Monospace Line numbers column */}
                <div className="w-12 bg-slate-905 border-r border-white/5 py-3 text-right select-none font-mono text-[10px] text-slate-600 pr-2 leading-6 overflow-hidden">
                  {Array.from({ length: Math.min(2000, rawJsonText.split('\n').length || 1) }).map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>

                {/* Main Raw Code Editor Textarea */}
                <textarea
                  value={rawJsonText}
                  onChange={(e) => {
                    setRawJsonText(e.target.value);
                    try {
                      JSON.parse(e.target.value);
                      setJsonValidationError(null);
                    } catch (err: any) {
                      setJsonValidationError(err.message || "Invalid JSON syntax");
                    }
                  }}
                  className="flex-1 h-full font-mono text-xs bg-slate-950 text-slate-100 p-3 py-4 focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none leading-6 whitespace-pre overflow-y-auto"
                  placeholder='{"profile": { ... }}'
                  spellCheck={false}
                  autoFocus
                />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          FULLSCREEN SPLIT CHAT MODE INTERACTIVE PANEL (No-Print)
          ────────────────────────────────────────────────────────────────── */}
      {isFullscreenChat && (
        <div 
          className="fixed inset-0 z-50 bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col h-screen no-print select-none animate-fade-in text-slate-100"
        >
          {/* Top Control Header Bar */}
          <div className="p-4 bg-slate-900 border-b border-[var(--border-color)] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-left font-sans">
                <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-wider text-white">
                  AmiruLLM Command Center
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                  Real-Time Telemetry & Representative Dialogue Split Room
                </p>
              </div>
            </div>
            <div>
              <button
                onClick={() => {
                  setIsFullscreenChat(false);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('fullscreen');
                  window.history.pushState({}, '', url.toString());
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <X className="w-4 h-4" />
                <span>Exit Hub</span>
              </button>
            </div>
          </div>

          {/* Split Panel Body */}
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden h-full min-h-0 bg-slate-950">
            {/* Left Pane: Stats Component & Telemetry tabs */}
            <div className="flex-1 h-full min-h-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-lg flex flex-col">
              {/* Tab Selector Bar */}
              <div className="bg-slate-900/60 p-2.5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 shrink-0 select-none">
                <div className="flex bg-slate-950/60 p-1 rounded-xl border border-[var(--border-color)] text-xs font-sans">
                  <button
                    onClick={() => setFullscreenLeftTab('budget')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                      fullscreenLeftTab === 'budget'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Eco-Budget</span>
                  </button>
                  <button
                    onClick={() => setFullscreenLeftTab('logs')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                      fullscreenLeftTab === 'logs'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>System Logs</span>
                  </button>
                  <button
                    onClick={() => setFullscreenLeftTab('quota')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                      fullscreenLeftTab === 'quota'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Telemetry Quota</span>
                  </button>
                  <button
                    onClick={() => {
                      setFullscreenLeftTab('comparison');
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', 'comparison');
                      window.history.pushState({}, '', url.toString());
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all cursor-pointer ${
                      fullscreenLeftTab === 'comparison'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-indigo-300 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Job Matcher</span>
                  </button>
                </div>

                {/* Refresh/Action status */}
                <div className="flex items-center gap-2">
                  {fullscreenLeftTab === 'logs' && (
                    <button
                      onClick={fetchApiLogs}
                      disabled={apiLogsLoading}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                      title="Sync system logs"
                      type="button"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${apiLogsLoading ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                  )}
                  {fullscreenLeftTab === 'quota' && (
                    <button
                      onClick={fetchApiQuota}
                      disabled={apiQuotaLoading}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                      title="Sync telemetry quota"
                      type="button"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${apiQuotaLoading ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Contents Pane */}
              <div className="flex-1 min-h-0 overflow-hidden relative">
                {fullscreenLeftTab === 'budget' && (
                  <TokenStatsModal 
                    onClose={() => {}} 
                    isInline={true} 
                    key={`stats-${chatMessages.length}`}
                  />
                )}

                {fullscreenLeftTab === 'logs' && (
                  <div className="h-full flex flex-col bg-slate-950 text-slate-300 overflow-hidden">
                    {apiLogsLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-3 font-sans">
                        <RotateCw className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Querying server log folders...</span>
                      </div>
                    ) : apiLogsError ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans">
                        <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display">Server Log Link Error</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-sm">{apiLogsError}</p>
                        </div>
                        <button
                          onClick={fetchApiLogs}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                          type="button"
                        >
                          Retry Network Request
                        </button>
                      </div>
                    ) : selectedLogFilename ? (() => {
                        const rawContent = apiLogsData?.logs?.[selectedLogFilename] || '';
                        const parsed = parseLogFile(rawContent);
                        const isSuccess = parsed.httpCode === '200';

                        return (
                          <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-left">
                            {/* Back button and title */}
                            <div className="p-3 bg-slate-900 border-b border-white/5 flex items-center justify-between gap-2 select-none shrink-0 font-sans">
                              <button
                                onClick={() => setSelectedLogFilename(null)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>All Logs</span>
                              </button>
                              <span className="text-[10px] font-mono font-bold text-slate-450 truncate max-w-[180px] sm:max-w-none">
                                {selectedLogFilename}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                                  isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {parsed.httpCode || 'UNKNOWN'}
                                </span>
                              </div>
                            </div>

                            {/* Token, Latency Summary Banner */}
                            <div className="grid grid-cols-3 gap-1 bg-slate-900/40 p-2.5 border-b border-white/5 shrink-0 text-center select-none font-sans">
                              <div className="border-r border-white/5">
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Input Tokens</span>
                                <span className="text-xs font-mono font-black text-slate-300">{parsed.inputToks || '0'}</span>
                              </div>
                              <div className="border-r border-white/5">
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Output Tokens</span>
                                <span className="text-xs font-mono font-black text-indigo-400">{parsed.outputToks || '0'}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-500 uppercase block font-bold">Response Elapsed</span>
                                <span className="text-xs font-mono font-black text-emerald-450">{parsed.elapsedSec || '0.0s'}</span>
                              </div>
                            </div>

                            {/* Sub tab selectors for Log Explorer details */}
                            <div className="flex bg-slate-900/60 p-1 border-b border-white/5 text-[10px] font-sans select-none shrink-0">
                              <button
                                onClick={() => setActiveLogSectionTab('overview')}
                                className={`flex-1 py-1.5 rounded-lg text-center font-bold uppercase tracking-wider text-[8px] sm:text-[9px] transition-all cursor-pointer ${
                                  activeLogSectionTab === 'overview' ? 'bg-indigo-650 text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Overview
                              </button>
                              <button
                                onClick={() => setActiveLogSectionTab('dialogue')}
                                className={`flex-1 py-1.5 rounded-lg text-center font-bold uppercase tracking-wider text-[8px] sm:text-[9px] transition-all cursor-pointer ${
                                  activeLogSectionTab === 'dialogue' ? 'bg-indigo-650 text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Dialogue Trace
                              </button>
                              <button
                                onClick={() => setActiveLogSectionTab('raw')}
                                className={`flex-1 py-1.5 rounded-lg text-center font-bold uppercase tracking-wider text-[8px] sm:text-[9px] transition-all cursor-pointer ${
                                  activeLogSectionTab === 'raw' ? 'bg-indigo-650 text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Raw Content
                              </button>
                            </div>

                            {/* Details Pane body */}
                            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
                              {activeLogSectionTab === 'overview' && (
                                <div className="space-y-4 animate-fade-in text-[11px] font-sans">
                                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                                    <h4 className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Gateway Telemetry Headers</h4>
                                    <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Client IP</span>
                                        <span className="text-slate-300 break-all">{parsed.ip || 'No IP'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Log Timestamp</span>
                                        <span className="text-slate-300">{parsed.timestamp || 'No timestamp'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Call category</span>
                                        <span className="text-emerald-450 uppercase font-bold">{parsed.callType || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Target routing agent</span>
                                        <span className="text-slate-300">{parsed.agent || '-'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                                    <h4 className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Model Configuration Parameters</h4>
                                    <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Inference Model</span>
                                        <span className="text-indigo-300 font-bold">{parsed.model || 'mimo-v2.5'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">API Protocol Type</span>
                                        <span className="text-slate-300 uppercase font-bold">{parsed.protocol || 'Unknown'}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Access Endpoint URL</span>
                                        <span className="text-slate-400 break-all leading-normal text-[9px] block bg-slate-950 p-2 rounded border border-white/5 mt-1">{parsed.endpoint || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-slate-500 uppercase block font-sans font-bold">Budget Quota Limit</span>
                                        <span className="text-slate-300">{parsed.maxTokens || '1024'} max tokens</span>
                                      </div>
                                    </div>
                                  </div>

                                  {parsed.system && (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-1.5">
                                      <span className="text-[8px] text-slate-500 uppercase block font-bold">System Directive Overrides</span>
                                      <div className="font-mono text-[10px] text-slate-450 bg-slate-950 p-2 border border-white/5 rounded max-h-[100px] overflow-y-auto leading-normal whitespace-pre-wrap">
                                        {parsed.system}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeLogSectionTab === 'dialogue' && (
                                <div className="space-y-4 animate-fade-in text-xs font-sans">
                                  {/* Prompt Input Block */}
                                  {parsed.messageQuestion && (
                                    <div className="space-y-1.5 text-left">
                                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-widest pl-1 block">Inquiry Prompt payload:</span>
                                      <div className="bg-slate-900 border border-white/5 p-3 rounded-2xl rounded-tl-none text-slate-200 whitespace-pre-wrap break-words leading-relaxed max-h-[150px] overflow-y-auto scrollbar-thin text-xs">
                                        {parsed.messageQuestion}
                                      </div>
                                    </div>
                                  )}

                                  {/* Conversation string history */}
                                  {parsed.conversationHistory && (
                                    <div className="space-y-2 text-left">
                                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-widest pl-1 block">Conversation history stream:</span>
                                      <div className="bg-slate-900 border border-white/5 p-3 rounded-xl max-h-[220px] overflow-y-auto scrollbar-thin text-[10px] font-mono leading-relaxed text-slate-400 space-y-3 select-text whitespace-pre-wrap">
                                        {parsed.conversationHistory}
                                      </div>
                                    </div>
                                  )}

                                  {/* Response Block representation */}
                                  {parsed.responseOutput && (
                                    <div className="space-y-1.5 text-left">
                                      <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-widest pl-1 block text-left">Model returned output:</span>
                                      <div className="bg-slate-900 border border-white/5 p-3.5 rounded-2xl rounded-tr-none text-slate-205 leading-relaxed max-h-[240px] overflow-y-auto scrollbar-thin text-xs text-left bg-gradient-to-br from-indigo-950/20 to-purple-950/10">
                                        {parsed.responseOutput}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeLogSectionTab === 'raw' && (
                                <div className="space-y-3 animate-fade-in h-full flex flex-col min-h-0 text-left">
                                  <div className="flex justify-between items-center select-none font-sans text-left">
                                    <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">Plain Text Buffer ({rawContent.length} chars)</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(rawContent);
                                        setCopiedLogStatus(true);
                                        setTimeout(() => setCopiedLogStatus(false), 2000);
                                      }}
                                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-[9px] uppercase font-bold text-slate-300 rounded border border-white/5 cursor-pointer select-none transition-all flex items-center gap-1"
                                      type="button"
                                    >
                                      {copiedLogStatus ? "Copied!" : "Copy Txt"}
                                    </button>
                                  </div>
                                  <div className="flex-1 min-h-[250px] bg-slate-950 p-3 rounded-xl border border-white/5 overflow-y-auto font-mono text-[9px] text-slate-450 leading-relaxed whitespace-pre select-text text-left scrollbar-thin">
                                    {rawContent}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })() : (
                      <div className="flex-1 flex flex-col min-h-0 text-left">
                        {/* Summary panel */}
                        <div className="p-4 border-b border-white/5 shrink-0 select-none">
                          <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-3.5 rounded-2xl border border-white/5 font-sans">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block font-bold">Terminal IP Address</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{apiLogsData?.ip || 'Detecting...'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-550 uppercase block font-bold">Diagnostic Log Records</span>
                              <span className="text-xs font-mono font-bold text-slate-200">{apiLogsData?.total_files || 0} active files</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive File Accordion List */}
                        {!apiLogsData?.logs || Object.keys(apiLogsData.logs).length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center font-sans">
                            <Terminal className="w-10 h-10 text-slate-650 animate-pulse" />
                            <div>
                              <span className="text-xs font-bold text-slate-300 block">No Server Logs Recorded</span>
                              <span className="text-[10px] text-slate-500 mt-1 max-w-xs block leading-relaxed">No telemetry dialog triggers found or compiled under your client IP. Use chatbot prompts to generate event logs.</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-h-0 flex flex-col p-4 pt-2 gap-3 overflow-hidden select-none">
                            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block font-sans text-left">Available Telemetry Logs:</span>
                            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                              {Object.entries(apiLogsData.logs).map(([filename, rawContent]: [string, any]) => {
                                const parsed = parseLogFile(rawContent);
                                const isSuccess = parsed.httpCode === '200';
                                const timeLabel = parsed.timestamp 
                                  ? parsed.timestamp.split(' ').pop() 
                                  : filename.split('_').slice(2).join('_').replace('.log','').replaceAll('-',':');

                                return (
                                  <button
                                    key={filename}
                                    onClick={() => {
                                      setSelectedLogFilename(filename);
                                      setActiveLogSectionTab('overview');
                                    }}
                                    className="w-full text-left bg-slate-900 hover:bg-slate-900/85 border border-white/5 hover:border-indigo-500/30 rounded-xl overflow-hidden flex items-stretch p-3 gap-3 transition-all cursor-pointer group text-slate-350"
                                    type="button"
                                  >
                                    <div className={`p-2 rounded-lg flex items-center justify-center border shrink-0 ${
                                      isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                      <Terminal className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0 pr-1 select-none font-sans">
                                      <div className="flex items-center justify-between gap-2.5">
                                        <span className="text-[11px] font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                                          {filename.length > 24 ? `${filename.slice(0, 24)}...` : filename}
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-500 shrink-0">
                                          {timeLabel || 'API LOG'}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center mt-1.5 gap-2 text-[9px] font-mono text-slate-500">
                                        <span className="bg-slate-950 px-1.5 py-0.5 rounded font-bold border border-white/5 text-slate-400">{parsed.model || 'mimo-v2.5'}</span>
                                        <span>•</span>
                                        <span className="text-indigo-400/90 font-bold">{parsed.totalToks || '0'} tokens</span>
                                        <span>•</span>
                                        <span className="text-emerald-500/90 font-semibold">{parsed.elapsedSec || '0.0s'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center shrink-0 pr-1 text-slate-600 group-hover:text-slate-300 transition-colors">
                                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {fullscreenLeftTab === 'quota' && (
                  <div className="h-full flex flex-col bg-slate-950 p-4 sm:p-5 overflow-y-auto select-text">
                    {apiQuotaLoading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        <RotateCw className="w-8 h-8 animate-spin text-indigo-500" />
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">Interrogating API quota endpoint...</span>
                      </div>
                    ) : apiQuotaError ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans">
                        <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-slate-200 uppercase tracking-widest font-display">Quota Query Failure</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-sm">{apiQuotaError}</p>
                        </div>
                        <button
                          onClick={fetchApiQuota}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                          type="button"
                        >
                          Retry Telemetry Sync
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-fade-in font-sans text-left">
                        {/* Core Quota Meter Card */}
                        {(() => {
                          const limit = apiQuotaData?.quota?.limit_24h || 50000;
                          const used = apiQuotaData?.quota?.used_24h || 0;
                          const remaining = apiQuotaData?.quota?.remaining_24h || limit;
                          const calls = apiQuotaData?.quota?.calls_24h || 0;
                          const allowed = apiQuotaData?.quota?.allowed !== false;
                          const usagePercent = Math.min(100, Math.floor((used / limit) * 100));

                          return (
                            <>
                              <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl relative overflow-hidden group shadow-lg text-left">
                                <div className="absolute top-0 right-0 p-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest font-mono ${
                                    allowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${allowed ? 'bg-emerald-500 animate-pulse' : 'bg-rose-550'}`}></span>
                                    {allowed ? 'Active / Allowed' : 'Denied / Rate Limited'}
                                  </span>
                                </div>

                                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide text-indigo-400 block">24H API Token Budget Balance</span>
                                <h3 className="text-2xl font-black text-slate-100 font-display mt-1.5">
                                  {remaining.toLocaleString()} <span className="text-slate-500 text-xs font-medium font-sans">tokens remaining</span>
                                </h3>

                                {/* Visual Progress gauge bar */}
                                <div className="mt-4 space-y-2">
                                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                      style={{ width: `${usagePercent}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between items-baseline text-[10px] text-slate-400 font-mono">
                                    <span>Used: {used.toLocaleString()} ({usagePercent}%)</span>
                                    <span>Limit: {limit.toLocaleString()} tokens</span>
                                  </div>
                                </div>
                              </div>

                              {/* Stat Card Grid */}
                              <div className="grid grid-cols-2 gap-3 text-left">
                                <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-xl">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase block">API Calls (24H)</span>
                                  <span className="text-base font-black text-slate-200 mt-1 block">{calls} request(s)</span>
                                </div>
                                <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-xl">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Budget Renewal Reset</span>
                                  <span className="text-[10px] font-mono text-slate-400 mt-1 block leading-tight truncate" title={apiQuotaData?.quota?.reset_at || 'Never'}>
                                    {apiQuotaData?.quota?.reset_at ? new Date(apiQuotaData.quota.reset_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Continuous'}
                                  </span>
                                </div>
                              </div>

                              {/* All time accumulator card */}
                              {apiQuotaData?.all_time && (
                                <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-indigo-900/20 p-4 rounded-xl text-left">
                                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide text-purple-400 block mb-2">All-Time Cumulative Telemetry Logs</span>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-[9px] text-slate-450 uppercase">Total API Hits</span>
                                      <span className="text-sm font-black text-slate-200 block mt-0.5">{apiQuotaData.all_time.total_calls || 0}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-slate-450 uppercase">Total Tokens Exchanged</span>
                                      <span className="text-sm font-black text-slate-200 block mt-0.5 font-mono">{apiQuotaData.all_time.total_tokens?.toLocaleString() || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Footer metadata details */}
                              <div className="bg-slate-900/30 border border-white/5 p-3.5 rounded-xl flex items-center justify-between text-[10px] text-slate-550 font-mono text-left">
                                <div>
                                  <span className="block text-[8px] uppercase text-slate-600 font-bold font-sans">Client System IP</span>
                                  <span>{apiQuotaData?.ip || 'Unknown'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[8px] uppercase text-slate-600 font-bold font-sans">Sync Reference Time</span>
                                  <span>{apiQuotaData?.timestamp ? new Date(apiQuotaData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {fullscreenLeftTab === 'comparison' && (
                  <div className="h-full flex flex-col bg-slate-950 p-4 sm:p-5 overflow-y-auto select-text scrollbar-thin">
                    <div className="space-y-5 animate-fade-in font-sans text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                          <div>
                            <h3 className="text-sm font-display font-black text-slate-100 uppercase tracking-wide">
                              AmiruLLM Job Match Reporter
                            </h3>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              Evaluate candidate alignment, bridge technical gaps, and generate customized reports.
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setHideChatInComparison(!hideChatInComparison)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-[9px] uppercase font-bold tracking-wider cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                          type="button"
                          title={hideChatInComparison ? "Show Chat Panel" : "Hide Chat Panel"}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{hideChatInComparison ? "Show Chat Tab" : "Hide Chat Tab"}</span>
                        </button>
                      </div>

                      {comparisonReport ? (
                        <div className="space-y-4">
                          {renderComparisonReport(comparisonReport)}
                          
                          {/* AmiruLLM Tailored Cover Letter Card */}
                          <div className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-5 space-y-4 shadow-lg mt-6 animate-fade-in text-left">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-400" />
                                <h4 className="text-[11px] font-display font-black text-slate-100 uppercase tracking-wider">
                                  AmiruLLM Custom Cover Letter
                                </h4>
                              </div>
                              {coverLetter && (
                                <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                  TAILORED READY
                                </span>
                              )}
                            </div>

                            {isGeneratingCoverLetter ? (
                              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                <RotateCw className="w-6 h-6 animate-spin text-indigo-400" />
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
                                  AmiruLLM drafting cover letter tailored to this role...
                                </p>
                              </div>
                            ) : coverLetter ? (
                              <div className="space-y-3.5">
                                <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                                  Review your customized cover letter, professionally crafted using Amirul Sadikin's CV alignment and experience:
                                </p>
                                <div className="bg-slate-950 border border-white/5 rounded-xl p-4 max-h-[320px] overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed select-text whitespace-pre-wrap scrollbar-thin">
                                  {coverLetter}
                                </div>
                                
                                {coverLetterError && (
                                  <p className="text-[9.5px] font-bold text-rose-400 font-mono flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    <span>{coverLetterError}</span>
                                  </p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(coverLetter);
                                      alert("Cover letter successfully copied to your clipboard!");
                                    }}
                                    className="py-2 px-3 bg-slate-800 hover:bg-slate-750 border border-white/5 text-slate-200 hover:text-white rounded-lg text-[9.5px] uppercase font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                    type="button"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Letter</span>
                                  </button>
                                  <button
                                    onClick={downloadCoverLetter}
                                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-[9.5px] uppercase font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                    type="button"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download .TXT</span>
                                  </button>
                                  <button
                                    onClick={handleGenerateCoverLetter}
                                    className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-400 hover:text-slate-300 rounded-lg text-[9.5px] uppercase font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                    type="button"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Regenerate</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 py-2">
                                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                  Instantly craft a persuasive, tailored cover letter customized precisely to address the job requirements, highlighting core matches (React, PyTorch/YOLO computer vision, Laravel, MVC architectures) and professionally bridging any technology gaps with positive justifications.
                                </p>
                                
                                {coverLetterError && (
                                  <p className="text-[9.5px] font-bold text-rose-400 font-mono flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    <span>{coverLetterError}</span>
                                  </p>
                                )}

                                <button
                                  onClick={handleGenerateCoverLetter}
                                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-550 hover:to-purple-600 active:scale-[0.99] text-white rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                                  type="button"
                                >
                                  <FileText className="w-4 h-4 text-indigo-200" />
                                  <span>Generate Tailored Cover Letter</span>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t border-white/5 shrink-0">
                            <button
                              onClick={() => {
                                setComparisonReport('');
                                setComparisonError('');
                                setCoverLetter('');
                                setCoverLetterError('');
                              }}
                              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-white/25 active:scale-[0.98] text-slate-200 hover:text-white rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              type="button"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Analyze Another Job</span>
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(comparisonReport);
                                alert("Report copied to your clipboard successfully!");
                              }}
                              className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              type="button"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Alignment Report</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-3 leading-relaxed">
                            <p className="text-[11px] text-slate-300">
                              AmiruLLM dynamically assesses job criteria, parses technical matches, and outlines positive justifications for required skills not listed on the CV (such as providing <strong>strategic systems/backend logic compensation</strong> for enterprise technologies like .NET, and highlighting the MVC fundamentals equivalence of <strong>Laravel</strong>).
                            </p>
                            
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block tracking-wider">QUICK PRESET TEST TEMPLATES:</span>
                              <div className="flex flex-col gap-1.5">
                                {[
                                  {
                                    title: "Senior Full-Stack Engineer (.NET & Web APIs)",
                                    content: `Position: Senior Full-Stack Developer\nKey Requirements:\n- 5+ years of experience in enterprise development.\n- Deep hands-on knowledge of C# and .NET Core backend ecosystems.\n- Responsive modern front-ends (React, TypeScript, or Angular).\n- Relational database designs with SQL Server, PostgreSQL, or MySQL.\n- Restful Web API developments and asynchronous processing.`
                                  },
                                  {
                                    title: "Senior MVC Backend Developer (Laravel, PHP, Redis)",
                                    content: `Position: Backend Developer (Laravel)\nKey Requirements:\n- Build high-performance backend pipelines in PHP & Laravel.\n- Cache scaling using Redis and robust database designs with MySQL/PostgreSQL.\n- Understand Model-View-Controller (MVC) architectures and design patterns.\n- Strong knowledge of APIs, jobs/queues, and WebSockets.`
                                  },
                                  {
                                    title: "AI Computer Vision Specialist (PyTorch, YOLO)",
                                    content: `Position: Computer Vision Specialist\nKey Requirements:\n- Experience in computer vision systems design and pipelines.\n- Deep learning architectures including YOLO, PyTorch, and DeepSORT.\n- Real-time video processing, RTSP stream decoding, and asynchronous execution.\n- Docker containers deployment and Kafka/Redis streaming queues.`
                                  }
                                ].map((preset, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setJobDescriptionInput(preset.content);
                                      setComparisonError('');
                                    }}
                                    className="px-3 py-2 bg-slate-950/60 hover:bg-slate-900 text-left border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer block text-[10px]"
                                    type="button"
                                  >
                                    <span className="font-bold text-indigo-300 block">{preset.title}</span>
                                    <span className="text-slate-500 text-[9px] truncate block mt-0.5">{preset.content.replace(/\n/g, ' ')}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Paste Job Description Advertisement:</label>
                            <textarea
                              value={jobDescriptionInput}
                              onChange={(e) => {
                                setJobDescriptionInput(e.target.value);
                                if (comparisonError) setComparisonError('');
                              }}
                              placeholder="Paste the target job description requirements here..."
                              className="w-full h-44 bg-slate-900 border border-white/5 rounded-xl p-3 text-slate-200 text-xs font-sans placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none scrollbar-thin"
                            />
                          </div>

                          {comparisonError && (
                            <p className="text-[10px] font-bold text-rose-400 font-mono flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span>{comparisonError}</span>
                            </p>
                          )}

                          <button
                            onClick={handleJobComparison}
                            disabled={isComparing}
                            className="w-full py-3 bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                            type="button"
                          >
                            {isComparing ? (
                              <>
                                <RotateCw className="w-4 h-4 animate-spin text-white" />
                                <span>AMIRULLM ANALYZING ALIGNMENT...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-indigo-200" />
                                <span>COMPARE & GENERATE MATCH REPORT</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Full-Height Chat Component */}
            {!(fullscreenLeftTab === 'comparison' && hideChatInComparison) && (
              <div className="w-full md:w-[450px] lg:w-[490px] h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-lg overflow-hidden min-h-0 shrink-0">
              {/* Chat Sub-Header */}
              <div className="bg-gradient-to-r from-indigo-750 via-indigo-600 to-purple-800 text-white p-4 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/10 dark:bg-black/20 flex items-center justify-center border border-white/20 shadow-inner">
                      <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full animate-ping"></span>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-secondary)] rounded-full"></span>
                  </div>
                  <div className="text-left font-sans">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">AmiruLLM Dynamic Chat</h4>
                    <p className="text-[9px] text-indigo-200 font-semibold tracking-wide">Carrier Dialogue Representative</p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={handleRestartConversation}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-sans"
                    title="Restart Conversation"
                    aria-label="Restart Conversation"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-[10px] font-bold">Restart</span>
                  </button>
                </div>
              </div>

              {/* Settings Sub-Header Controls */}
              <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-2.5 flex flex-col gap-2 shrink-0 select-none text-xs font-sans">
                {/* Length toggle */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Response Style:</span>
                  <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-color)] shrink-0">
                    <button
                      type="button"
                      onClick={() => setChatLengthMode('short')}
                      className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                        chatLengthMode === 'short'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Short (≤50w)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatLengthMode('long')}
                      className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                        chatLengthMode === 'long'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      Long (≤300w)
                    </button>
                  </div>
                </div>

                {/* Personality toggle */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Personality:</span>
                  <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg border border-[var(--border-color)] shrink-0">
                    {(['professional', 'funny', 'arrogant'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setChatToneMode(tone)}
                        className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded transition-all cursor-pointer capitalize ${
                          chatToneMode === tone
                            ? tone === 'professional'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : tone === 'funny'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-rose-600 text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tone === 'funny' ? 'Funny 😜' : tone === 'arrogant' ? 'Arrogant 😠' : 'Professional 💼'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rate limit warning and donation banner */}
              {apiQuotaData?.quota?.allowed === false && (
                <div className="bg-rose-500/10 border-b border-rose-500/25 p-3.5 space-y-2.5 text-left shrink-0 font-sans">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-bold text-rose-300 uppercase tracking-wide">Daily Rate Limit Reached</h5>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                        You are asking a lot of questions and it's reaching the limit for today. To support AmiruLLM's server costs and unlock queries, please consider sponsoring:
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 space-y-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[10px] font-medium text-slate-300">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider block text-[8px] mb-0.5">Sponsorship Account</span>
                      Touch 'n Go: <span className="text-white font-black">+0197767497</span> (AMIRUL SADIKIN)
                    </div>
                    <div className="overflow-hidden rounded-lg border border-white/10 w-[90px] h-[90px] bg-white p-1 shrink-0">
                      <img 
                        src="https://amirul.cloud/pay.jpg" 
                        alt="Touch 'n Go QR" 
                        className="w-full h-full object-contain rounded"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-primary)]/30 scrollbar-thin flex flex-col text-left">
                {chatMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3 font-sans">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <MessageSquare className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Inquire Representative Brain</h4>
                      <p className="text-[11px] mt-1 text-slate-500 max-w-xs leading-normal">
                        Type a custom inquiry below or utilize one of our quick seeding chips to trigger career dialogue.
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-505/20 shrink-0 flex items-center justify-center text-[9px] font-extrabold select-none">
                          AI
                        </div>
                      )}
                      <div>
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed font-sans whitespace-pre-wrap break-words ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-xs text-left'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {(() => {
                            const imgRegex = /<img\s+src=["']?([^"'>\s]+)["']?\s*\/?>/gi;
                            const parts = msg.content.split(imgRegex);
                            if (parts.length === 1) {
                              return msg.content;
                            }
                            return parts.map((part, i) => {
                              if (i % 2 === 1) {
                                return (
                                  <div key={i} className="my-2.5 overflow-hidden rounded-xl border border-white/10 max-w-[220px] bg-white p-2 shadow-lg transition-transform hover:scale-[1.02]">
                                    <a 
                                      href={part} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      title="Click to view image"
                                      className="block cursor-zoom-in"
                                    >
                                      <img 
                                        src={part} 
                                        alt="Embedded Content" 
                                        className="w-full h-auto rounded"
                                        referrerPolicy="no-referrer"
                                      />
                                    </a>
                                  </div>
                                );
                              }
                              return part ? <span key={i}>{part}</span> : null;
                            });
                          })()}
                          {msg.isDonation && (
                            <div className="mt-3 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-3 text-left">
                              <div className="text-[11px] text-slate-300 leading-relaxed">
                                <span className="text-rose-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">Support Server Costs</span>
                                Send Touch 'n Go sponsorship to:
                                <div className="mt-1 font-semibold text-white bg-slate-900/80 px-2 py-1 rounded border border-white/5 select-all font-mono inline-block">
                                  +0197767497
                                </div>
                                <span className="block text-[10px] text-slate-400 mt-1">Holder: AMIRUL SADIKIN</span>
                              </div>
                              <div className="overflow-hidden rounded-xl border border-white/10 max-w-[220px] mx-auto bg-white p-2 shadow-lg transition-transform hover:scale-[1.02]">
                                <a 
                                  href="https://amirul.cloud/pay.jpg" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  title="Click to open QR Code in full view"
                                  className="block cursor-zoom-in"
                                >
                                  <img 
                                    src="https://amirul.cloud/pay.jpg" 
                                    alt="Touch 'n Go QR Code" 
                                    className="w-full h-auto rounded"
                                    referrerPolicy="no-referrer"
                                  />
                                </a>
                              </div>
                              <div className="text-center">
                                <a 
                                  href="https://amirul.cloud/pay.jpg" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[9px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
                                >
                                  <span>🔍 View Full QR Image</span>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className={`text-[8px] text-[var(--text-secondary)] mt-1 font-mono block px-1 ${msg.role === 'user' && 'text-right'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Loading indicators */}
                {isChatLoading && (
                  <div className="flex gap-2.5 mr-auto max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 shrink-0 flex items-center justify-center text-[9px] font-bold">
                      AI
                    </div>
                    <div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-3.5 rounded-2xl rounded-tl-xs text-xs flex flex-col gap-2 shadow-xs max-w-[270px] sm:max-w-[310px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          <span className="font-mono text-[9px] text-[var(--text-secondary)] font-bold ml-1 flex items-center gap-1">
                            Reasoning time: <span className="text-rose-500 text-[10px] animate-pulse">{chatElapsedTime}s</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">
                          {chatElapsedTime < 4 && "⚡ Connecting to custom brain on amirul.cloud..."}
                          {chatElapsedTime >= 4 && chatElapsedTime < 9 && "🎯 Initializing resume context of Amirul..."}
                          {chatElapsedTime >= 9 && chatElapsedTime < 15 && "🧠 Analysing computer vision achievements..."}
                          {chatElapsedTime >= 15 && chatElapsedTime < 22 && "⏳ Deep reasoning with MiMo-v2.5-pro (customary: ~20s)..."}
                          {chatElapsedTime >= 22 && "🚀 Formulating finalized answer response..."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={fullscreenChatEndRef} />
              </div>

              {/* Suggestions chips */}
              <div className="px-3.5 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/70 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 whitespace-nowrap">
                {[
                  'Explain computer vision experience',
                  'What publications do you have?', 
                  'List core tech skills', 
                  'Who is your current employer?'
                ].map((suggest, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setChatInput(suggest)}
                    className="text-[10px] font-bold bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full px-2.5 py-1 text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-455 hover:border-indigo-500 transition-colors cursor-pointer select-none"
                  >
                    {suggest}
                  </button>
                ))}
              </div>

              {/* Chat Form submission */}
              <form
                onSubmit={handleSendChatMessage}
                className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Query AmiruLLM regarding this CV..."
                  disabled={isChatLoading}
                  className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer shadow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Transmit Message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
