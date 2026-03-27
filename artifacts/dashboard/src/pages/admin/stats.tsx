import { useAdminStats, useInstitutions, useBooks } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Users, Library, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyReading = [
  { month: 'Jan', booksRead: 120, activeReaders: 340 },
  { month: 'Feb', booksRead: 145, activeReaders: 380 },
  { month: 'Mar', booksRead: 160, activeReaders: 420 },
  { month: 'Apr', booksRead: 132, activeReaders: 395 },
  { month: 'May', booksRead: 188, activeReaders: 450 },
  { month: 'Jun', booksRead: 210, activeReaders: 520 },
  { month: 'Jul', booksRead: 175, activeReaders: 480 },
  { month: 'Aug', booksRead: 230, activeReaders: 560 },
  { month: 'Sep', booksRead: 255, activeReaders: 610 },
  { month: 'Oct', booksRead: 280, activeReaders: 680 },
  { month: 'Nov', booksRead: 310, activeReaders: 740 },
  { month: 'Dec', booksRead: 345, activeReaders: 890 },
];

const readingTimeData = [
  { name: '0-15 min', value: 120 },
  { name: '15-30 min', value: 280 },
  { name: '30-60 min', value: 350 },
  { name: '60+ min', value: 140 },
];

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminStats() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: institutions, isLoading: instLoading } = useInstitutions();
  const { data: books, isLoading: booksLoading } = useBooks();

  if (statsLoading || instLoading || booksLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-6"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const topBooks = books?.slice(0, 5).map((b, i) => ({
    title: b.title.length > 20 ? b.title.substring(0, 20) + '...' : b.title,
    readers: Math.floor(Math.random() * 200) + 50,
    completions: Math.floor(Math.random() * 100) + 20,
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Global Statistics</h1>
        <p className="text-muted-foreground mt-2">Platform-wide reading analytics and trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Institutions" value={stats?.totalInstitutions || 0} icon={Building2} trend="+2 this month" trendUp={true} />
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} trend="+124 this month" trendUp={true} />
        <StatCard title="Books in Catalog" value={stats?.totalBooks || 0} icon={Library} />
        <StatCard title="Active Readers" value={stats?.activeReaders || 0} icon={Activity} trend="+12%" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Books Read Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReading}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="booksRead" fill="#6366f1" radius={[4, 4, 0, 0]} name="Books Read" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Active Readers Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyReading}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="activeReaders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Active Readers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Reading Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={readingTimeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {readingTimeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Top Books by Readers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBooks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="title" type="category" fontSize={11} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="readers" fill="#6366f1" radius={[0, 4, 4, 0]} name="Readers" />
                <Bar dataKey="completions" fill="#10b981" radius={[0, 4, 4, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Institution Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {institutions?.map(inst => {
              const progress = Math.floor(Math.random() * 40) + 60;
              return (
                <div key={inst.id} className="flex items-center gap-4">
                  <div className="w-48 truncate font-medium text-sm">{inst.name}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-primary">{progress}%</div>
                  <div className="w-24 text-right text-xs text-muted-foreground">{inst.studentCount} students</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
