/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfileInfo {
  name: string;
  title: string;
  currentRole: string;
  location: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedInUrl: string;
  websiteUrl: string;
  avatarUrl: string;
  aboutBrief: string;
  aboutLong: string;
  resumeSubtitle: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string; // "Present" or date
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string; // "Present" or date
  current: boolean;
  description: string;
  achievements: string[];
  techUsed: string[];
}

export interface Project {
  id: string;
  title: string;
  briefDescription: string;
  longDescription: string;
  coverImage: string;
  tags: string[];
  githubLink?: string;
  liveLink?: string;
  featured: boolean;
}

export interface TechStackItem {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'tools';
  proficiency: number; // 0-100
  level: string; // e.g. "Expert", "Proficient", "Familiar"
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown or plain text formatted
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
}

export interface SubmittedMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderSubject: string;
  messageText: string;
  timestamp: string;
  read: boolean;
}

export interface PortfolioData {
  profile: ProfileInfo;
  education: Education[];
  experience: WorkExperience[];
  projects: Project[];
  skills: TechStackItem[];
  blogs: BlogPost[];
}
