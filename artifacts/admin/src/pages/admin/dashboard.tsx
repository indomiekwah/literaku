import { useAdminStats, useInstitutions } from '@/hooks/use-api';
import { StatCard } from '@/components/ui/stat-card';
import { Building2, Users, Library, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: institutions, isLoading: instLoading } = useInstitutions();

  if (statsLoading || instLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back. Here's what's happening across your institutions today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Institutions" value={stats?.totalInstitutions || 0} icon={Building2} trend="+2" trendUp={true} />
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} trend="+124" trendUp={true} />
        <StatCard title="Books Catalog" value={stats?.totalBooks || 0} icon={Library} />
        <StatCard title="Active Readers" value={stats?.activeReaders || 0} icon={Activity} trend="+12%" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions?.slice(0, 5).map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">{inst.name}</TableCell>
                    <TableCell className="text-muted-foreground">{inst.location}</TableCell>
                    <TableCell>{inst.studentCount}</TableCell>
                    <TableCell>
                      <Badge variant={inst.status === 'active' ? 'default' : 'secondary'} className={inst.status === 'active' ? 'bg-emerald-500' : ''}>
                        {inst.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Server Uptime</span>
                <span>99.9%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>API Response Time</span>
                <span>45ms</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[90%]" />
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/10 rounded-xl">
              <h4 className="font-semibold mb-2 text-white">Latest Update</h4>
              <p className="text-sm text-primary-foreground/80">Version 2.4.1 deployed successfully with new digitization features.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
