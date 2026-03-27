import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useStudents, useReadingReports } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function StudentReportView({ studentId }: { studentId: string }) {
  const { data: reports, isLoading } = useReadingReports(studentId);

  if (isLoading) return <Skeleton className="h-48" />;

  const completed = reports?.filter(r => r.status === 'completed').length || 0;
  const inProgress = reports?.filter(r => r.status === 'in_progress').length || 0;
  const avgProgress = reports?.length
    ? Math.round(reports.reduce((a, r) => a + r.progress, 0) / reports.length)
    : 0;

  const chartData = reports?.map(r => ({
    name: r.bookTitle.length > 15 ? r.bookTitle.substring(0, 15) + '...' : r.bookTitle,
    progress: r.progress,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Books Assigned" value={reports?.length || 0} icon={BookOpen} />
        <StatCard title="Completed" value={completed} icon={Trophy} />
        <StatCard title="In Progress" value={inProgress} icon={Clock} />
        <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={TrendingUp} />
      </div>

      {chartData.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Progress by Book</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]} name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reports?.map(report => (
          <Card key={report.bookId} className="border-slate-200 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate">{report.bookTitle}</h3>
                    <Badge
                      variant={report.status === 'completed' ? 'default' : 'secondary'}
                      className={report.status === 'completed' ? 'bg-emerald-500' : report.status === 'in_progress' ? 'bg-amber-500' : ''}
                    >
                      {report.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={report.progress} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-8">{report.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last read: {format(new Date(report.lastRead), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OperatorReports() {
  const { user } = useAuth();
  const { data: students, isLoading } = useStudents(user?.institutionId);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Reading Reports</h1>
        <p className="text-muted-foreground mt-1">View detailed reading progress per student.</p>
      </div>

      <div className="max-w-xs">
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger>
            <SelectValue placeholder="Select a student..." />
          </SelectTrigger>
          <SelectContent>
            {students?.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} - {s.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudent ? (
        <StudentReportView studentId={selectedStudent} />
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">Select a Student</h3>
            <p className="text-muted-foreground mt-2">Choose a student from the dropdown to view their reading progress report.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
