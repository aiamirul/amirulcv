/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Save, FileJson, Upload, RefreshCw, Plus, Trash2, Mail, 
  User, Briefcase, GraduationCap, Code, BookOpen, Layers, Inbox, AlertTriangle, CheckCircle, Globe
} from 'lucide-react';
import { PortfolioData, WorkExperience, Education, Project, TechStackItem, BlogPost, SubmittedMessage, Publication, SectionVisibility } from '../types';
import { defaultPortfolioData } from '../defaultData';
import { ThemeSelector, ThemePresetVal } from './ThemeSelector';

interface CMSDashboardProps {
  data: PortfolioData;
  onUpdateData: (newData: PortfolioData) => void;
  messages: SubmittedMessage[];
  onClearMessages: () => void;
  onDeleteMessage: (id: string) => void;
  onClose: () => void;
  currentTheme: ThemePresetVal;
  onThemeChange: (theme: ThemePresetVal) => void;
}

type CMSTab = 'profile' | 'experience' | 'education' | 'projects' | 'skills' | 'blogs' | 'publications' | 'messages' | 'dataops';

export const CMSDashboard: React.FC<CMSDashboardProps> = ({
  data,
  onUpdateData,
  messages,
  onClearMessages,
  onDeleteMessage,
  onClose,
  currentTheme,
  onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState<CMSTab>('profile');
  const [profile, setProfile] = useState(data.profile);
  const [experience, setExperience] = useState<WorkExperience[]>(data.experience);
  const [education, setEducation] = useState<Education[]>(data.education);
  const [projects, setProjects] = useState<Project[]>(data.projects);
  const [skills, setSkills] = useState<TechStackItem[]>(data.skills);
  const [blogs, setBlogs] = useState<BlogPost[]>(data.blogs);
  const [publications, setPublications] = useState<Publication[]>(data.publications || []);
  const [visibility, setVisibility] = useState<SectionVisibility>(() => ({
    callingCard: data.visibility?.callingCard ?? true,
    education: data.visibility?.education ?? true,
    experience: data.visibility?.experience ?? true,
    projects: data.visibility?.projects ?? true,
    skills: data.visibility?.skills ?? true,
    blogs: data.visibility?.blogs ?? true,
    publications: data.visibility?.publications ?? true,
    contact: data.visibility?.contact ?? true,
  }));

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remoteJsonUrl, setRemoteJsonUrl] = useState('https://www.amirul.cloud/amirul.json');
  const [isUrlFetching, setIsUrlFetching] = useState(false);

  const triggerNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRemoteImportJSON = () => {
    if (!remoteJsonUrl) {
      triggerNotification('Please specify a valid URL.', 'error');
      return;
    }
    setIsUrlFetching(true);
    fetch(remoteJsonUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(parsed => {
        if (parsed.profile && parsed.education && parsed.experience && parsed.projects && parsed.skills && parsed.blogs) {
          setProfile(parsed.profile);
          setEducation(parsed.education);
          setExperience(parsed.experience);
          setProjects(parsed.projects);
          setSkills(parsed.skills);
          setBlogs(parsed.blogs);
          setPublications(parsed.publications || []);

          const importedVis = {
            callingCard: parsed.visibility?.callingCard ?? true,
            education: parsed.visibility?.education ?? true,
            experience: parsed.visibility?.experience ?? true,
            projects: parsed.visibility?.projects ?? true,
            skills: parsed.visibility?.skills ?? true,
            blogs: parsed.visibility?.blogs ?? true,
            publications: parsed.visibility?.publications ?? true,
            contact: parsed.visibility?.contact ?? true,
          };
          setVisibility(importedVis);

          onUpdateData({
            ...parsed,
            visibility: importedVis
          });
          triggerNotification('Portfolio JSON file loaded successfully from URL! Interface updated.', 'success');
        } else {
          triggerNotification('Import Failed: Invalid JSON profile structure.', 'error');
        }
      })
      .catch(err => {
        console.error(err);
        triggerNotification(`Fetch Failed: Unable to retrieve JSON. ${err instanceof Error ? err.message : String(err)}`, 'error');
      })
      .finally(() => {
        setIsUrlFetching(false);
      });
  };

  // Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateData({
      ...data,
      profile
    });
    triggerNotification('Profile configurations saved successfully!');
  };

  // Experience CRUD Helpers
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: 'New Company Corp',
      role: 'Software Engineer',
      location: 'City, Country (Remote)',
      startDate: '2025-01',
      endDate: 'Present',
      current: true,
      description: 'Describe core responsibilities and team interaction here.',
      achievements: ['Spearheaded new responsive micro-component strategies.', 'Helped boost web application load latency benchmarks.'],
      techUsed: ['React', 'TypeScript', 'Tailwind']
    };
    setExperience([newExp, ...experience]);
  };

  const handleUpdateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      if (field === 'current') {
        return { ...exp, current: value, endDate: value ? 'Present' : '' };
      }
      return { ...exp, [field]: value };
    }));
  };

  const handleUpdateExperienceAchievements = (id: string, index: number, text: string) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const updated = [...exp.achievements];
      updated[index] = text;
      return { ...exp, achievements: updated };
    }));
  };

  const handleAddAchievement = (id: string) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      return { ...exp, achievements: [...exp.achievements, 'New bullet point item'] };
    }));
  };

  const handleRemoveAchievement = (id: string, index: number) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const updated = exp.achievements.filter((_, i) => i !== index);
      return { ...exp, achievements: updated };
    }));
  };

  const handleUpdateExperienceTech = (id: string, index: number, text: string) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const updated = [...exp.techUsed];
      updated[index] = text;
      return { ...exp, techUsed: updated };
    }));
  };

  const handleAddExpTech = (id: string) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      return { ...exp, techUsed: [...exp.techUsed, 'NewTech'] };
    }));
  };

  const handleRemoveExpTech = (id: string, index: number) => {
    setExperience(prev => prev.map(exp => {
      if (exp.id !== id) return exp;
      const updated = exp.techUsed.filter((_, i) => i !== index);
      return { ...exp, techUsed: updated };
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setExperience(prev => prev.filter(exp => exp.id !== id));
  };

  const handleSaveExperienceList = () => {
    onUpdateData({
      ...data,
      experience
    });
    triggerNotification('Work Experience history updated successfully!');
  };

  // Education CRUD Helpers
  const handleAddEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      institution: 'Global Technology University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Engineering',
      startDate: '2020',
      endDate: '2024',
      description: 'Major GPA: 3.9/4.0. Completed senior capstone project on server-side state machines.'
    };
    setEducation([newEdu, ...education]);
  };

  const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(prev => prev.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
  };

  const handleSaveEducationList = () => {
    onUpdateData({
      ...data,
      education
    });
    triggerNotification('Academics logs updated successfully!');
  };

  // Projects CRUD Helpers
  const handleAddProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: 'Aesthetic Landing Flow',
      briefDescription: 'Brief description representing user-facing outcomes.',
      longDescription: 'Long comprehensive analysis illustrating core databases, rendering techniques, and layouts involved.',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
      tags: ['TypeScript', 'Vite', 'React'],
      githubLink: 'https://github.com',
      liveLink: 'https://example.com',
      featured: false
    };
    setProjects([newProj, ...projects]);
  };

  const handleUpdateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleProjectTagsChange = (id: string, tagsStr: string) => {
    const tagsArr = tagsStr.split(',').map(s => s.trim()).filter(Boolean);
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, tags: tagsArr } : p)));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProjectsList = () => {
    onUpdateData({
      ...data,
      projects
    });
    triggerNotification('Portfolio Showcase projects updated successfully!');
  };

  // Skills CRUD Helpers
  const handleAddSkill = () => {
    const newSkill: TechStackItem = {
      id: `sk_${Date.now()}`,
      name: 'GraphQL API Design',
      category: 'backend',
      proficiency: 85,
      level: 'Advanced'
    };
    setSkills([...skills, newSkill]);
  };

  const handleUpdateSkill = (id: string, field: keyof TechStackItem, value: any) => {
    setSkills(prev => prev.map(sk => {
      if (sk.id !== id) return sk;
      const updated = { ...sk, [field]: value };
      // Auto assign standard levels
      if (field === 'proficiency') {
        const val = parseInt(value) || 0;
        if (val >= 90) updated.level = 'Expert';
        else if (val >= 75) updated.level = 'Advanced';
        else if (val >= 50) updated.level = 'Proficient';
        else updated.level = 'Familiar';
      }
      return updated;
    }));
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(sk => sk.id !== id));
  };

  const handleSaveSkillsList = () => {
    onUpdateData({
      ...data,
      skills
    });
    triggerNotification('Tech Stack competencies saved successfully!');
  };

  // Blogs CRUD Helpers
  const handleAddBlogPost = () => {
    const newPost: BlogPost = {
      id: `blog_${Date.now()}`,
      title: 'Tailwind v4: Absolute Performance and Setup Innovations',
      slug: `tailwind-v4-innovations-${Date.now()}`,
      summary: 'Exploring how the modern Rust compile optimizer inside Tailwind v4 shatters development bundle speeds.',
      content: 'Write the content of your professional post here. Standard markdown formatting is fully supported inside our blogs parser.',
      category: 'Styling',
      date: new Date().toISOString().split('T')[0],
      readTime: '4 min read',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400'
    };
    setBlogs([newPost, ...blogs]);
  };

  const handleUpdateBlogPost = (id: string, field: keyof BlogPost, value: string) => {
    setBlogs(prev => prev.map(post => (post.id === id ? { ...post, [field]: value } : post)));
  };

  const handleDeleteBlogPost = (id: string) => {
    setBlogs(prev => prev.filter(post => post.id !== id));
  };

  const handleSaveBlogsList = () => {
    onUpdateData({
      ...data,
      blogs
    });
    triggerNotification('Blog articles published successfully!');
  };

  // Publications CRUD Helpers
  const handleAddPublication = () => {
    const newPub: Publication = {
      id: `pub_${Date.now()}`,
      title: 'A New Breakthrough Research Paper',
      authors: profile.name,
      journal: 'International Journal of Technology and Science',
      year: new Date().getFullYear().toString(),
      url: 'https://scholar.google.com',
      description: 'Highlight key objectives, methodologies, or outcomes of the research here.'
    };
    setPublications([newPub, ...publications]);
  };

  const handleUpdatePublication = (id: string, field: keyof Publication, value: string) => {
    setPublications(prev => prev.map(pub => (pub.id === id ? { ...pub, [field]: value } : pub)));
  };

  const handleDeletePublication = (id: string) => {
    setPublications(prev => prev.filter(pub => pub.id !== id));
  };

  const handleSavePublicationsList = () => {
    onUpdateData({
      ...data,
      publications
    });
    triggerNotification('Publications updated successfully!');
  };

  // Data Ops JSON handlers
  const handleToggleVisibility = (section: keyof SectionVisibility, checked: boolean) => {
    const updatedVisibility = {
      ...visibility,
      [section]: checked
    };
    setVisibility(updatedVisibility);
    onUpdateData({
      ...data,
      profile,
      education,
      experience,
      projects,
      skills,
      blogs,
      publications,
      visibility: updatedVisibility
    });
    triggerNotification(`Updated section visibility: ${section} is now ${checked ? 'visible' : 'hidden'}`);
  };

  const handleExportJSON = () => {
    const currentDataState: PortfolioData = {
      profile,
      education,
      experience,
      projects,
      skills,
      blogs,
      publications,
      visibility
    };

    const dataString = JSON.stringify(currentDataState, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-data-${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerNotification('JSON profile exported successfully to your downloads!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Quick verification of core keys
        if (parsed.profile && parsed.education && parsed.experience && parsed.projects && parsed.skills && parsed.blogs) {
          // Update visual inputs state
          setProfile(parsed.profile);
          setEducation(parsed.education);
          setExperience(parsed.experience);
          setProjects(parsed.projects);
          setSkills(parsed.skills);
          setBlogs(parsed.blogs);
          setPublications(parsed.publications || []);

          const importedVis = {
            callingCard: parsed.visibility?.callingCard ?? true,
            education: parsed.visibility?.education ?? true,
            experience: parsed.visibility?.experience ?? true,
            projects: parsed.visibility?.projects ?? true,
            skills: parsed.visibility?.skills ?? true,
            blogs: parsed.visibility?.blogs ?? true,
            publications: parsed.visibility?.publications ?? true,
            contact: parsed.visibility?.contact ?? true,
          };
          setVisibility(importedVis);

          // Update parent application
          onUpdateData({
            ...parsed,
            visibility: importedVis
          });
          triggerNotification('Portfolio JSON file imported successfully! Interface refreshed.', 'success');
        } else {
          triggerNotification('Import Failed: Invalid JSON profile structure. Missing critical fields.', 'error');
        }
      } catch (err) {
        triggerNotification('Import Failed: Unparseable JSON file syntax.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you absolutely sure? This will wipe your current local customizations and restore Alex Mercer\'s detailed mock configurations.')) {
      setProfile(defaultPortfolioData.profile);
      setEducation(defaultPortfolioData.education);
      setExperience(defaultPortfolioData.experience);
      setProjects(defaultPortfolioData.projects);
      setSkills(defaultPortfolioData.skills);
      setBlogs(defaultPortfolioData.blogs);
      setPublications(defaultPortfolioData.publications || []);
      setVisibility(defaultPortfolioData.visibility || {
        callingCard: true,
        education: true,
        experience: true,
        projects: true,
        skills: true,
        blogs: true,
        publications: true,
        contact: true
      });

      onUpdateData(defaultPortfolioData);
      triggerNotification('Successfully restored default mock developer data.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-sm flex justify-end no-print animate-fade-in text-slate-800">
      {/* Visual notification badge */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-xl shadow-2xl border text-white text-sm font-semibold max-w-sm animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-emerald-600 border-emerald-500' 
            : 'bg-rose-600 border-rose-500'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Editor Main Block */}
      <div className="w-full max-w-4xl bg-white h-full flex flex-col shadow-2xl relative animate-slide-left border-l border-slate-200">
        
        {/* Header toolbar */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display uppercase leading-none tracking-tight">Portfolio Admin Panel</h2>
              <p className="text-xs text-slate-400 mt-1">Live client-side CMS. Changes reflect in real-time.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
            aria-label="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core CMS Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-20 md:w-56 bg-slate-100 border-r border-slate-200 flex flex-col justify-between py-4 shrink-0 overflow-y-auto">
            <nav className="space-y-1.5 px-2">
              {[
                { id: 'profile', name: 'Profile Biography', icon: User },
                { id: 'experience', name: 'Work Experience', icon: Briefcase },
                { id: 'education', name: 'Education history', icon: GraduationCap },
                { id: 'projects', name: 'My Projects', icon: Code },
                { id: 'skills', name: 'Tech Competencies', icon: Layers },
                { id: 'blogs', name: 'Blog Engine', icon: BookOpen },
                { id: 'publications', name: 'Publications', icon: BookOpen },
                { id: 'messages', name: 'Inbox Recruiter', icon: Inbox, count: messages.filter(m => !m.read).length },
                { id: 'dataops', name: 'Data Ops (Export)', icon: FileJson },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as CMSTab)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold transition-all duration-200 focus:outline-none cursor-pointer relative ${
                      isSelected 
                        ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-indigo-500/10' 
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="hidden md:inline">{item.name}</span>
                    {!!item.count && (
                      <span className="absolute top-2 right-2 bg-rose-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="px-4 hidden md:block border-t border-slate-200 pt-4">
              <span className="text-[10px] text-slate-400 font-mono italic">
                A11y Compliant • Standard JSON State
              </span>
            </div>
          </div>

          {/* Form Content Scrolling Container */}
          <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto">
            
            {/* profile TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">General Profile Details</h3>
                  <p className="text-xs text-slate-500 -mt-2.5 mb-5">These configurations control the primary landing banners, job subtitles, and resume headers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Developer Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Professional Title</label>
                    <input 
                      type="text" 
                      value={profile.title} 
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Current Role</label>
                    <input 
                      type="text" 
                      value={profile.currentRole} 
                      onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location Coordinates</label>
                    <input 
                      type="text" 
                      value={profile.location} 
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resume Subtitle / Meta</label>
                    <input 
                      type="text" 
                      value={profile.resumeSubtitle} 
                      onChange={(e) => setProfile({ ...profile, resumeSubtitle: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="e.g. Senior Builder • Solutions Architect"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">GitHub Profile URL</label>
                    <input 
                      type="url" 
                      value={profile.githubUrl} 
                      onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LinkedIn Profile URL</label>
                    <input 
                      type="url" 
                      value={profile.linkedInUrl} 
                      onChange={(e) => setProfile({ ...profile, linkedInUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Scholar URL</label>
                    <input 
                      type="url" 
                      value={profile.googleScholarUrl || ''} 
                      onChange={(e) => setProfile({ ...profile, googleScholarUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="https://scholar.google.com/citations?user="
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Website URL (for QR code)</label>
                    <input 
                      type="url" 
                      value={profile.websiteUrl} 
                      onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="https://yourprofile.work"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profile Photo Avatar URL</label>
                    <input 
                      type="text" 
                      value={profile.avatarUrl} 
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Can be any valid Unsplash image URL or hosting path.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">QR Code Override Content (Optional)</label>
                    <input 
                      type="text" 
                      value={profile.qrOverrideContent || ''} 
                      onChange={(e) => setProfile({ ...profile, qrOverrideContent: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Enter text, email, phone or URL to load on scan"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">If specified, this overrides the default live website QR code content.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">AI Agent Live Call / Chat Link (Optional)</label>
                    <input 
                      type="url" 
                      value={profile.aiAgentUrl || ''} 
                      onChange={(e) => setProfile({ ...profile, aiAgentUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="e.g. https://vapi.ai/talk-to-my-agent-xyz or direct AI call link"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Provides a 'Talk Now (at my expense)' action in the AI Agent Room modal. Leave empty to hide.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">AI Prompt Customization Mode</label>
                    <select
                      value={profile.aiPromptMode || 'append'}
                      onChange={(e) => setProfile({ ...profile, aiPromptMode: e.target.value as 'replace' | 'append' })}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="append">Append Mode (Add as extra custom notes/guidelines)</option>
                      <option value="replace">Replace Mode (Discard default prompt, replace entirely)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Determine if your instructions combine with or completely override the template.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Prompt Guidelines (Optional)</label>
                  <textarea 
                    value={profile.aiCustomPrompt || ''} 
                    onChange={(e) => setProfile({ ...profile, aiCustomPrompt: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. You are talking to a venture capitalist, focus heavily on equity structures. Or put absolute system overrides here."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This text is seamlessly merged into your Sparkles AI Master Prompt according to selected mode.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brief Introduction Banner (1-2 sentences)</label>
                  <textarea 
                    value={profile.aboutBrief} 
                    onChange={(e) => setProfile({ ...profile, aboutBrief: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comprehensive Biography (Long profile / printable objectives)</label>
                  <textarea 
                    value={profile.aboutLong} 
                    onChange={(e) => setProfile({ ...profile, aboutLong: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>
              </form>
            )}

            {/* experience TAB */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Work Experience Journey</h3>
                    <p className="text-xs text-slate-500">Provide the chronological list of positions you held.</p>
                  </div>
                  <button
                    onClick={handleAddExperience}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Job Role
                  </button>
                </div>

                <div className="space-y-6">
                  {experience.map((exp, idx) => (
                    <div key={exp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                          Career Node #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1 px-2 border border-slate-200 text-rose-500 hover:bg-rose-50 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Company Name</label>
                          <input 
                            type="text" 
                            value={exp.company} 
                            onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Role Title</label>
                          <input 
                            type="text" 
                            value={exp.role} 
                            onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Start Date</label>
                          <input 
                            type="text" 
                            value={exp.startDate} 
                            onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="YYYY-MM"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">End Date</label>
                          <input 
                            type="text" 
                            disabled={exp.current}
                            value={exp.current ? 'Present' : exp.endDate} 
                            onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="YYYY-MM"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs disabled:bg-slate-50 disabled:text-slate-450"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Location</label>
                          <input 
                            type="text" 
                            value={exp.location} 
                            onChange={(e) => handleUpdateExperience(exp.id, 'location', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={exp.current} 
                              onChange={(e) => handleUpdateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-slate-700 uppercase">Current Job</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Short Position Description</label>
                        <textarea 
                          value={exp.description} 
                          onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>

                      {/* Job achievements bullets CRUD */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">Specific Bullet Achievements</label>
                          <button
                            type="button"
                            onClick={() => handleAddAchievement(exp.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {exp.achievements.map((ach, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2 items-center">
                              <span className="text-xs font-mono text-slate-400">•</span>
                              <input 
                                type="text" 
                                value={ach} 
                                onChange={(e) => handleUpdateExperienceAchievements(exp.id, bulletIdx, e.target.value)}
                                className="flex-1 px-3 py-1 border border-slate-200 rounded text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveAchievement(exp.id, bulletIdx)}
                                className="text-red-500 hover:text-red-700 outline-none p-1 shrink-0"
                                title="Delete bullet"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Job TechUsed CRUD */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">Technologies Deployed Here</label>
                          <button
                            type="button"
                            onClick={() => handleAddExpTech(exp.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            + Add Tech
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {exp.techUsed.map((tech, techIdx) => (
                            <div key={techIdx} className="flex items-center gap-1 bg-slate-100 pl-2 pr-1 py-1 rounded-md text-xs border border-slate-200">
                              <input 
                                type="text" 
                                value={tech} 
                                onChange={(e) => handleUpdateExperienceTech(exp.id, techIdx, e.target.value)}
                                className="w-16 bg-transparent border-none text-[11px] text-slate-800 focus:ring-0 p-0 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExpTech(exp.id, techIdx)}
                                className="text-slate-400 hover:text-red-500"
                                title="Remove tech"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveExperienceList}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Experience List
                  </button>
                </div>
              </div>
            )}

            {/* education TAB */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Academic Education Logs</h3>
                    <p className="text-xs text-slate-500">Add or modify academic degrees and certifications.</p>
                  </div>
                  <button
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Academic Node
                  </button>
                </div>

                <div className="space-y-6">
                  {education.map((edu, idx) => (
                    <div key={edu.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                          Degree Record #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="p-1 px-2 border border-slate-200 text-rose-500 hover:bg-rose-50 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Institution School</label>
                          <input 
                            type="text" 
                            value={edu.institution} 
                            onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Degree acronym/level</label>
                          <input 
                            type="text" 
                            value={edu.degree} 
                            onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="e.g. Master of Science, MSc"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Field of Study</label>
                          <input 
                            type="text" 
                            value={edu.fieldOfStudy} 
                            onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Start Year</label>
                          <input 
                            type="text" 
                            value={edu.startDate} 
                            onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Graduation Year</label>
                          <input 
                            type="text" 
                            value={edu.endDate} 
                            onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Short accomplishments or Grade description</label>
                        <textarea 
                          value={edu.description} 
                          onChange={(e) => handleUpdateEducation(edu.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveEducationList}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Education list
                  </button>
                </div>
              </div>
            )}

            {/* projects TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Showcase Projects</h3>
                    <p className="text-xs text-slate-500">Configure visual mockups, descriptions, tags, and code repositories links.</p>
                  </div>
                  <button
                    onClick={handleAddProject}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Project card
                  </button>
                </div>

                <div className="space-y-6">
                  {projects.map((proj, idx) => (
                    <div key={proj.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                          Project #{idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={proj.featured}
                              onChange={(e) => handleUpdateProject(proj.id, 'featured', e.target.checked)}
                              className="rounded text-indigo-600"
                            />
                            <span className="text-xs font-semibold text-slate-600">Feature on Hero</span>
                          </label>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1 px-2 border border-slate-200 text-rose-500 hover:bg-rose-50 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Project Title</label>
                          <input 
                            type="text" 
                            value={proj.title} 
                            onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Cover Image URL</label>
                          <input 
                            type="text" 
                            value={proj.coverImage} 
                            onChange={(e) => handleUpdateProject(proj.id, 'coverImage', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">GitHub repository link</label>
                          <input 
                            type="text" 
                            value={proj.githubLink || ''} 
                            onChange={(e) => handleUpdateProject(proj.id, 'githubLink', e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Active Sandbox live URL</label>
                          <input 
                            type="text" 
                            value={proj.liveLink || ''} 
                            onChange={(e) => handleUpdateProject(proj.id, 'liveLink', e.target.value)}
                            placeholder="https://deploy.net/..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Stack Tags (separated by commas)</label>
                        <input 
                          type="text" 
                          value={proj.tags.join(', ')} 
                          onChange={(e) => handleProjectTagsChange(proj.id, e.target.value)}
                          placeholder="React, Redis, Redux"
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Card Brief summary (displayed in grid lists)</label>
                        <input 
                          type="text" 
                          value={proj.briefDescription} 
                          onChange={(e) => handleUpdateProject(proj.id, 'briefDescription', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">In-depth Project documentation (shown on active click)</label>
                        <textarea 
                          value={proj.longDescription} 
                          onChange={(e) => handleUpdateProject(proj.id, 'longDescription', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProjectsList}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Projects List
                  </button>
                </div>
              </div>
            )}

            {/* skills TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Tech Stack & Competency levels</h3>
                    <p className="text-xs text-slate-500">Slide proficiency bars or add new skills to categorized stacks.</p>
                  </div>
                  <button
                    onClick={handleAddSkill}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Skill
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {skills.map((sk) => (
                    <div key={sk.id} className="bg-white p-4 rounded-xl border border-slate-250 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                        <div className="sm:col-span-2">
                          <input 
                            type="text" 
                            value={sk.name} 
                            onChange={(e) => handleUpdateSkill(sk.id, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <select
                            value={sk.category}
                            onChange={(e) => handleUpdateSkill(sk.id, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          >
                            <option value="frontend">Frontend & UI</option>
                            <option value="backend">Backend & Servers</option>
                            <option value="devops">DevOps & Systems</option>
                            <option value="tools">Tools & utilities</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="100"
                            value={sk.proficiency}
                            onChange={(e) => handleUpdateSkill(sk.id, 'proficiency', parseInt(e.target.value))}
                            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <span className="text-[11px] font-mono font-bold w-12 text-slate-600 text-right">
                            {sk.proficiency}% ({sk.level})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(sk.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveSkillsList}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Competencies List
                  </button>
                </div>
              </div>
            )}

            {/* blogs TAB */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Blog Engine Articles</h3>
                    <p className="text-xs text-slate-500">Draft articles, tutorials, or engineering news logs here.</p>
                  </div>
                  <button
                    onClick={handleAddBlogPost}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Draft New Blog
                  </button>
                </div>

                <div className="space-y-6">
                  {blogs.map((post, idx) => (
                    <div key={post.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                          Article Post #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="p-1 px-2 border border-slate-200 text-rose-500 hover:bg-rose-50 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Draft
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Post Title</label>
                          <input 
                            type="text" 
                            value={post.title} 
                            onChange={(e) => handleUpdateBlogPost(post.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">URL Slug (lowercase-no-spaces)</label>
                          <input 
                            type="text" 
                            value={post.slug} 
                            onChange={(e) => handleUpdateBlogPost(post.id, 'slug', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Post Image Cover URL</label>
                          <input 
                            type="text" 
                            value={post.coverImage} 
                            onChange={(e) => handleUpdateBlogPost(post.id, 'coverImage', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Category Topic</label>
                          <input 
                            type="text" 
                            value={post.category} 
                            onChange={(e) => handleUpdateBlogPost(post.id, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Read Duration Tag</label>
                          <input 
                            type="text" 
                            value={post.readTime} 
                            onChange={(e) => handleUpdateBlogPost(post.id, 'readTime', e.target.value)}
                            placeholder="e.g. 5 min read"
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Social/Card Brief Summary</label>
                        <input 
                          type="text" 
                          value={post.summary} 
                          onChange={(e) => handleUpdateBlogPost(post.id, 'summary', e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Article Body (Supports raw blocks / paragraphs)</label>
                        <textarea 
                          value={post.content} 
                          onChange={(e) => handleUpdateBlogPost(post.id, 'content', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveBlogsList}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save published Blogs
                  </button>
                </div>
              </div>
            )}

            {/* publications TAB */}
            {activeTab === 'publications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Academic & Project Publications</h3>
                    <p className="text-xs text-slate-500">Add patent profiles, peer-reviewed papers, journals, or online publications here.</p>
                  </div>
                  <button
                    onClick={handleAddPublication}
                    type="button"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Publication
                  </button>
                </div>

                <div className="space-y-6">
                  {publications.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-400">No Publications configured yet.</p>
                      <button
                        onClick={handleAddPublication}
                        type="button"
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <Plus className="w-4 h-4" /> Add Your First Paper
                      </button>
                    </div>
                  ) : (
                    publications.map((pub, idx) => (
                      <div key={pub.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                            Publication Item #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleDeletePublication(pub.id)}
                            type="button"
                            className="p-1 px-2 border border-slate-200 text-rose-500 hover:bg-rose-50 text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Publication Title</label>
                            <input 
                              type="text" 
                              value={pub.title} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-900"
                              placeholder="e.g. Towards Scalable Serverless Computing Architectures"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Publication Year</label>
                            <input 
                              type="text" 
                              value={pub.year} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'year', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900 font-semibold"
                              placeholder="e.g. 2026"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Authors List</label>
                            <input 
                              type="text" 
                              value={pub.authors} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'authors', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900"
                              placeholder="e.g. Amirul Sadikin, Alex Mercer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Journal / Publisher / Conference Venue</label>
                            <input 
                              type="text" 
                              value={pub.journal} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'journal', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900"
                              placeholder="e.g. IEEE Transactions on Cloud Computing"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">External Resource Link (Optional)</label>
                            <input 
                              type="url" 
                              value={pub.url || ''} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'url', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-900"
                              placeholder="e.g. https://scholar.google.com/citations?..."
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">PDF Download URL</label>
                              <input 
                                type="url" 
                                value={pub.pdfUrl || ''} 
                                onChange={(e) => handleUpdatePublication(pub.id, 'pdfUrl', e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono text-slate-900"
                                placeholder="e.g. https://domain.edu/papers/paper-id.pdf"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">PDF File Name</label>
                              <input 
                                type="text" 
                                value={pub.pdfFileName || ''} 
                                onChange={(e) => handleUpdatePublication(pub.id, 'pdfFileName', e.target.value)}
                                className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900 font-semibold"
                                placeholder="e.g. scalable_serverless_2026.pdf"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Publication Date (Optional)</label>
                            <input 
                              type="text" 
                              value={pub.publicationDate || ''} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'publicationDate', e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-900"
                              placeholder="e.g. 2026-05-27, or May 2026"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Abstract / Description</label>
                            <textarea 
                              value={pub.description || ''} 
                              onChange={(e) => handleUpdatePublication(pub.id, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs leading-relaxed text-slate-900"
                              placeholder="Provide a brief summary or citation impact info..."
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSavePublicationsList}
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Publications List
                  </button>
                </div>
              </div>
            )}

            {/* messages/inbox TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Recruiter submissions Inbox ({messages.length})</h3>
                    <p className="text-xs text-slate-500">View contact inquiries and recruiter coordinates submitted locally.</p>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={onClearMessages}
                      className="text-xs font-bold text-red-500 hover:text-red-700 border border-slate-250 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      Clear All Messages
                    </button>
                  )}
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No submissions received in this run yet.</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Fill out the contact form on your public landing page, and it will list here immediately for easy visual inspection!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {messages.map((msg) => (
                      <div key={msg.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                        <button
                          onClick={() => onDeleteMessage(msg.id)}
                          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="flex flex-col sm:flex-row gap-2 justify-between mb-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-950 text-sm block">{msg.senderName}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{msg.senderEmail}</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[10px] sm:text-right">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <h4 className="font-bold text-xs text-slate-700 mb-1">
                            Subject: <span className="font-normal text-slate-800">{msg.senderSubject}</span>
                          </h4>
                          <em className="text-slate-600 text-xs block leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                            "{msg.messageText}"
                          </em>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* dataops JSON TAB */}
            {activeTab === 'dataops' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Aesthetic Theme Templates</h3>
                  <p className="text-xs text-slate-500 -mt-2.5 mb-5 font-sans">Select a custom design template for this portfolio dashboard. Recruiters visiting via custom parameter links will render in this visual style.</p>
                </div>

                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
                  <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Portfolio Section Visibility</h3>
                  <p className="text-xs text-slate-500 -mt-2.5 mb-5 font-sans">Toggle the switches below to activate or hide entire sections on the public bento-grid portfolio representation.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Switch 1: Calling Card */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.callingCard ?? true}
                        onChange={(e) => handleToggleVisibility('callingCard', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Calling Card</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Flip/flat widget</span>
                      </div>
                    </label>

                    {/* Switch 2: Experience */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.experience ?? true}
                        onChange={(e) => handleToggleVisibility('experience', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Experience</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans font-sans">Timeline cards</span>
                      </div>
                    </label>

                    {/* Switch 3: Education */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.education ?? true}
                        onChange={(e) => handleToggleVisibility('education', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Education</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Academic log</span>
                      </div>
                    </label>

                    {/* Switch 4: Projects */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.projects ?? true}
                        onChange={(e) => handleToggleVisibility('projects', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Projects Grid</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Engineering cases</span>
                      </div>
                    </label>

                    {/* Switch 5: Skills */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.skills ?? true}
                        onChange={(e) => handleToggleVisibility('skills', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Technical Skills</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Proficiency matrix</span>
                      </div>
                    </label>

                    {/* Switch 6: Articles / Blogs */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.blogs ?? true}
                        onChange={(e) => handleToggleVisibility('blogs', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Technical Journal</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Blogs Spec Deck</span>
                      </div>
                    </label>

                    {/* Switch 7: Publications */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.publications ?? true}
                        onChange={(e) => handleToggleVisibility('publications', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Publications</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Scholar list</span>
                      </div>
                    </label>

                    {/* Switch 8: Contact Inbox */}
                    <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-150 transition-colors">
                      <input
                        type="checkbox"
                        checked={visibility.contact ?? true}
                        onChange={(e) => handleToggleVisibility('contact', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-700 group-hover:text-slate-900">Contact Inbox</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-sans">Messaging form</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Profile Data Migration Tools</h3>
                  <p className="text-xs text-slate-500 -mt-2.5 mb-5 font-sans">Fully control package portability. Download your custom CV and profile datasets or restore defaults.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Export Widget */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2">
                        <FileJson className="w-5 h-5 text-indigo-500" /> Export Profile as JSON
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Download your customized developer settings, project logs, education cards, and blog posts as a structured, backup-ready JSON schema file. You can attach this file anywhere or host it on your personal server.
                      </p>
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-4"
                    >
                      <FileJson className="w-4 h-4" /> Download JSON Backup
                    </button>
                  </div>

                  {/* Import Widget */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2">
                        <Upload className="w-5 h-5 text-emerald-500" /> Import Profile JSON
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Upload a previously exported JSON profile backup to instantly re-populate your entire portfolio, bio, projects deck, and tech lists client-side.
                      </p>
                    </div>
                    <div className="relative mt-4">
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImportJSON}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors pointer-events-none">
                        <Upload className="w-4 h-4" /> Select Portfolio JSON
                      </div>
                    </div>
                  </div>

                  {/* Pull from URL Widget */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-250 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2">
                        <Globe className="w-5 h-5 text-indigo-500" /> Pull Profile from URL
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        Pull complete portfolio schemas from any raw JSON web endpoint or web cloud storage instantly.
                      </p>
                      <div className="space-y-1.5 mb-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Target JSON Source URL</label>
                        <input
                          type="url"
                          value={remoteJsonUrl}
                          onChange={(e) => setRemoteJsonUrl(e.target.value)}
                          placeholder="https://example.com/data.json"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs leading-none text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleRemoteImportJSON}
                      disabled={isUrlFetching}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                    >
                      {isUrlFetching ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Fetching payload...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" /> Fetch and Import Data
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reset to Default */}
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mt-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-sm text-rose-900 uppercase">Emergency Reset Core Database</h4>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        Warning! Clicking below will permanently wipe your current browser's custom edits, project creations, and submitted recruiter messages. It resets everything back to Alex Mercer's initial professional mock dataset.
                      </p>
                      <button
                        onClick={handleResetToDefault}
                        className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Restore Default Mock Dataset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
