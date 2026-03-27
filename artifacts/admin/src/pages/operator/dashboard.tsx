import { useAuth } from '@/hooks/use-auth';
import { useOperatorStats, useStudents } from '@/hooks/use-api';
import { StatCard } from '@/components/ui/stat-card';
import { GraduationCap, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function OperatorDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOperatorStats(user?.institutionId || '');
  const { data: students, isLoading: studentsLoading } = useStudents(user?.institutionId || '');

  if (statsLoading || studentsLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  const topReaders = students?.sort((a, b) => b.readingProgress - a.readingProgress).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Institution Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your students and monitor their reading journeys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Enrolled Students" value={stats?.totalStudents || 0} icon={GraduationCap} />
        <StatCard title="Books Assigned" value={stats?.booksAssigned || 0} icon={BookOpen} />
        <StatCard title="Avg. Reading Progress" value={`${stats?.averageProgress || 0}%`} icon={TrendingUp} />
        <StatCard title="Active This Week" value={stats?.activeThisWeek || 0} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Top Readers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topReaders?.map((student, i) => (
                <div key={student.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{student.name}</span>
                      <span className="text-xs font-medium text-muted-foreground">{student.readingProgress}%</span>
                    </div>
                    <Progress value={student.readingProgress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-600 to-primary text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl cursor-pointer border border-white/10">
                <GraduationCap className="w-8 h-8 mb-3" />
                <h4 className="font-semibold">Add Students</h4>
                <p className="text-xs text-white/70 mt-1">Register new readers</p>
              </div>
              <div className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl cursor-pointer border border-white/10">
                <BookOpen className="w-8 h-8 mb-3" />
                <h4 className="font-semibold">Assign Books</h4>
                <p className="text-xs text-white/70 mt-1">Manage reading lists</p>
              </div>
              <div className="col-span-2 bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-xl cursor-pointer border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Request Digitization</h4>
                  <p className="text-xs text-white/70 mt-1">Need a specific book? Request it here.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
