/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WorkExperience } from '../types';
import { Calendar, Briefcase, Clock, Sparkles, Code, Info, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface GanttChartProps {
  experience: WorkExperience[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ experience }) => {
  const [selectedExpId, setSelectedExpId] = useState<string | null>(
    experience.length > 0 ? experience[0].id : null
  );
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Parse custom date formats
  const parsedItems = useMemo(() => {
    // Current date for "Present" endpoints - using June 2026 based on workspace context
    const currentEnd = new Date(2026, 5); // June 2026
    
    return experience.map((exp) => {
      // Parse start
      const startParts = exp.startDate.split('-');
      const startYear = parseInt(startParts[0], 10);
      const startMonth = startParts[1] ? parseInt(startParts[1], 10) - 1 : 0;
      const start = new Date(startYear, startMonth);

      // Parse end
      let end = currentEnd;
      if (exp.endDate && exp.endDate.toLowerCase() !== 'present') {
        const endParts = exp.endDate.split('-');
        const endYear = parseInt(endParts[0], 10);
        const endMonth = endParts[1] ? parseInt(endParts[1], 10) - 1 : 11;
        end = new Date(endYear, endMonth);
      }

      const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

      return {
        ...exp,
        parsedStart: start,
        parsedEnd: end,
        durationMonths: totalMonths,
      };
    }).sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime()); // Sort chronological for timeline
  }, [experience]);

  // Determine global timeline margins
  const timelineRange = useMemo(() => {
    if (parsedItems.length === 0) return { start: new Date(), end: new Date(), totalMonths: 0 };

    let globalStart = new Date(parsedItems[0].parsedStart);
    let globalEnd = new Date(parsedItems[0].parsedEnd);

    parsedItems.forEach((item) => {
      if (item.parsedStart < globalStart) globalStart = new Date(item.parsedStart);
      if (item.parsedEnd > globalEnd) globalEnd = new Date(item.parsedEnd);
    });

    // Pad start by 1 month and end by 1 month to keep it gorgeous
    const startObj = new Date(globalStart.getFullYear(), globalStart.getMonth() - 1);
    const endObj = new Date(globalEnd.getFullYear(), globalEnd.getMonth() + 1);
    
    const diffMonths = (endObj.getFullYear() - startObj.getFullYear()) * 12 + (endObj.getMonth() - startObj.getMonth()) + 1;

    return {
      start: startObj,
      end: endObj,
      totalMonths: diffMonths,
    };
  }, [parsedItems]);

  // Compute scale mappings for bars
  const chartBars = useMemo(() => {
    if (parsedItems.length === 0 || timelineRange.totalMonths === 0) return [];

    return parsedItems.map((item) => {
      const startOffset = (item.parsedStart.getFullYear() - timelineRange.start.getFullYear()) * 12 + 
        (item.parsedStart.getMonth() - timelineRange.start.getMonth());
      
      const leftPercent = (startOffset / timelineRange.totalMonths) * 100;
      const widthPercent = (item.durationMonths / timelineRange.totalMonths) * 100;

      return {
        ...item,
        leftPercent: Math.max(0, leftPercent),
        widthPercent: Math.min(100 - leftPercent, widthPercent),
      };
    });
  }, [parsedItems, timelineRange]);

  // Extract list of all unique technologies across experience
  const allTechnologies = useMemo(() => {
    const list = new Set<string>();
    experience.forEach((exp) => {
      exp.techUsed.forEach((tech) => list.add(tech));
    });
    return Array.from(list).sort();
  }, [experience]);

  // Generate Year labels for the top grid header
  const yearMarkers = useMemo(() => {
    if (parsedItems.length === 0 || timelineRange.totalMonths === 0) return [];
    
    const markers = [];
    const current = new Date(timelineRange.start);
    
    while (current <= timelineRange.end) {
      if (current.getMonth() === 0) { // January markers
        const offset = (current.getFullYear() - timelineRange.start.getFullYear()) * 12 + 
          (current.getMonth() - timelineRange.start.getMonth());
        const leftPercent = (offset / timelineRange.totalMonths) * 100;
        
        if (leftPercent >= 0 && leftPercent <= 100) {
          markers.push({
            year: current.getFullYear(),
            leftPercent,
          });
        }
      }
      current.setMonth(current.getMonth() + 1);
    }
    return markers;
  }, [timelineRange, parsedItems]);

  const selectedExpDetails = useMemo(() => {
    return parsedItems.find((exp) => exp.id === selectedExpId) || null;
  }, [parsedItems, selectedExpId]);

  // Helper to format friendly period description
  const formatPeriodLabel = (start: Date, end: Date) => {
    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const isCurrent = parsedItems.find(p => p.parsedEnd === end)?.current;
    const endStr = isCurrent ? 'Present' : format(end);
    
    return `${format(start)} – ${endStr}`;
  };

  const getFriendlyDuration = (monthsCount: number) => {
    const yrs = Math.floor(monthsCount / 12);
    const mos = monthsCount % 12;
    const parts = [];
    if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? 's' : ''}`);
    if (mos > 0) parts.push(`${mos} mo${mos > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(' ') : '1 mo';
  };

  if (experience.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-xl flex flex-col p-5 select-none w-full transition-all">
      {/* Top Banner Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b border-[var(--border-color)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-[var(--accent-primary)] border border-indigo-500/20">
              <Calendar className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[var(--text-primary)] font-display">
              Interactive Gantt Core
            </h3>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium font-sans mt-1">
            Dynamic timeline view of commercial roles. Click on bars or filters to drill down.
          </p>
        </div>

        {/* Clear selection indicators */}
        {selectedTech && (
          <button
            onClick={() => setSelectedTech(null)}
            className="self-start md:self-center bg-indigo-500/10 hover:bg-indigo-500/20 text-[var(--accent-primary)] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Check className="w-3 h-3 text-[var(--accent-primary)]" />
            <span>Filter: {selectedTech} (Clear)</span>
          </button>
        )}
      </div>

      {/* Technology Focus Rails - Horizontal Scrolling Badges */}
      <div className="space-y-1.5 mb-5 text-left">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
          <Code className="w-3 h-3 text-[var(--accent-primary)]" />
          Quick Technology Filter Link-up
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {allTechnologies.map((tech) => {
            const isMatching = selectedTech === tech;
            return (
              <button
                key={tech}
                onClick={() => setSelectedTech(isMatching ? null : tech)}
                className={`text-[9.5px] font-mono font-semibold px-2 py-0.75 rounded-md border cursor-pointer transition-all ${
                  isMatching
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] scale-105 shadow-md font-bold'
                    : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)]'
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Stage Canvas */}
      <div className="relative border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] p-5 pt-7 overflow-x-auto min-w-0 mb-6">
        <div className="min-w-[650px] relative pb-2 pt-10 select-none">
          
          {/* Vertical Year Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {yearMarkers.map((marker) => (
              <div
                key={marker.year}
                className="absolute top-0 bottom-0 border-l border-[var(--border-color)] border-dashed transition-all"
                style={{ left: `${marker.leftPercent}%` }}
              >
                <span className="absolute top-0 -translate-x-1/2 text-[10px] font-mono font-extrabold text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]/80 shadow-xs">
                  {marker.year}
                </span>
              </div>
            ))}
          </div>

          {/* Gantt Bar Tracks */}
          <div className="space-y-4 relative z-10">
            {chartBars.map((bar) => {
              const isSelected = selectedExpId === bar.id;
              
              // Determine if dim due to tech filter
              const usesSelectedTech = !selectedTech || bar.techUsed.includes(selectedTech);
              const opacityClass = usesSelectedTech ? 'opacity-100' : 'opacity-20 translate-x-2 brightness-50 scale-98';

              return (
                <div
                  key={bar.id}
                  onClick={() => {
                    setSelectedExpId(bar.id);
                  }}
                  className={`relative group cursor-pointer transition-all duration-300 py-1 rounded-lg ${opacityClass}`}
                >
                  {/* Left Label: Small info text overlaying track, beautiful at visual center */}
                  <div className="flex items-center justify-between text-[10px] text-left px-1.5 mb-1.5 select-none font-sans">
                    <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {bar.role} <span className="text-[var(--text-secondary)] font-normal">at {bar.company}</span>
                    </span>
                    <span className="text-[9px] font-mono text-[var(--text-secondary)] font-medium">
                      {getFriendlyDuration(bar.durationMonths)}
                    </span>
                  </div>

                  {/* Horizontal Bar segment */}
                  <div className="h-6.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md relative overflow-hidden flex items-center group-hover:border-[var(--text-secondary)]/30 transition-all">
                    <div
                      style={{
                        left: `${bar.leftPercent}%`,
                        width: `${bar.widthPercent}%`,
                      }}
                      className={`absolute top-0 bottom-0 rounded-md transition-all duration-500 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-md ring-2 ring-indigo-500/30'
                          : 'bg-indigo-600/15 border-l-3 border-[var(--accent-primary)] group-hover:bg-indigo-600/25'
                      }`}
                    >
                      {/* Ambient background highlight */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-[pulse_2s_infinite]"></div>
                      )}
                    </div>

                    {/* Progress tag text nested inside bar center */}
                    <div className="absolute inset-0 flex items-center px-2 pointer-events-none select-none overflow-hidden text-[9px] font-mono font-bold text-transparent group-hover:text-[var(--text-secondary)]/40 transition-colors">
                      {bar.startDate} to {bar.endDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Selected Node Details drilldown Panel */}
      {selectedExpDetails && (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-4.5 text-left transition-all duration-300 animate-[fadeIn_0.3s_ease]">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2.5 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">
                  {selectedExpDetails.role}
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-color)] inline-block mt-1 font-sans">
                {selectedExpDetails.company} • {selectedExpDetails.location}
              </span>
            </div>

            <div className="text-left sm:text-right font-mono shrink-0">
              <div className="text-[11px] font-bold text-[var(--accent-primary)]">
                {formatPeriodLabel(selectedExpDetails.parsedStart, selectedExpDetails.parsedEnd)}
              </div>
              <div className="text-[9px] text-[var(--text-secondary)] font-bold mt-0.5 uppercase flex items-center sm:justify-end gap-1">
                <Clock className="w-2.5 h-2.5" />
                DUR: {getFriendlyDuration(selectedExpDetails.durationMonths)}
              </div>
            </div>
          </div>

          <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed mb-4 font-normal bg-[var(--bg-primary)]/50 p-2.5 rounded-lg border border-[var(--border-color)]/30">
            {selectedExpDetails.description}
          </p>

          {/* Key accomplishments checklist inside drilldown */}
          {selectedExpDetails.achievements && selectedExpDetails.achievements.length > 0 && (
            <div className="space-y-1.5 mb-4">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                Highlighted Contributions & Scope
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
                {selectedExpDetails.achievements.map((ach, i) => (
                  <li key={i} className="flex gap-2 items-start bg-[var(--bg-primary)]/30 p-2 border border-[var(--border-color)]/40 rounded-lg text-[11px] text-[var(--text-secondary)] leading-normal hover:border-[var(--text-secondary)]/20 transition-all">
                    <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full mt-1.5 shrink-0" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tech stack specific to role */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
              Core Stack Utilized
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedExpDetails.techUsed.map((tech) => (
                <span
                  key={tech}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono text-[9px] font-bold px-2 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
