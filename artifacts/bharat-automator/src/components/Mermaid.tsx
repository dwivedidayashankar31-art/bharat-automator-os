import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

export const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (ref.current && chart) {
      setError(null);
      try {
        mermaid.render(`mermaid-svg-${Math.random().toString(36).substring(7)}`, chart)
          .then((result) => {
            if (isMounted && ref.current) {
              ref.current.innerHTML = result.svg;
            }
          })
          .catch((e) => {
            if (isMounted) setError(e.message || "Failed to render diagram");
          });
      } catch (e: any) {
        setError(e.message || "Invalid Mermaid syntax");
      }
    }
    return () => { isMounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="p-6 border border-destructive/50 bg-destructive/10 rounded-xl text-destructive font-mono text-sm">
        Failed to render diagram. Syntax error.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto flex justify-center py-8 min-h-[400px] items-center">
      <div ref={ref} className="mermaid-container transition-all" />
    </div>
  );
};
