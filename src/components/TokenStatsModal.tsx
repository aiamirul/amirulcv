import React, { useState } from 'react';
import { 
  X, BarChart2, Zap, DollarSign, Car, RefreshCw, 
  Trash2, TrendingUp, HelpCircle, Flame, Calendar, Activity, Database, Download
} from 'lucide-react';

interface TokenUsageRecord {
  id: string;
  timestamp: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedTokens?: number;
}

interface TokenStatsModalProps {
  onClose: () => void;
}

// Fixed conversion rate: 10000 tokens = 1 kwh = 0.4 USD = 12 KM EV drive
const TOKENS_PER_KWH = 10000;
const KWH_COST_USD = 0.4;
const EV_KM_PER_10K_TOKENS = 12;

export const TokenStatsModal: React.FC<TokenStatsModalProps> = ({ onClose }) => {
  // Read records from localStorage
  const [records, setRecords] = useState<TokenUsageRecord[]>(() => {
    const cached = localStorage.getItem('amirullm-token-usage-history');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error('Failed to parse cached token history, resetting.', err);
      }
    }
    
    // Seed with beautiful simulation history on empty load to give an immediate view of the interactive plot!
    const defaultHistory: TokenUsageRecord[] = [
      {
        id: "tx_sim_001",
        timestamp: "2026-05-25 09:12 AM",
        promptTokens: 256,
        completionTokens: 180,
        totalTokens: 436,
        reasoningTokens: 32,
        cachedTokens: 192
      },
      {
        id: "tx_sim_002",
        timestamp: "2026-05-26 11:34 AM",
        promptTokens: 310,
        completionTokens: 245,
        totalTokens: 555,
        reasoningTokens: 44,
        cachedTokens: 192
      },
      {
        id: "tx_sim_003",
        timestamp: "2026-05-27 02:22 PM",
        promptTokens: 290,
        completionTokens: 340,
        totalTokens: 630,
        reasoningTokens: 88,
        cachedTokens: 192
      },
      {
        id: "tx_sim_004",
        timestamp: "2026-05-28 04:15 PM",
        promptTokens: 480,
        completionTokens: 390,
        totalTokens: 870,
        reasoningTokens: 120,
        cachedTokens: 256
      },
      {
        id: "tx_sim_005",
        timestamp: "2026-05-29 08:20 AM",
        promptTokens: 254,
        completionTokens: 174,
        totalTokens: 428,
        reasoningTokens: 84,
        cachedTokens: 192
      },
      {
        id: "tx_sim_006",
        timestamp: "2026-05-29 08:49 AM",
        promptTokens: 808,
        completionTokens: 343,
        totalTokens: 1151,
        reasoningTokens: 187,
        cachedTokens: 768
      }
    ];
    localStorage.setItem('amirullm-token-usage-history', JSON.stringify(defaultHistory));
    return defaultHistory;
  });

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  // Totals calculations
  const totalCalls = records.length;
  const totalPromptTokens = records.reduce((acc, r) => acc + r.promptTokens, 0);
  const totalCompletionTokens = records.reduce((acc, r) => acc + r.completionTokens, 0);
  const totalTokens = records.reduce((acc, r) => acc + r.totalTokens, 0);
  
  // Custom smart detail sums
  const totalReasoningTokens = records.reduce((acc, r) => acc + (r.reasoningTokens || 0), 0);
  const totalCachedTokens = records.reduce((acc, r) => acc + (r.cachedTokens || 0), 0);

  // Conversion calculations
  const totalKwh = totalTokens / TOKENS_PER_KWH;
  const totalUSD = totalKwh * KWH_COST_USD;
  const totalEvKm = totalKwh * EV_KM_PER_10K_TOKENS;

  // Clear data handler
  const handleClearData = () => {
    setShowConfirmReset(true);
  };

  const confirmClearData = () => {
    localStorage.setItem('amirullm-token-usage-history', JSON.stringify([]));
    setRecords([]);
    setHoveredIdx(null);
    setShowConfirmReset(false);
  };

  // Export dynamically stored token history to CSV format for downloads
  const handleExportToCSV = () => {
    if (records.length === 0) return;
    
    // Configure precise headers
    const headers = ["Index", "Timestamp", "Prompt Tokens", "Reply Tokens", "Reasoning Tokens", "Total Tokens"];
    
    // Assemble chronological table logs
    const rows = records.map((rec, rIdx) => [
      rIdx + 1,
      `"${rec.timestamp.replace(/"/g, '""')}"`,
      rec.promptTokens,
      rec.completionTokens,
      rec.reasoningTokens || 0,
      rec.totalTokens
    ]);
    
    // Formulate final spreadsheet CSV content buffer
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `amirullm_token_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate mock entries
  const handleGenerateSampleData = () => {
    const hours = ['08', '10', '13', '15', '18', '21'];
    const mins = ['12', '24', '35', '45', '58'];
    const ap = ['AM', 'PM'];
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomDayStr = randomDay < 10 ? `0${randomDay}` : `${randomDay}`;
    const randomTime = `${hours[Math.floor(Math.random()*hours.length)]}:${mins[Math.floor(Math.random()*mins.length)]} ${ap[Math.floor(Math.random()*2)]}`;
    
    const pTokens = Math.floor(Math.random() * 600) + 200;
    const cTokens = Math.floor(Math.random() * 400) + 100;
    const rTokens = Math.floor(cTokens * 0.4);
    const caTokens = Math.floor(pTokens * 0.7);

    const newRecord: TokenUsageRecord = {
      id: `tx_sim_${Date.now()}`,
      timestamp: `2026-05-${randomDayStr} ${randomTime}`,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalTokens: pTokens + cTokens,
      reasoningTokens: rTokens,
      cachedTokens: caTokens
    };

    const updated = [...records, newRecord].sort((a,b) => a.timestamp.localeCompare(b.timestamp));
    localStorage.setItem('amirullm-token-usage-history', JSON.stringify(updated));
    setRecords(updated);
  };

  // Create SVG points coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const gridLines = 4;
  const padX = 50;
  const padY = 30;

  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const maxVal = records.length > 0 ? Math.max(...records.map(r => r.totalTokens), 500) : 500;

  // Generate SVG coordinates for lines
  const getCoordinates = (index: number, val: number) => {
    if (records.length <= 1) {
      return { x: padX + chartW / 2, y: padY + chartH - (val / maxVal) * chartH };
    }
    const x = padX + (index * (chartW / (records.length - 1)));
    const y = padY + chartH - (val / maxVal) * chartH;
    return { x, y };
  };

  // Path generators
  const buildLinePath = (getter: (r: TokenUsageRecord) => number) => {
    if (records.length === 0) return '';
    return records.map((r, i) => {
      const { x, y } = getCoordinates(i, getter(r));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const buildAreaPath = (getter: (r: TokenUsageRecord) => number) => {
    if (records.length === 0) return '';
    const lineCoords = records.map((r, i) => getCoordinates(i, getter(r)));
    if (lineCoords.length === 0) return '';
    
    const firstX = lineCoords[0].x;
    const lastX = lineCoords[lineCoords.length - 1].x;
    const baselineY = padY + chartH;

    const pathData = `M ${firstX} ${baselineY} ` + 
      lineCoords.map(pt => `L ${pt.x} ${pt.y}`).join(' ') + 
      ` L ${lastX} ${baselineY} Z`;
    return pathData;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fade-in no-print">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] md:max-h-[90vh] text-left">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-750 via-indigo-600 to-purple-800 text-white p-4 sm:p-5 flex justify-between items-center border-b border-white/10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <BarChart2 className="w-5 h-5 text-purple-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-wider text-white flex items-center gap-2">
                AmiruLLM Token Engine Metrics & Eco-Budget Monitor
              </h2>
              <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wide">
                Virtual AI Career Representative • Cost & Power Resource Audit Room
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
              title="How this works"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Info</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close Stats View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info panel */}
        {showExplanation && (
          <div className="bg-indigo-950/50 border-b border-indigo-900/30 p-4 text-xs text-indigo-250 leading-relaxed grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-indigo-300 uppercase mb-1">📐 Dynamic Conversion Math Formula</h4>
              <p>Each interaction with the amirul.cloud server returns real response objects containing prompt, completion, and reasoning token lengths. Ecological conversions are derived as follows:</p>
              <ul className="list-disc pl-4 mt-1.5 space-y-1">
                <li><strong className="text-indigo-200">10,000 Tokens</strong> = 1.0 Kilowatt-hour (kWhr)</li>
                <li><strong className="text-indigo-200">1.0 kWhr</strong> = $0.40 USD (V2.5 API hosting energy cost)</li>
                <li><strong className="text-indigo-200">1.0 kWhr</strong> = 12.0 Kilometers average range driving an electric vehicle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-indigo-300 uppercase mb-1">💡 Interactive Chart controls</h4>
              <p>The chart visualizes absolute token scopes. Hover over coordinates on the data plots to inspect local parameters. Prompt tokens reflect input structure parsing contexts (purple curve), while completion tokens reflect assistant reasoning outputs (rose curve).</p>
              <p className="mt-2 text-indigo-350 italic">The metrics dashboard automatically persists state to your browser's persistent localStorage sandbox.</p>
            </div>
          </div>
        )}

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TOP METRICS SUMMARY */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Total Calls card */}
            <div className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-start text-[var(--text-secondary)]">
                <span className="text-[10px] uppercase font-black tracking-wider">Total Calls</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 text-left">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">{totalCalls}</span>
                <span className="text-[9px] block text-[var(--text-secondary)] mt-0.5">interactions dispatched</span>
              </div>
            </div>

            {/* Total Tokens Card */}
            <div className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between shadow-xs col-span-1">
              <div className="flex justify-between items-start text-[var(--text-secondary)]">
                <span className="text-[10px] uppercase font-black tracking-wider">Tokens Used</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 text-left">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-primary)]">
                  {totalTokens.toLocaleString()}
                </span>
                <span className="text-[9px] block text-[var(--text-secondary)] mt-0.5">
                  {totalPromptTokens.toLocaleString()} in / {totalCompletionTokens.toLocaleString()} out
                </span>
              </div>
            </div>

            {/* Simulated Energy Consumed */}
            <div className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-start text-[var(--text-secondary)]">
                <span className="text-[10px] uppercase font-black tracking-wider">Power Used</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 text-left">
                <span className="text-xl sm:text-2xl font-mono font-bold text-amber-500">{totalKwh.toFixed(4)}</span>
                <span className="text-[9px] block text-[var(--text-secondary)] mt-0.5">Kilowatt-Hour (kWhr)</span>
              </div>
            </div>

            {/* Equivalent Budget Costs */}
            <div className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-start text-[var(--text-secondary)]">
                <span className="text-[10px] uppercase font-black tracking-wider">Estimate Cost</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-left">
                <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-500">${totalUSD.toFixed(4)}</span>
                <span className="text-[9px] block text-[var(--text-secondary)] mt-0.5">USD equivalent ($0.4/10K)</span>
              </div>
            </div>

            {/* EV Transportation Range */}
            <div className="p-3.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between shadow-xs col-span-2 lg:col-span-1">
              <div className="flex justify-between items-start text-[var(--text-secondary)]">
                <span className="text-[10px] uppercase font-black tracking-wider">EV Range Fuel</span>
                <Car className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-2 text-left">
                <span className="text-xl sm:text-2xl font-mono font-bold text-rose-500">{totalEvKm.toFixed(3)}</span>
                <span className="text-[9px] block text-[var(--text-secondary)] mt-0.5">Kilometers Driving equivalent</span>
              </div>
            </div>

          </div>

          {/* VISUAL CHART MATRIX AREA */}
          <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-inner text-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Token Volume Plot Over Conversations
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)]">Interactive coordinates: click or hover points to check values</p>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2.5 text-[9px] font-bold font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Total Tokens</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Prompt In</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Completion Out</span>
              </div>
            </div>

            {/* SVG line and Area Responsive Plot */}
            {records.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] p-4">
                <BarChart2 className="w-10 h-10 opacity-30 animate-pulse mb-2 text-indigo-500" />
                <p className="text-xs font-bold">No telemetry interactions recorded yet!</p>
                <p className="text-[10px] opacity-70 mt-1 max-w-sm">Please send a chat message in the main AmiruLLM carrier dialog or click "Generate Mock Data" below to seed visual trend diagrams instantly!</p>
              </div>
            ) : (
              <div className="relative w-full overflow-x-auto scrollbar-thin py-2">
                <div className="min-w-[550px] relative">
                  <svg 
                    width="100%" 
                    height={svgHeight} 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {Array.from({ length: gridLines + 1 }).map((_, i) => {
                      const gridY = padY + (i * (chartH / gridLines));
                      const labelValue = Math.round(maxVal - (i * (maxVal / gridLines)));
                      return (
                        <g key={i} className="opacity-40">
                          <line 
                            x1={padX} 
                            y1={gridY} 
                            x2={svgWidth - padX} 
                            y2={gridY} 
                            stroke="var(--border-color)" 
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text 
                            x={padX - 8} 
                            y={gridY + 3} 
                            textAnchor="end" 
                            fontSize="8" 
                            className="fill-[var(--text-secondary)] font-mono font-bold"
                          >
                            {labelValue}
                          </text>
                        </g>
                      );
                    })}

                    {/* Timeline Labels on X axis */}
                    {records.map((r, i) => {
                      const coords = getCoordinates(i, 0);
                      const timeStr = r.timestamp.split(' ').slice(1).join(' ') || r.timestamp;
                      return (
                        <text
                          key={i}
                          x={coords.x}
                          y={svgHeight - 12}
                          textAnchor="middle"
                          fontSize="7"
                          className="fill-[var(--text-secondary)] font-mono font-bold opacity-80"
                        >
                          {`Call #${i+1}`}
                        </text>
                      );
                    })}

                    {/* Shadows Area Fills */}
                    <path d={buildAreaPath(r => r.totalTokens)} fill="url(#indigo-grad)" />
                    <path d={buildAreaPath(r => r.promptTokens)} fill="url(#purple-grad)" />

                    {/* Connective Line Curves */}
                    <path 
                      d={buildLinePath(r => r.totalTokens)} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    <path 
                      d={buildLinePath(r => r.promptTokens)} 
                      fill="none" 
                      stroke="#a855f7" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                      strokeDasharray="2 1"
                    />
                    <path 
                      d={buildLinePath(r => r.completionTokens)} 
                      fill="none" 
                      stroke="#f43f5e" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />

                    {/* Interactive Circles / Data points */}
                    {records.map((r, i) => {
                      const totalPt = getCoordinates(i, r.totalTokens);
                      const promptPt = getCoordinates(i, r.promptTokens);
                      const compPt = getCoordinates(i, r.completionTokens);
                      const isHovered = hoveredIdx === i;

                      return (
                        <g key={i}>
                          {/* Invisible hover trigger column */}
                          <rect
                            x={totalPt.x - (chartW / Math.max(1, records.length - 1)) / 2}
                            y={padY}
                            width={chartW / Math.max(1, records.length - 1)}
                            height={chartH}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                          />

                          {/* Hover anchor vertical indicator line */}
                          {isHovered && (
                            <line
                              x1={totalPt.x}
                              y1={padY}
                              x2={totalPt.x}
                              y2={padY + chartH}
                              stroke="var(--accent-primary)"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Total Tokens node ring */}
                          <circle 
                            cx={totalPt.x} 
                            cy={totalPt.y} 
                            r={isHovered ? 6 : 4} 
                            fill="#6366f1" 
                            stroke="var(--bg-secondary)" 
                            strokeWidth={isHovered ? 2 : 1.5}
                            className="transition-all duration-150"
                          />

                          {/* Prompt node ring */}
                          <circle 
                            cx={promptPt.x} 
                            cy={promptPt.y} 
                            r={isHovered ? 4.5 : 3} 
                            fill="#a855f7" 
                            stroke="var(--bg-secondary)" 
                            strokeWidth="1"
                          />

                          {/* Completion node ring */}
                          <circle 
                            cx={compPt.x} 
                            cy={compPt.y} 
                            r={isHovered ? 4.5 : 3} 
                            fill="#f43f5e" 
                            stroke="var(--bg-secondary)" 
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Live Tooltip Data Overlay */}
                <div className="mt-3 min-h-12 flex items-center justify-center">
                  {hoveredIdx !== null ? (
                    <div className="bg-[var(--bg-secondary)] border-2 border-indigo-550 rounded-xl p-2.5 shadow-md flex items-center gap-4 text-xs max-w-lg mx-auto w-full animate-scale-up">
                      <div className="text-left">
                        <p className="text-[9px] font-black uppercase text-indigo-400 font-mono">Telemetry Hook #{hoveredIdx + 1}</p>
                        <p className="font-bold text-[var(--text-primary)] font-mono text-[10px]">{records[hoveredIdx].timestamp}</p>
                      </div>
                      <div className="w-px h-8 bg-[var(--border-color)]"></div>
                      <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-left font-mono">
                        <span className="text-[10px] text-indigo-400 font-bold">Total: <strong className="text-[var(--text-primary)] text-xs">{records[hoveredIdx].totalTokens}</strong></span>
                        <span className="text-[10px] text-purple-400 font-semibold">Prompt: <strong>{records[hoveredIdx].promptTokens}</strong></span>
                        <span className="text-[10px] text-rose-400 font-semibold">Reply: <strong>{records[hoveredIdx].completionTokens}</strong></span>
                        <span className="text-[9px] text-[var(--text-secondary)] col-span-3">
                          Reasoning: <strong className="text-[var(--text-primary)]">{records[hoveredIdx].reasoningTokens || 0}</strong> • Cached: <strong className="text-[var(--text-secondary)]">{records[hoveredIdx].cachedTokens || 0}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono italic">
                      💡 ProTip: Hover your cursor over the chart coordinate intersections to inspect individual telemetry properties.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* HISTORICAL DETAILED LEDGER TABLE */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-1 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-purple-500" /> Parsed Audit Ledger Log
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateSampleData}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50/10 hover:bg-indigo-50/20 text-xs text-[var(--accent-primary)] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Test Data</span>
                </button>
                {records.length > 0 && (
                  <>
                    <button
                      onClick={handleExportToCSV}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-605/15 hover:bg-emerald-600/25 text-xs text-emerald-555 font-bold transition-all cursor-pointer flex items-center gap-1 border border-emerald-500/20"
                      title="Download Ledger as CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={handleClearData}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50/10 hover:bg-rose-50/20 text-xs text-rose-500 font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset Log</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {records.length === 0 ? (
              <div className="bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] p-8 text-center text-xs text-[var(--text-secondary)] rounded-xl">
                No history. Dispatched AI responses will be parsed and listed here dynamically.
              </div>
            ) : (
              <div className="border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-56 overflow-y-auto scrollbar-thin">
                  <table className="w-full text-[11px] font-sans text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase text-[9px] tracking-wider sticky top-0">
                        <th className="p-2.5 font-bold">Index</th>
                        <th className="p-2.5 font-bold">Timestamp</th>
                        <th className="p-2.5 font-bold text-purple-500">Prompt</th>
                        <th className="p-2.5 font-bold text-rose-500">Reply</th>
                        <th className="p-2.5 font-bold text-amber-500">Reasoning</th>
                        <th className="p-2.5 font-bold text-indigo-500 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-secondary)]">
                      {records.slice().reverse().map((rec, rIdx) => {
                        const idx = records.length - rIdx;
                        return (
                          <tr 
                            key={rec.id} 
                            className={`hover:bg-indigo-50/5 dark:hover:bg-slate-800/20 transition-all ${
                              rec.id.startsWith("tx_sim_") ? "opacity-90" : "font-semibold bg-indigo-50/5 dark:bg-indigo-950/10"
                            }`}
                          >
                            <td className="p-2.5 font-bold font-mono">
                              <span className="flex items-center gap-1 text-[9px]">
                                #{idx}
                                {rec.id.startsWith("tx_sim_") ? (
                                  <span className="text-[8px] px-1 py-0.2 bg-slate-200 dark:bg-slate-800 text-[var(--text-secondary)] rounded-md">Sim</span>
                                ) : (
                                  <span className="text-[8px] px-1 py-0.2 bg-indigo-600 text-white rounded-md font-bold">Real</span>
                                )}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium">{rec.timestamp}</td>
                            <td className="p-2.5 font-mono text-purple-400 font-semibold">{rec.promptTokens}</td>
                            <td className="p-2.5 font-mono text-rose-400 font-semibold">{rec.completionTokens}</td>
                            <td className="p-2.5 font-mono text-amber-500 font-semibold">{rec.reasoningTokens || 0}</td>
                            <td className="p-2.5 font-mono text-indigo-400 font-bold text-right">{rec.totalTokens}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer banner */}
        <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] p-4 text-center text-[10px] text-[var(--text-secondary)] font-mono">
          AmiruLLM carbon-offset budget auditing uses static calculations mapped derived from actual MiMo-v2.5-pro token metrics.
        </div>
      </div>

      {/* Modern CSS Confirmation Dialog Overlay */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-[var(--bg-secondary)] border-2 border-rose-500/50 w-full max-w-md rounded-2xl shadow-rose-950/30 shadow-2xl p-6 text-left space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/25">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                  Reset Audit Logs
                </h3>
                <p className="text-[9px] text-rose-400 font-bold uppercase tracking-wide font-mono leading-none mt-1">
                  Irreversible Data Purge
                </p>
              </div>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you absolutely sure you want to delete all local token usage interaction logs? This will wipe the interactive plot analytics and reset your eco-budget metrics back to zero.
            </p>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-2 hover:bg-slate-800 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearData}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/35 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Purge Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
