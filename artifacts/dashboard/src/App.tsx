import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";

// Layout
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Login from "@/pages/auth/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import ActivityFeed from "@/pages/admin/ActivityFeed";
import Institutions from "@/pages/admin/Institutions";
import Operators from "@/pages/admin/Operators";
import Books from "@/pages/admin/Books";
import AdminDigitization from "@/pages/admin/Digitization";
import OperatorStudents from "@/pages/operator/Students";
import OperatorAssignments from "@/pages/operator/Assignments";
import OperatorProgress from "@/pages/operator/Progress";
import OperatorDigitization from "@/pages/operator/Digitization";

const queryClient = new QueryClient();

// Route Protection
function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole: string }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (user.role !== allowedRole) {
        setLocation(user.role === "super_admin" ? "/admin" : "/operator");
      }
    }
  }, [user, isLoading, setLocation, allowedRole]);

  if (isLoading || !user || user.role !== allowedRole) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Global Redirect
function RootRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) setLocation("/login");
      else if (user.role === "super_admin") setLocation("/admin");
      else setLocation("/operator");
    }
  }, [user, isLoading, setLocation]);

  return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute allowedRole="super_admin"><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/activity">
        <ProtectedRoute allowedRole="super_admin"><ActivityFeed /></ProtectedRoute>
      </Route>
      <Route path="/admin/institutions">
        <ProtectedRoute allowedRole="super_admin"><Institutions /></ProtectedRoute>
      </Route>
      <Route path="/admin/operators">
        <ProtectedRoute allowedRole="super_admin"><Operators /></ProtectedRoute>
      </Route>
      <Route path="/admin/books">
        <ProtectedRoute allowedRole="super_admin"><Books /></ProtectedRoute>
      </Route>
      <Route path="/admin/digitization">
        <ProtectedRoute allowedRole="super_admin"><AdminDigitization /></ProtectedRoute>
      </Route>

      {/* Operator Routes */}
      <Route path="/operator">
        <ProtectedRoute allowedRole="operator"><OperatorStudents /></ProtectedRoute>
      </Route>
      <Route path="/operator/assignments">
        <ProtectedRoute allowedRole="operator"><OperatorAssignments /></ProtectedRoute>
      </Route>
      <Route path="/operator/progress">
        <ProtectedRoute allowedRole="operator"><OperatorProgress /></ProtectedRoute>
      </Route>
      <Route path="/operator/digitization">
        <ProtectedRoute allowedRole="operator"><OperatorDigitization /></ProtectedRoute>
      </Route>

      {/* 404 Fallback */}
      <Route>
        <RootRedirect />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
