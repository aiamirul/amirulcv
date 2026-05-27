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
}

export const ResumePDF: React.FC<ResumePreviewProps> = ({ data, onClose }) => {
  const currentUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-height-screen bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col items-center no-print animate-fade-in">
      {/* Control Bar - Not Shown on Print */}
      <div className="w-full max-w-4xl bg-slate-800 text-white rounded-t-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl border-b border-slate-700">
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
            <h4 className="text-sm font-bold leading-tight">Interactive Printable Resume</h4>
            <p className="text-[11px] text-slate-400">PDF-optimized & equipped with digital callback QR</p>
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

      {/* The Printable Page Sheet */}
      <div 
        id="resume-sheet"
        className="w-full max-w-4xl bg-white text-black p-6 sm:p-10 md:p-12 shadow-2xl rounded-b-xl flex flex-col gap-6 font-sans leading-relaxed text-sm ring-1 ring-slate-200 overflow-hidden"
        style={{ color: '#1a1a1a', background: '#fafafb' }}
      >
        {/* CV Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-slate-800 pb-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display uppercase leading-tight">
              {data.profile.name}
            </h1>
            <h2 className="text-md sm:text-lg font-medium text-slate-600 tracking-wide mt-1">
              {data.profile.resumeSubtitle || data.profile.title}
            </h2>
            
            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {data.profile.location}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {data.profile.email}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {data.profile.phone}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                URL: {data.profile.websiteUrl || currentUrl}
              </span>
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
          <span>alex.mercer@devmail.tech</span>
        </div>
      </div>
    </div>
  );
};
