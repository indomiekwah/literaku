import { useState } from 'react';
import { useBooks, useStudents } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookAssignment() {
  const { user } = useAuth();
  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: students, isLoading: studentsLoading } = useStudents(user?.institutionId);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const filteredBooks = books?.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = () => {
    if (!selectedBook || selectedStudents.length === 0) {
      toast.error('Select a book and at least one student');
      return;
    }
    toast.success(`Assigned book to ${selectedStudents.length} student(s)`);
    setSelectedStudents([]);
    setIsAssignOpen(false);
    setSelectedBook(null);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (students && selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students?.map(s => s.id) || []);
    }
  };

  if (booksLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Book Assignment</h1>
          <p className="text-muted-foreground mt-1">Browse and assign books to your students.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-white"
              placeholder="Search books by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks?.map(book => (
          <Card key={book.id} className={`border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${selectedBook === book.id ? 'ring-2 ring-primary border-primary' : ''}`}
            onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-16 rounded-lg ${book.coverColor} flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{book.language}</Badge>
                    <span className="text-xs text-muted-foreground">{book.pages} pages</span>
                  </div>
                </div>
                {selectedBook === book.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBook && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-xl rounded-full px-8">
                <Users className="w-4 h-4 mr-2" /> Assign to Students
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Assign "{books?.find(b => b.id === selectedBook)?.title}"
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{selectedStudents.length} selected</span>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    {students && selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                {students?.map(student => (
                  <label key={student.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.grade}</p>
                    </div>
                  </label>
                ))}
                <Button onClick={handleAssign} className="w-full mt-4" disabled={selectedStudents.length === 0}>
                  Assign to {selectedStudents.length} Student(s)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {filteredBooks?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No books match your search.
        </div>
      )}
    </div>
  );
}
