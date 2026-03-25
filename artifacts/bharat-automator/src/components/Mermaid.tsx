import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  darkMode: true,
  themeVariables: {
    background: '#0f172a',
    primaryColor: '#f97316',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#f97316',
    lineColor: '#f97316',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    edgeLabelBackground: '#1e293b',
    clusterBkg: '#1e293b',
    clusterBorder: '#334155',
    titleColor: '#ffffff',
    nodeTextColor: '#ffffff',
  },
});

export const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (!ref.current || !chart) return;

      setError(null);
      setLoading(true);
      ref.current.innerHTML = '';

      // Strip emojis from chart code to prevent Mermaid parse errors
      const cleanChart = chart
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/🌐|🇮🇳|🧠|🌾|💼|🏥|🏛️|⚡|🔒|📊|🔗|💡/g, '')
        .trim();

      try {
        const { svg } = await mermaid.render(`mermaid-${uid}`, cleanChart);
        if (isMounted && ref.current) {
          ref.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || 'Failed to render diagram');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    render();
    return () => { isMounted = false; };
  }, [chart, uid]);

  if (error) {
    return (
      <div className="p-8 border border-destructive/40 bg-destructive/10 rounded-xl flex items-start gap-4">
        <AlertTriangle size={20} className="text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-destructive font-semibold text-sm mb-1">Blueprint render failed</p>
          <p className="text-destructive/70 font-mono text-xs leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto flex justify-center py-8 min-h-[400px] items-center relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="text-primary animate-spin" />
          <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Rendering Blueprint...</p>
        </div>
      )}
      <div
        ref={ref}
        className="mermaid-container transition-all w-full"
        style={{ opacity: loading ? 0 : 1 }}
      />
    </div>
  );
};
