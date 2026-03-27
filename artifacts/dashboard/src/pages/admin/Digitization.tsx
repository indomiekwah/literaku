import { useDigitizationRequests, useUpdateDigitizationRequest } from "@/hooks/use-books";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Digitization() {
  const { data: requests, isLoading } = useDigitizationRequests();
  const updateMutation = useUpdateDigitizationRequest();
  const { toast } = useToast();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast({ title: "Status Updated", description: `Request marked as ${status.replace("_", " ")}.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Digitization Requests</h2>
        <p className="text-slate-500 mt-1">Track and manage book processing requests from institutions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Book Title</TableHead>
                <TableHead className="font-semibold text-slate-600">Institution</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><div className="animate-pulse flex justify-center"><ClipboardList className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : requests?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No requests found</TableCell></TableRow>
              ) : (
                requests?.map((req: any) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <p className="font-medium text-slate-900">{req.bookTitle}</p>
                      <p className="text-sm text-slate-500">{req.bookAuthor || "Unknown Author"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-700">{req.institution?.name}</p>
                      <p className="text-xs text-slate-400">By {req.requester?.name}</p>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(req.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[req.status]} uppercase tracking-wider text-[10px]`}>
                        {req.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={req.status} onValueChange={(v) => handleStatusChange(req.id, v)}>
                        <SelectTrigger className="w-[140px] h-9 ml-auto rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
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
