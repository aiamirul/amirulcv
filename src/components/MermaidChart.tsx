import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Copy, Check } from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      background: 'transparent',
    }
  });
} catch (e) {
  console.error('Failed to initialize mermaid', e);
}

interface MermaidChartProps {
  chart: string;
}

export const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!chart) return;

    let isMounted = true;
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    const renderChart = async () => {
      try {
        setError(null);
        // Clean chart code (remove markdown codeblock backticks if user typed them)
        let cleanChart = chart.trim();
        if (cleanChart.startsWith('```mermaid')) {
          cleanChart = cleanChart.replace(/^```mermaid\s*/, '').replace(/```$/, '');
        } else if (cleanChart.startsWith('```')) {
          cleanChart = cleanChart.replace(/^```\s*/, '').replace(/```$/, '');
        }
        cleanChart = cleanChart.trim();

        if (!cleanChart) {
          if (isMounted) setSvg('');
          return;
        }

        const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        // Clear any leftover element with the error ID from DOM to avoid duplication issues
        const badEl = document.getElementById(id);
        if (badEl) badEl.remove();
        
        if (isMounted) {
          setError(err.message || 'Failed to render diagram. Check the syntax.');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(1);
  };

  if (error) {
    return (
      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono whitespace-pre-wrap">
        <p className="font-semibold mb-1">⚠️ Diagram Render Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={() => {
          setZoomScale(1);
          setIsFullscreen(true);
        }}
        className="group relative w-full cursor-zoom-in overflow-x-auto bg-slate-900/40 hover:bg-slate-900/60 p-4 rounded-xl border border-[var(--border-color)]/30 hover:border-indigo-500/30 transition-all flex flex-col justify-center items-center min-h-[180px]"
        title="Click to view full screen architecture blueprint"
      >
        {/* Dynamic Expand Button Indicator */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600/90 text-white p-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-[10px] font-sans font-medium tracking-wide">
          <Maximize2 className="w-3 h-3" />
          <span>Full Preview</span>
        </div>

        <div 
          ref={elementRef} 
          className="mermaid w-full max-w-full flex justify-center py-2" 
          dangerouslySetInnerHTML={{ __html: svg || '<span class="text-xs text-[var(--text-secondary)] animate-pulse">Generating diagram...</span>' }} 
        />
        
        {svg && (
          <span className="text-[10px] text-[var(--text-secondary)] mt-2 font-sans font-medium opacity-60 group-hover:opacity-100 group-hover:text-indigo-400 transition-all flex items-center gap-1">
            <Maximize2 className="w-2.5 h-2.5" />
            Click diagram to expand full-page preview
          </span>
        )}
      </div>

      {/* Full Page Architecture Preview Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Control Bar */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight font-sans">
                Architecture Blueprint & Sequence Flow
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Detailed system component interaction & deployment layout
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-white/5 transition-all text-xs flex items-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="hidden sm:inline">Zoom In</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-white/5 transition-all text-xs flex items-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
                <span className="hidden sm:inline">Zoom Out</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-white/5 transition-all text-xs flex items-center gap-1 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              
              <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

              <button
                onClick={handleCopyCode}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-white/5 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                title="Copy Mermaid Code"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/20 transition-all text-xs flex items-center gap-1 cursor-pointer ml-2"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Interactive Scalable Diagram Container */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-center cursor-grab active:cursor-grabbing">
            <div 
              className="transition-transform duration-200 ease-out p-6 bg-slate-900/20 rounded-2xl border border-white/5 shadow-2xl flex justify-center"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          {/* Keyboard & Zoom Scale Indicator Footer */}
          <div className="py-2.5 px-6 border-t border-white/5 bg-slate-950/80 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">ESC</kbd> to exit full-screen mode</span>
            <span>Zoom Level: {Math.round(zoomScale * 100)}%</span>
          </div>
        </div>
      )}
    </>
  );
};

