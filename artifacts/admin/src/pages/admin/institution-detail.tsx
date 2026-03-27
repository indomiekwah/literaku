import { useRoute, Link } from 'wouter';
import { useInstitution, useStudents, useOperators } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { ArrowLeft, Users, BookOpen, TrendingUp, MapPin } from 'lucide-react';

export default function InstitutionDetail() {
  const [, params] = useRoute('/admin/institutions/:id');
  const id = params?.id || '';
  const { data: institution, isLoading: instLoading } = useInstitution(id);
  const { data: allStudents, isLoading: studentsLoading } = useStudents(id);
  const { data: operators } = useOperators();

  const instOperators = operators?.filter(o => o.institutionId === id) || [];
  const students = allStudents || [];
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.readingProgress, 0) / students.length)
    : 0;

  if (instLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Institution not found</h2>
        <Link href="/admin/institutions">
          <Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Institutions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/institutions">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold">{institution.name}</h1>
            <Badge variant={institution.status === 'active' ? 'default' : 'secondary'} className={institution.status === 'active' ? 'bg-emerald-500' : ''}>
              {institution.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {institution.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Students" value={students.length} icon={Users} />
        <StatCard title="Books Assigned" value={students.reduce((a, s) => a + s.booksAssigned, 0)} icon={BookOpen} />
        <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 10).map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">{student.grade}</span>
                    </TableCell>
                    <TableCell>{student.booksAssigned}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={student.readingProgress} className="h-2 flex-1 max-w-[120px]" />
                        <span className="text-xs font-medium">{student.readingProgress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No students enrolled yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {students.length > 10 && (
              <p className="text-sm text-muted-foreground text-center mt-4">Showing 10 of {students.length} students</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Operators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {instOperators.length > 0 ? instOperators.map(op => (
              <div key={op.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {op.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{op.name}</p>
                  <p className="text-xs text-muted-foreground">{op.email}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">{op.status}</Badge>
              </div>
            )) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Primary operator: {institution.operatorName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
