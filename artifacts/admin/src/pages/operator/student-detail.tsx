import { useRoute, Link } from 'wouter';
import { useStudent, useReadingReports } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDetail() {
  const [, params] = useRoute('/operator/students/:id');
  const id = params?.id || '';
  const { data: student, isLoading: studentLoading } = useStudent(id);
  const { data: reports, isLoading: reportsLoading } = useReadingReports(id);

  if (studentLoading || reportsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Student not found</h2>
        <Link href="/operator/students">
          <Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Students</Button>
        </Link>
      </div>
    );
  }

  const completed = reports?.filter(r => r.status === 'completed').length || 0;
  const inProgress = reports?.filter(r => r.status === 'in_progress').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/operator/students">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold">{student.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{student.grade}</Badge>
                <span className="text-muted-foreground text-sm">{student.booksAssigned} books assigned</span>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{student.readingProgress}%</div>
                <div className="text-xs text-muted-foreground">Overall Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-500">{completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-display font-bold mb-4">Reading Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports?.map(report => (
            <Card key={report.bookId} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{report.bookTitle}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last read: {format(new Date(report.lastRead), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={report.status === 'completed' ? 'default' : 'secondary'}
                    className={report.status === 'completed' ? 'bg-emerald-500' : report.status === 'in_progress' ? 'bg-amber-500' : ''}
                  >
                    {report.status === 'completed' && <Trophy className="w-3 h-3 mr-1" />}
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{report.progress}%</span>
                  </div>
                  <Progress value={report.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
          {(!reports || reports.length === 0) && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              No reading activity yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
