import { useState } from "react";
import { useInstitutions, useCreateInstitution, useDeleteInstitution } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus, Trash2, Building2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Institutions() {
  const { data: institutions, isLoading } = useInstitutions();
  const createMutation = useCreateInstitution();
  const deleteMutation = useDeleteInstitution();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", address: "", contactEmail: "" });

  const filtered = institutions?.filter((i: any) => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.contactEmail && i.contactEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast({ title: "Institution Created", description: `${formData.name} was added successfully.` });
      setIsOpen(false);
      setFormData({ name: "", address: "", contactEmail: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Delete institution ${name}? This action cannot be undone.`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Deleted", description: "Institution removed." });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Institutions</h2>
          <p className="text-slate-500 mt-1">Manage partner schools and organizations.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2" size={18} /> Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">New Institution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" placeholder="e.g. SMAN 5 Jakarta" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Contact</label>
                <Input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="h-12 rounded-xl" placeholder="admin@school.edu" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl mt-4">
                {createMutation.isPending ? "Creating..." : "Create Institution"}
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
              placeholder="Search institutions..." 
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
                <TableHead className="font-semibold text-slate-600">Institution Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Contact</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Joined</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><div className="animate-pulse flex justify-center"><Building2 className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No institutions found</TableCell></TableRow>
              ) : (
                filtered?.map((inst: any) => (
                  <TableRow key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-900">{inst.name}</TableCell>
                    <TableCell className="text-slate-600">{inst.contactEmail || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={inst.isActive ? "default" : "secondary"} className={inst.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""}>
                        {inst.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(inst.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(inst.id, inst.name)} className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg">
                        <Trash2 size={18} />
                      </Button>
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
