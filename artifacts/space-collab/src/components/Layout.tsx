import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Starfield } from "./Starfield";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { 
  Rocket, 
  Orbit, 
  BookOpen, 
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Missions", icon: Rocket },
    { href: "/resources", label: "Academy", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex flex-col relative">
      <Starfield />
      
      {/* Background gradients for atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <header className="sticky top-0 z-50 glass-panel border-x-0 border-t-0 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.5)] group-hover:scale-105 transition-transform duration-300">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide hidden sm:block">
            Space<span className="gradient-text">Collab</span>
          </span>
        </Link>

        {user ? (
          <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-primary text-glow" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatarUrl || `${import.meta.env.BASE_URL}images/astronaut-avatar.png`} 
                  alt={user.displayName || user.username}
                  className="w-9 h-9 rounded-full border border-primary/30"
                />
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">{user.displayName || user.username}</span>
                  <span className="text-xs text-primary">{user.role}</span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-2"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-white hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
              Join Academy
            </Link>
          </div>
        )}
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && user && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass-panel border-x-0 border-t-0 absolute top-[73px] left-0 right-0 z-40 p-4 flex flex-col gap-4"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors duration-200 ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button 
              onClick={logout}
              className="flex items-center gap-3 p-3 text-destructive rounded-xl hover:bg-destructive/10 transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
