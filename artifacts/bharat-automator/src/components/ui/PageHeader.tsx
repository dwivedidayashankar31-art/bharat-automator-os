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
      className="mb-8 border-b border-border/50 pb-6 relative"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary shadow-[0_0_15px_rgba(255,153,51,0.15)]">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-bold font-display tracking-wide text-foreground uppercase">{title}</h1>
      </div>
      <p className="text-muted-foreground text-lg ml-[4.5rem] max-w-3xl leading-relaxed">{description}</p>
    </motion.div>
  );
}
