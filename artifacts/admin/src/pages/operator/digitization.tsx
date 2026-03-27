import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useDigitizationRequests, useCreateDigitizationRequest } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BookOpen, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorDigitization() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useDigitizationRequests();
  const createMutation = useCreateDigitizationRequest();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', notes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institutionId) return;
    try {
      await createMutation.mutateAsync({ ...formData, institutionId: user.institutionId });
      toast.success('Digitization request submitted');
      setIsOpen(false);
      setFormData({ title: '', author: '', isbn: '', notes: '' });
    } catch {
      toast.error('Failed to submit request');
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-amber-500', label: 'Pending' },
    approved: { icon: CheckCircle2, color: 'bg-emerald-500', label: 'Approved' },
    rejected: { icon: XCircle, color: 'bg-rose-500', label: 'Rejected' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" /><Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Digitization Requests</h1>
          <p className="text-muted-foreground mt-1">Request new books to be digitized for your institution.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg"><Plus className="w-4 h-4 mr-2" /> New Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Digitization Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Book Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Sejarah Indonesia Modern" />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="e.g. M.C. Ricklefs" />
              </div>
              <div className="space-y-2">
                <Label>ISBN (optional)</Label>
                <Input value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} placeholder="e.g. 978-602-1234-56-7" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Why is this book needed? Which grades will use it?" rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => {
            const config = statusConfig[req.status];
            const StatusIcon = config.icon;
            return (
              <Card key={req.id} className="border-slate-200 shadow-sm">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{req.title}</h3>
                          <p className="text-sm text-muted-foreground">by {req.author}</p>
                        </div>
                        <Badge className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      {req.isbn && <p className="text-xs text-muted-foreground mt-1">ISBN: {req.isbn}</p>}
                      {req.notes && <p className="text-sm mt-2 text-muted-foreground">{req.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg">No Requests Yet</h3>
            <p className="text-muted-foreground mt-2">Submit your first digitization request to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
