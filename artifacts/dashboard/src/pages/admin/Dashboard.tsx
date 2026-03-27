import { useDashboardStats } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, UserCircle, BookOpen, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const statCards = [
    { title: "Total Institutions", value: stats?.totalInstitutions || 0, icon: <Building2 size={24} className="text-blue-500" />, bg: "bg-blue-50" },
    { title: "Total Students", value: stats?.totalStudents || 0, icon: <Users size={24} className="text-emerald-500" />, bg: "bg-emerald-50" },
    { title: "Institution Operators", value: stats?.totalOperators || 0, icon: <UserCircle size={24} className="text-amber-500" />, bg: "bg-amber-50" },
    { title: "Active Readers", value: stats?.activeReaders || 0, icon: <BookOpen size={24} className="text-indigo-500" />, bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Platform Overview</h2>
        <p className="text-slate-500 mt-2">Welcome to the Literaku Super Admin Dashboard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-4xl font-display font-bold text-slate-900">{card.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decorative empty state for future charts */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-display">
            <TrendingUp className="text-primary" />
            Reading Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 border-dashed">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">More data required</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-2">Charts will appear here once students start generating reading progress data on the mobile app.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
