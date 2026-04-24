import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, PlusCircle, Library, Search, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Library', path: '/skills', icon: Library },
    { name: 'Tools', path: '/tools', icon: Wrench },
    { name: 'Create', path: '/create', icon: PlusCircle },
  ];

  return (
    <header className="h-16 w-full border-b border-outline-variant bg-surface-container-lowest flex-shrink-0">
      <div className="mx-auto flex h-full items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <Zap size={20} className="fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">ClapSkills</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === '/skills' && location.pathname.startsWith('/skill/')) ||
                (item.path === '/tools' && location.pathname.startsWith('/tools'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-5 text-sm font-medium transition-colors border-b-2 border-transparent",
                    isActive 
                      ? "text-primary border-primary" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full hidden lg:flex">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Coming Soon</span>
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full border border-surface bg-surface-container-highest"></div>
              <div className="w-5 h-5 rounded-full border border-surface bg-outline"></div>
            </div>
          </div>

          <div className="relative hidden sm:block ml-4">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search skills..."
              className="h-10 w-64 rounded-lg border border-outline-variant bg-surface-container-lowest pl-9 pr-4 text-sm outline-none placeholder:text-on-surface-variant focus:border-primary/40 ring-4 ring-transparent focus:ring-primary/10 transition-all"
            />
          </div>
          
          <Link to="/profile" className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest p-1 pr-3 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              MT
            </div>
            <span className="text-xs font-bold text-on-surface">M. Tinti</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
