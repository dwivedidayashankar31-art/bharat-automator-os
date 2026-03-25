import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#0a0e1a] text-foreground flex font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 shrink-0 border-r border-border/50 bg-black/40 backdrop-blur-2xl relative z-20">
        <Sidebar />
      </div>
      
      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
           <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
           <span className="font-display font-bold text-xl tracking-widest text-white">BHARAT<span className="text-primary">OS</span></span>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
           {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 top-16 bg-[#0a0e1a]/95 backdrop-blur-xl z-40 md:hidden border-t border-border/50"
          >
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pt-16 md:pt-0">
        {/* Abstract India Network Mesh Background */}
        <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none -z-10" />
        
        {/* Top Glow */}
        <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/0 to-transparent pointer-events-none -z-10" />
        
        <div className="relative z-10 p-4 sm:p-8 lg:p-10 max-w-[1600px] mx-auto min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
