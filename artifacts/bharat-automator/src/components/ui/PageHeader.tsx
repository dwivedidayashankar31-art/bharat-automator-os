import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 border-b border-border/40 pb-6 relative"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="flex items-center gap-4 mb-2.5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary shadow-[0_0_15px_rgba(255,153,51,0.15)] shrink-0">
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-display font-semibold text-foreground" style={{ letterSpacing: '-0.025em' }}>{title}</h1>
      </div>
      <p className="text-muted-foreground text-[15px] ml-[4.25rem] max-w-3xl leading-relaxed font-normal">{description}</p>
    </motion.div>
  );
}
