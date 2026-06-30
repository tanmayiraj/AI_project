import { Briefcase, LayoutDashboard, Upload, Settings, X, Lightbulb } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Sidebar({ open, setOpen }) {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/resumes', icon: Upload, label: 'Resumes' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/intelligence', icon: Lightbulb, label: 'Intelligence' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Briefcase className="w-6 h-6" />
            <span>AI Copilot</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 shrink-0">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <h4 className="font-semibold text-sm mb-1 text-foreground">Pro Features</h4>
            <p className="text-xs text-muted-foreground mb-3">Upgrade to unlock AI Mock Interviews</p>
            <button className="w-full text-xs font-medium bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
