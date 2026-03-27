import { useAdminActivity } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, UserPlus, CheckCircle } from "lucide-react";

export default function ActivityFeed() {
  const { data, isLoading } = useAdminActivity(20);

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Recent Activity</h2>
        <p className="text-slate-500 mt-2">Real-time pulse of the platform across all institutions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="text-emerald-500" size={20} />
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data?.recentUsers?.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">No recent users</div>}
              {data?.recentUsers?.map((user: any) => (
                <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">{user.role}</span>
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="text-blue-500" size={20} />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data?.recentAssignments?.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">No recent assignments</div>}
              {data?.recentAssignments?.map((assignment: any) => (
                <div key={assignment.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <p className="font-medium text-slate-900">
                    <span className="font-bold">{assignment.student.name}</span> was assigned <span className="italic text-primary">{assignment.book.title}</span>
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full truncate max-w-[120px]">
                      {assignment.institution.name}
                    </span>
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="text-indigo-500" size={20} />
              Reading Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data?.recentProgress?.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">No recent progress</div>}
              {data?.recentProgress?.map((prog: any) => (
                <div key={prog.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <p className="font-medium text-slate-900">{prog.student.name}</p>
                  <p className="text-sm text-slate-600 truncate">{prog.book.title}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2 w-full max-w-[140px]">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${prog.completionPercent}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700">{prog.completionPercent}%</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(prog.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
