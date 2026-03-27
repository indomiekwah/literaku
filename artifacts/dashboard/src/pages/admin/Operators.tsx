import { useState } from "react";
import { useOperators, useCreateOperator, useInstitutions } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Plus, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Operators() {
  const { data: operators, isLoading } = useOperators();
  const { data: institutions } = useInstitutions();
  const createMutation = useCreateOperator();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", institutionId: "" });

  const filtered = operators?.filter((o: any) => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    o.institution?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionId) {
      toast({ variant: "destructive", title: "Error", description: "Please select an institution." });
      return;
    }
    try {
      await createMutation.mutateAsync({
        ...formData,
        institutionId: parseInt(formData.institutionId)
      });
      toast({ title: "Operator Created", description: `${formData.name} was added successfully.` });
      setIsOpen(false);
      setFormData({ name: "", email: "", password: "", institutionId: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Operators</h2>
          <p className="text-slate-500 mt-1">Manage institution administrators.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2" size={18} /> Add Operator
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">New Operator Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
                <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Assign to Institution</label>
                <Select value={formData.institutionId} onValueChange={v => setFormData({...formData, institutionId: v})}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst: any) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl mt-4">
                {createMutation.isPending ? "Creating..." : "Create Account"}
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
              placeholder="Search operators..." 
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
                <TableHead className="font-semibold text-slate-600">Operator</TableHead>
                <TableHead className="font-semibold text-slate-600">Institution</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center"><div className="animate-pulse flex justify-center"><Users className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-500">No operators found</TableCell></TableRow>
              ) : (
                filtered?.map((op: any) => (
                  <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <p className="font-medium text-slate-900">{op.name}</p>
                      <p className="text-sm text-slate-500">{op.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">{op.institution?.name || "Unassigned"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={op.isActive ? "default" : "secondary"} className={op.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""}>
                        {op.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{format(new Date(op.createdAt), "MMM d, yyyy")}</TableCell>
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
