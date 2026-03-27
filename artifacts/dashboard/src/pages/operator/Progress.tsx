import { useReadingProgress } from "@/hooks/use-operator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

export default function Progress() {
  const { data: progress, isLoading } = useReadingProgress();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Reading Progress</h2>
        <p className="text-slate-500 mt-1">Monitor how your students are engaging with assigned books.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Student</TableHead>
                <TableHead className="font-semibold text-slate-600">Book Title</TableHead>
                <TableHead className="font-semibold text-slate-600 w-1/4">Completion</TableHead>
                <TableHead className="font-semibold text-slate-600">Last Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><div className="animate-pulse flex justify-center"><Activity className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : progress?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-500">No reading activity recorded yet</TableCell></TableRow>
              ) : (
                progress?.map((prog: any) => (
                  <TableRow key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <p className="font-medium text-slate-900">{prog.student.name}</p>
                      <p className="text-xs text-slate-500">{prog.student.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">{prog.book.title}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${prog.completionPercent === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                            style={{ width: `${prog.completionPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 w-10 text-right">{prog.completionPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {prog.lastReadAt ? formatDistanceToNow(new Date(prog.lastReadAt), { addSuffix: true }) : "Not started"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
