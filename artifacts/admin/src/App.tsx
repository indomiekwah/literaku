import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminInstitutions from "@/pages/admin/institutions";
import AdminInstitutionDetail from "@/pages/admin/institution-detail";
import AdminOperators from "@/pages/admin/operators";
import AdminBooks from "@/pages/admin/books";
import AdminStats from "@/pages/admin/stats";
import OperatorDashboard from "@/pages/operator/dashboard";
import OperatorStudents from "@/pages/operator/students";
import OperatorStudentDetail from "@/pages/operator/student-detail";
import OperatorBookAssignment from "@/pages/operator/book-assignment";
import OperatorReports from "@/pages/operator/reports";
import OperatorDigitization from "@/pages/operator/digitization";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, role }: { component: React.ComponentType; role: 'admin' | 'operator' }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== role) {
    setLocation('/');
    return null;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      <Route path="/admin">
        {() => <ProtectedRoute role="admin" component={AdminDashboard} />}
      </Route>
      <Route path="/admin/institutions">
        {() => <ProtectedRoute role="admin" component={AdminInstitutions} />}
      </Route>
      <Route path="/admin/institutions/:id">
        {() => <ProtectedRoute role="admin" component={AdminInstitutionDetail} />}
      </Route>
      <Route path="/admin/operators">
        {() => <ProtectedRoute role="admin" component={AdminOperators} />}
      </Route>
      <Route path="/admin/books">
        {() => <ProtectedRoute role="admin" component={AdminBooks} />}
      </Route>
      <Route path="/admin/stats">
        {() => <ProtectedRoute role="admin" component={AdminStats} />}
      </Route>

      <Route path="/operator">
        {() => <ProtectedRoute role="operator" component={OperatorDashboard} />}
      </Route>
      <Route path="/operator/students">
        {() => <ProtectedRoute role="operator" component={OperatorStudents} />}
      </Route>
      <Route path="/operator/students/:id">
        {() => <ProtectedRoute role="operator" component={OperatorStudentDetail} />}
      </Route>
      <Route path="/operator/books">
        {() => <ProtectedRoute role="operator" component={OperatorBookAssignment} />}
      </Route>
      <Route path="/operator/reports">
        {() => <ProtectedRoute role="operator" component={OperatorReports} />}
      </Route>
      <Route path="/operator/digitization">
        {() => <ProtectedRoute role="operator" component={OperatorDigitization} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
