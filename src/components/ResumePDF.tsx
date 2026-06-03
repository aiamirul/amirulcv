/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, Download, ArrowLeft, QrCode, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { PortfolioData } from '../types';

interface ResumePreviewProps {
  data: PortfolioData;
  onClose: () => void;
  printMode: 'fancy' | 'plain';
  onChangePrintMode: (mode: 'fancy' | 'plain') => void;
  showProfilePic: boolean;
  onChangeShowProfilePic: (show: boolean) => void;
}

export const ResumePDF: React.FC<ResumePreviewProps> = ({ 
  data, 
  onClose,
  printMode,
  onChangePrintMode,
  showProfilePic,
  onChangeShowProfilePic
}) => {
  const currentUrl = window.location.href;
  const qrData = data.profile.qrOverrideContent || data.profile.websiteUrl || currentUrl;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="min-height-screen bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col items-center no-print animate-fade-in font-sans cursor-pointer"
    >
      {/* Control Bar - Not Shown on Print */}
      <div className="w-full max-w-4xl bg-slate-800 text-white rounded-t-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl border-b border-slate-700 cursor-default">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 bg-slate-700 hover:bg-slate-650 text-slate-200 hover:text-white rounded-lg flex items-center gap-2 text-sm transition-all focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </button>
          <span className="text-slate-400 font-mono text-xs hidden md:inline">|</span>
          <div className="hidden md:flex flex-col">
            <h4 className="text-sm font-bold leading-tight">Printable Resume Center</h4>
            <p className="text-[11px] text-slate-400">PDF-optimized, standard-compliant formatting</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Options Strip (No-Print) */}
      <div className="w-full max-w-4xl bg-slate-850 border-b border-slate-700 text-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-2xl no-print text-xs cursor-default">
        <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">Layout Style:</span>
            <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-750">
              <button 
                onClick={() => onChangePrintMode('fancy')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${printMode === 'fancy' ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-slate-400 hover:text-slate-250'}`}
              >
                Fancy Style
              </button>
              <button 
                onClick={() => onChangePrintMode('plain')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${printMode === 'plain' ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-slate-400 hover:text-slate-250'}`}
              >
                Plain Text Mode
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">Profile Picture:</span>
            <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-750">
              <button 
                onClick={() => onChangeShowProfilePic(true)}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${showProfilePic ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-slate-400 hover:text-slate-250'}`}
              >
                Show Pic
              </button>
              <button 
                onClick={() => onChangeShowProfilePic(false)}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${!showProfilePic ? 'bg-[var(--accent-primary)] text-white shadow' : 'text-slate-400 hover:text-slate-250'}`}
              >
                Hide
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-[11px] text-slate-400 italic text-right hidden md:block">
          {printMode === 'plain' 
            ? 'Plain Mode lists details sequentially with standard section headings.' 
            : 'Fancy Mode features high-contrast highlights & modern structure.'}
        </div>
      </div>

      {/* The Printable Page Sheet */}
      <div 
        id="resume-sheet"
        className="w-full max-w-4xl bg-white text-black p-6 sm:p-10 md:p-12 shadow-2xl rounded-b-xl flex flex-col gap-6 font-sans leading-relaxed text-sm ring-1 ring-slate-200 overflow-hidden cursor-default"
        style={{ color: '#1a1a1a', background: '#fafafb' }}
      >
        {printMode === 'plain' ? (
          /* ==========================================
             PLAIN TEXT MODE LAYOUT (Standard Elements)
             ========================================== */
          <div className="space-y-6">
            {/* Standard "basic info" heading */}
            <header className="border-b border-slate-300 pb-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {showProfilePic && data.profile.avatarUrl && (
                  <img 
                    src={data.profile.avatarUrl} 
                    alt={data.profile.name} 
                    className="w-20 h-20 rounded-full object-cover border border-slate-350 shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.profile.name}</h1>
                  <p className="text-sm text-slate-650 font-medium">{data.profile.resumeSubtitle || data.profile.title}</p>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-200 pb-1 mb-2">Basic Info</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700 list-none p-0">
                  {data.profile.location && <li><span className="font-semibold text-slate-900">Location:</span> {data.profile.location}</li>}
                  {data.profile.email && <li><span className="font-semibold text-slate-900">Email:</span> {data.profile.email}</li>}
                  {data.profile.phone && <li><span className="font-semibold text-slate-900">Phone:</span> {data.profile.phone}</li>}
                  {data.profile.websiteUrl && <li><span className="font-semibold text-slate-900">Website:</span> {data.profile.websiteUrl}</li>}
                  {data.profile.githubUrl && <li><span className="font-semibold text-slate-900">GitHub:</span> {data.profile.githubUrl}</li>}
                  {data.profile.linkedInUrl && <li><span className="font-semibold text-slate-900">LinkedIn:</span> {data.profile.linkedInUrl}</li>}
                </ul>
              </div>

              {data.profile.aboutLong && (
                <div className="mt-4 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-150">
                  <span className="font-semibold text-slate-900">Professional Summary:</span> {data.profile.aboutLong}
                </div>
              )}
            </header>

            {/* Section: Work Experience */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-300 pb-1.5 mb-3.5">Work Experience</h2>
              <ul className="space-y-5 list-none p-0">
                {data.experience.map((exp) => (
                  <li key={exp.id} className="text-xs text-slate-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 font-bold text-slate-900">
                      <span className="text-[13px]">{exp.role} at {exp.company}</span>
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-0.5 mb-1.5">{exp.location}</div>
                    <p className="leading-normal mb-2">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                        {exp.achievements.map((ach, idx) => (
                          <li key={idx} className="leading-relaxed">{ach}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section: Education */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-300 pb-1.5 mb-3.5">Education</h2>
              <ul className="space-y-4 list-none p-0">
                {data.education.map((edu) => (
                  <li key={edu.id} className="text-xs text-slate-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 font-bold text-slate-900">
                      <span className="text-[13px]">{edu.degree} in {edu.fieldOfStudy}</span>
                      <span className="font-mono text-slate-500 font-semibold">{edu.startDate} – {edu.endDate}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{edu.institution}</div>
                    {edu.description && <p className="text-[11px] text-slate-500 italic mt-1 leading-normal">{edu.description}</p>}
                  </li>
                ))}
              </ul>
            </section>

            {/* Section: Skills */}
            <section className="print-page-break">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-300 pb-1.5 mb-3.5">Skills</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                {['frontend', 'backend', 'devops', 'tools'].map((cat) => {
                  const catSkills = data.skills.filter((sk) => sk.category === cat);
                  if (catSkills.length === 0) return null;
                  
                  const labelMap: Record<string, string> = {
                    frontend: 'Frontend Technologies',
                    backend: 'Backend & Databases',
                    devops: 'Infrastructure & Systems',
                    tools: 'Utilities & General'
                  };

                  return (
                    <li key={cat} className="text-xs bg-slate-50 p-2.5 rounded border border-slate-150">
                      <strong className="text-slate-850 block mb-1 uppercase tracking-wider text-[9px]">{labelMap[cat] || cat}</strong>
                      <span className="text-slate-650 leading-relaxed font-semibold">
                        {catSkills.map(s => s.name).join(', ')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Section: Publications / Projects */}
            {data.publications && data.publications.length > 0 && (
              <section className="print-page-break">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-300 pb-1.5 mb-3.5">Publications</h2>
                <ul className="space-y-4 list-none p-0">
                  {data.publications.map((pub) => (
                    <li key={pub.id} className="text-xs text-slate-700">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 font-bold text-slate-900">
                        <span>{pub.title}</span>
                        <span className="font-mono text-slate-500 font-semibold">{pub.publicationDate || pub.year}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{pub.authors} &bull; <span className="italic">{pub.journal}</span></div>
                      
                      {/* PDF download details */}
                      {(pub.pdfUrl || pub.pdfFileName) && (
                        <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1 bg-slate-55 p-1.5 rounded border border-slate-200 font-mono">
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

            {data.projects && data.projects.length > 0 && (
              <section className="print-page-break">
                <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-800 border-b border-slate-300 pb-1.5 mb-3.5">Recent Achievements & Projects</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                  {data.projects.slice(0, 4).map((proj) => (
                    <li key={proj.id} className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-150 flex flex-col justify-between">
                      <div>
                        <strong className="text-slate-900 font-bold text-[13px]">{proj.title}</strong>
                        <p className="text-[11px] text-slate-600 leading-normal mt-1">{proj.briefDescription}</p>
                      </div>
                      <div className="text-[10px] text-slate-450 font-mono mt-2.5">Key Stacks: {proj.tags.join(', ')}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="text-[9px] text-slate-400 font-mono border-t border-slate-200 pt-3 flex justify-between items-center">
              <span>Plain text layout &bull; Active profile update on {new Date().toLocaleDateString()}</span>
              <span>{data.profile.email}</span>
            </footer>
          </div>
        ) : (
          /* ==========================================
             FANCY STYLED MODE LAYOUT (Standard)
             ========================================== */
          <>
            {/* CV Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-slate-800 pb-6">
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {showProfilePic && data.profile.avatarUrl && (
                  <img 
                    src={data.profile.avatarUrl} 
                    alt={data.profile.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display uppercase leading-tight">
                    {data.profile.name}
                  </h1>
                  <h2 className="text-md sm:text-lg font-medium text-slate-600 tracking-wide mt-1">
                    {data.profile.resumeSubtitle || data.profile.title}
                  </h2>
                  
                  {/* Contact Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
                    {data.profile.location && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {data.profile.location}
                      </span>
                    )}
                    {data.profile.email && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {data.profile.email}
                      </span>
                    )}
                    {data.profile.phone && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {data.profile.phone}
                      </span>
                    )}
                    {data.profile.websiteUrl && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        Website: {data.profile.websiteUrl}
                      </span>
                    )}
                    {data.profile.githubUrl && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        GitHub: {data.profile.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    )}
                    {data.profile.linkedInUrl && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        LinkedIn: {data.profile.linkedInUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    )}
                    {data.profile.googleScholarUrl && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        Scholar: {data.profile.googleScholarUrl.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code and Callout for printed version */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider leading-none">Callback Code</span>
                  <span className="text-[9px] text-slate-500 max-w-[100px] leading-tight mt-1">
                    Scan to explore live demo, blogs, & switch themes online.
                  </span>
                </div>
                <img 
                  src={qrCodeUrl} 
                  alt="Scan QR back to website" 
                  className="w-16 h-16 border border-slate-100 rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Profile Objective / Summary */}
            <section className="print-page-break">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-2.5">
                Professional Profile
              </h3>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                {data.profile.aboutLong || data.profile.aboutBrief}
              </p>
            </section>

            {/* Core Competencies Tech Stack Grid */}
            <section className="print-page-break">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
                Core Competencies & Technology Stack
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['frontend', 'backend', 'devops', 'tools'].map((cat) => {
                  const catSkills = data.skills.filter((sk) => sk.category === cat);
                  if (catSkills.length === 0) return null;
                  
                  const prettyCategoryNames: Record<string, string> = {
                    frontend: 'Frontend & UI',
                    backend: 'Backend & Servers',
                    devops: 'DevOps & Systems',
                    tools: 'Developer Utilities'
                  };

                  return (
                    <div key={cat} className="flex flex-col">
                      <h4 className="text-xs font-bold text-slate-800 mb-1 capitalize border-l-2 border-slate-600 pl-1.5">
                        {prettyCategoryNames[cat] || cat}
                      </h4>
                      <ul className="text-[11px] text-slate-600 flex flex-wrap gap-x-1.5 gap-y-0.5 leading-tight select-none">
                        {catSkills.map((sk) => (
                          <li key={sk.id} className="after:content-[','] last:after:content-[''] font-medium">
                            {sk.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Professional Experience Section */}
            <section className="print-page-break">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-4">
                Professional Work History
              </h3>
              <div className="flex flex-col gap-5">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {exp.role} <span className="font-normal text-slate-500">at</span> {exp.company}
                      </h4>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded leading-none">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-600 mb-1.5">
                      {exp.location}
                    </p>
                    <p className="text-xs text-slate-700 leading-normal mb-2">
                      {exp.description}
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                      {exp.achievements.map((ach, idx) => (
                        <li key={idx} className="leading-snug">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Education History Section */}
            <section className="print-page-break">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-4">
                Academic Background
              </h3>
              <div className="flex flex-col gap-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h4>
                      <span className="text-xs font-mono text-slate-500 font-bold leading-none">
                        {edu.startDate} – {edu.endDate}
                      </span>
                    </div>
                    <h5 className="text-xs text-slate-600 font-medium">{edu.institution}</h5>
                    {edu.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-normal italic">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Academic & Professional Publications if present */}
            {data.publications && data.publications.length > 0 && (
              <section className="print-page-break">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-4">
                  Scientific Publications & Projects
                </h3>
                <div className="flex flex-col gap-5">
                  {data.publications.map((pub) => (
                    <div key={pub.id} className="flex flex-col">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {pub.title}
                        </h4>
                        <span className="text-xs font-mono text-slate-500 font-bold leading-none">
                          {pub.publicationDate || pub.year}
                        </span>
                      </div>
                      <h5 className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {pub.authors} &bull; <span className="italic">{pub.journal}</span>
                      </h5>

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

                      {pub.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-normal">
                          {pub.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Selected Projects Showcase on Printed CV */}
            <section className="print-page-break">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-900 border-b border-slate-300 pb-1.5 mb-4">
                Selected Portfolio Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.projects.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="border-l-2 border-slate-300 pl-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{proj.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-normal mt-1">
                        {proj.briefDescription}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Stack: {proj.tags.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer Signature */}
            <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Generated of Live Web Profile on {new Date().toLocaleDateString()}</span>
              <span>{data.profile.email}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
