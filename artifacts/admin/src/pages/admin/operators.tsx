import { useState } from 'react';
import { useOperators, useInstitutions, useCreateOperator, useDeleteOperator } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UserPlus, KeyRound, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOperators() {
  const { data: operators, isLoading } = useOperators();
  const { data: institutions } = useInstitutions();
  const createMutation = useCreateOperator();
  const deleteMutation = useDeleteOperator();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', institutionId: '' });
  const [generatedCreds, setGeneratedCreds] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const inst = institutions?.find(i => i.id === formData.institutionId);
    if (!inst) return;

    try {
      const result = await createMutation.mutateAsync({ 
        name: formData.name, 
        email: formData.email, 
        institutionId: formData.institutionId,
        institutionName: inst.name,
        status: 'active'
      });
      // Generate a fake initial password
      const tempPass = Math.random().toString(36).slice(-8);
      setGeneratedCreds({ email: result.email, password: tempPass });
      toast.success('Operator created successfully');
    } catch {
      toast.error('Failed to create operator');
    }
  };

  const copyCreds = () => {
    if (!generatedCreds) return;
    navigator.clipboard.writeText(`Login: ${generatedCreds.email}\nPassword: ${generatedCreds.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Credentials copied to clipboard');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Operators</h1>
          <p className="text-muted-foreground mt-1">Manage institution administrators.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setGeneratedCreds(null);
            setFormData({ name: '', email: '', institutionId: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg"><UserPlus className="w-4 h-4 mr-2" /> Add Operator</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Operator Account</DialogTitle>
              <DialogDescription>Create a new operator. Credentials will be generated automatically.</DialogDescription>
            </DialogHeader>
            
            {!generatedCreds ? (
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@school.edu" />
                </div>
                <div className="space-y-2">
                  <Label>Assign Institution</Label>
                  <Select value={formData.institutionId} onValueChange={v => setFormData({...formData, institutionId: v})}>
                    <SelectTrigger><SelectValue placeholder="Select institution..." /></SelectTrigger>
                    <SelectContent>
                      {institutions?.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending || !formData.institutionId}>
                  {createMutation.isPending ? 'Generating...' : 'Generate Credentials'}
                </Button>
              </form>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                  <KeyRound className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Account Created!</h4>
                    <p className="text-sm opacity-90">Please copy these credentials securely. The password will not be shown again.</p>
                  </div>
                </div>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Login Email</Label>
                    <div className="font-mono mt-1 text-sm">{generatedCreds.email}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Temporary Password</Label>
                    <div className="font-mono mt-1 text-sm font-medium">{generatedCreds.password}</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={copyCreds}>
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </Button>
                <Button className="w-full" onClick={() => setIsCreateOpen(false)}>Done</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators?.map((op) => (
              <TableRow key={op.id}>
                <TableCell className="font-medium">{op.name}</TableCell>
                <TableCell>{op.email}</TableCell>
                <TableCell className="text-muted-foreground">{op.institutionName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {op.status}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      if (confirm('Delete this operator?')) {
                        deleteMutation.mutate(op.id, { onSuccess: () => toast.success('Operator deleted') });
                      }
                    }}
                  >
                    Revoke Access
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
