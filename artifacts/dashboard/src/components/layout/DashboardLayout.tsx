import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Building2, Users, BookOpen, 
  Library, Activity, GraduationCap, ClipboardList,
  LogOut, Menu, X, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav: NavItem[] = [
    { title: "Overview", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { title: "Activity", href: "/admin/activity", icon: <Activity size={20} /> },
    { title: "Institutions", href: "/admin/institutions", icon: <Building2 size={20} /> },
    { title: "Operators", href: "/admin/operators", icon: <Users size={20} /> },
    { title: "Book Catalog", href: "/admin/books", icon: <Library size={20} /> },
    { title: "Digitization", href: "/admin/digitization", icon: <ClipboardList size={20} /> },
  ];

  const operatorNav: NavItem[] = [
    { title: "My Students", href: "/operator", icon: <GraduationCap size={20} /> },
    { title: "Assignments", href: "/operator/assignments", icon: <BookOpen size={20} /> },
    { title: "Reading Progress", href: "/operator/progress", icon: <CheckCircle size={20} /> },
    { title: "Request Book", href: "/operator/digitization", icon: <ClipboardList size={20} /> },
  ];

  const navItems = user?.role === "super_admin" ? adminNav : operatorNav;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:static lg:block transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <BookOpen className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-display font-bold text-slate-900 tracking-tight">Literaku</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </Button>
        </div>

        <div className="px-4 py-6 space-y-1">
          <div className="mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {user.role === 'super_admin' ? 'Admin Platform' : 'Institution Portal'}
          </div>
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin" && item.href !== "/operator");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            )
          })}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 relative">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </Button>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-800 hidden sm:block">
              {navItems.find(n => n.href === location)?.title || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-900 leading-none">{user.name}</span>
                <span className="text-xs text-slate-500 mt-1 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={logout} className="rounded-full text-slate-600 hover:text-destructive hover:bg-destructive/10 border-slate-200">
              <LogOut size={18} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
