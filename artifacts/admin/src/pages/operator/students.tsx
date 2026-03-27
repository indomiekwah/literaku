import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useStudents, useCreateStudent } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';

export default function OperatorStudents() {
  const { user } = useAuth();
  const { data: students, isLoading } = useStudents(user?.institutionId);
  const createMutation = useCreateStudent();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', grade: '' });

  const filtered = students?.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institutionId) return;
    try {
      await createMutation.mutateAsync({ ...formData, institutionId: user.institutionId });
      toast.success('Student registered successfully');
      setIsCreateOpen(false);
      setFormData({ name: '', grade: '' });
    } catch {
      toast.error('Failed to register student');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Students Directory</h1>
          <p className="text-muted-foreground mt-1">Manage your enrolled students.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg flex-1 sm:flex-none"><Plus className="w-4 h-4 mr-2" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ahmad Fauzi" />
                </div>
                <div className="space-y-2">
                  <Label>Grade Level</Label>
                  <Select value={formData.grade} onValueChange={v => setFormData({...formData, grade: v})}>
                    <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                    <SelectContent>
                      {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Registering...' : 'Register Student'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-10 bg-white" 
              placeholder="Search students by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Student Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Assigned Books</TableHead>
              <TableHead>Overall Progress</TableHead>
              <TableHead className="text-right">Report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((student) => (
              <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                <TableCell>
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                    {student.grade}
                  </span>
                </TableCell>
                <TableCell>{student.booksAssigned}</TableCell>
                <TableCell className="w-[300px]">
                  <div className="flex items-center gap-3">
                    <Progress value={student.readingProgress} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-8">{student.readingProgress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/operator/students/${student.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                      <FileSpreadsheet className="w-4 h-4 mr-2" /> View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No students found. Try importing some data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
