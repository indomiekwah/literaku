import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Building2, 
  Users, 
  Library, 
  BarChart3, 
  LogOut, 
  GraduationCap, 
  FileText,
  MonitorPlay
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const adminLinks = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Institutions', href: '/admin/institutions', icon: Building2 },
  { name: 'Operators', href: '/admin/operators', icon: Users },
  { name: 'Books Catalog', href: '/admin/books', icon: Library },
  { name: 'Global Stats', href: '/admin/stats', icon: BarChart3 },
];

const operatorLinks = [
  { name: 'Dashboard', href: '/operator', icon: BarChart3 },
  { name: 'Students', href: '/operator/students', icon: GraduationCap },
  { name: 'Book Assignment', href: '/operator/books', icon: BookOpen },
  { name: 'Reading Reports', href: '/operator/reports', icon: FileText },
  { name: 'Digitization', href: '/operator/digitization', icon: MonitorPlay },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : operatorLinks;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary w-full">
            <BookOpen className="w-6 h-6" />
            <span className="font-display">Literaku</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href} className="w-full">
                    <SidebarMenuButton 
                      isActive={location === link.href || (location.startsWith(link.href) && link.href !== '/admin' && link.href !== '/operator')}
                      className="font-medium h-11 text-base px-4"
                    >
                      <link.icon className="w-5 h-5 mr-3" />
                      {link.name}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Sidebar>
      <SidebarInset className="bg-slate-50 min-h-screen">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 shadow-sm">
          <SidebarTrigger className="mr-4" />
          <div className="font-semibold text-lg font-display text-foreground">
            {links.find(l => location === l.href)?.name || 'Dashboard'}
          </div>
        </header>
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
