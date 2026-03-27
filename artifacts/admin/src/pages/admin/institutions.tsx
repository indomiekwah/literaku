import { useState } from 'react';
import { useInstitutions, useCreateInstitution, useDeleteInstitution } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

export default function AdminInstitutions() {
  const { data: institutions, isLoading } = useInstitutions();
  const createMutation = useCreateInstitution();
  const deleteMutation = useDeleteInstitution();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', operatorName: '' });

  const filtered = institutions?.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ ...formData, studentCount: 0, status: 'active' });
      toast.success('Institution created successfully');
      setIsCreateOpen(false);
      setFormData({ name: '', location: '', operatorName: '' });
    } catch {
      toast.error('Failed to create institution');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Institutions</h1>
          <p className="text-muted-foreground mt-1">Manage partner schools and reading centers.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg"><Plus className="w-4 h-4 mr-2" /> Add Institution</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Institution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jakarta Central School" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City, Region" />
              </div>
              <div className="space-y-2">
                <Label>Primary Operator Name</Label>
                <Input required value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} placeholder="John Doe" />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Institution'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-10 bg-white" 
              placeholder="Search institutions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.map((inst) => (
                <TableRow key={inst.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-semibold text-primary">{inst.name}</TableCell>
                  <TableCell>{inst.location}</TableCell>
                  <TableCell>{inst.operatorName}</TableCell>
                  <TableCell>{inst.studentCount}</TableCell>
                  <TableCell>
                    <Badge variant={inst.status === 'active' ? 'default' : 'secondary'} className={inst.status === 'active' ? 'bg-emerald-500' : ''}>
                      {inst.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/institutions/${inst.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this institution?')) {
                            deleteMutation.mutate(inst.id, {
                              onSuccess: () => toast.success('Deleted successfully')
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No institutions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
