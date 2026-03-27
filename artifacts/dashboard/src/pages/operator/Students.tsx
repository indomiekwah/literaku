import { useState } from "react";
import { useStudents, useRegisterStudent } from "@/hooks/use-operator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus, GraduationCap, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const createMutation = useRegisterStudent();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", externalId: "" });

  const filtered = students?.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast({ title: "Student Registered", description: `${formData.name} added successfully.` });
      setIsOpen(false);
      setFormData({ name: "", email: "", externalId: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">My Students</h2>
          <p className="text-slate-500 mt-1">Manage enrolled students for your institution.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2" size={18} /> Register Student
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Register Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Student ID (Optional)</label>
                <Input value={formData.externalId} onChange={e => setFormData({...formData, externalId: e.target.value})} className="h-12 rounded-xl" placeholder="e.g. NISN" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl mt-4">
                {createMutation.isPending ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search students..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-white rounded-xl border-slate-200"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Student Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Email</TableHead>
                <TableHead className="font-semibold text-slate-600">Student ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><div className="animate-pulse flex justify-center"><GraduationCap className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-500">No students found</TableCell></TableRow>
              ) : (
                filtered?.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                    <TableCell className="text-slate-600">{student.email}</TableCell>
                    <TableCell className="text-slate-500">{student.externalId || "—"}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(student.createdAt), "MMM d, yyyy")}</TableCell>
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
