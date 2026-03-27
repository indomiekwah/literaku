import { useState } from "react";
import { useCreateDigitizationRequest, useDigitizationRequests } from "@/hooks/use-books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function OperatorDigitization() {
  const { data: requests } = useDigitizationRequests();
  const createMutation = useCreateDigitizationRequest();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ bookTitle: "", bookAuthor: "", bookIsbn: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast({ title: "Request Submitted", description: "The admin team will review it shortly." });
      setFormData({ bookTitle: "", bookAuthor: "", bookIsbn: "", notes: "" });
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
        <p className="text-slate-500 mt-1">Request new books to be processed for the accessible reading platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-lg shadow-slate-200/40 rounded-2xl h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
            <CardTitle className="text-lg">Submit New Request</CardTitle>
            <CardDescription>Provide details about the book you need.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Book Title *</label>
                <Input required value={formData.bookTitle} onChange={e => setFormData({...formData, bookTitle: e.target.value})} className="h-11 rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Author</label>
                <Input value={formData.bookAuthor} onChange={e => setFormData({...formData, bookAuthor: e.target.value})} className="h-11 rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ISBN (Optional)</label>
                <Input value={formData.bookIsbn} onChange={e => setFormData({...formData, bookIsbn: e.target.value})} className="h-11 rounded-xl bg-slate-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Additional Notes</label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="rounded-xl bg-slate-50 resize-none" rows={3} placeholder="Why is this book needed?" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl mt-2">
                {createMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/40 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
            <CardTitle className="text-lg">My Institution's Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {requests?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No requests submitted yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests?.map((req: any) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-900">{req.bookTitle}</h4>
                      <p className="text-sm text-slate-500 mt-1">{req.bookAuthor || "Unknown Author"} {req.bookIsbn ? `• ISBN: ${req.bookIsbn}` : ""}</p>
                      <p className="text-xs text-slate-400 mt-2">Submitted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className={`${statusColors[req.status]} uppercase tracking-wider text-[10px]`}>
                        {req.status.replace("_", " ")}
                      </Badge>
                      {req.adminNotes && (
                        <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded-lg max-w-[200px] italic">
                          "{req.adminNotes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
