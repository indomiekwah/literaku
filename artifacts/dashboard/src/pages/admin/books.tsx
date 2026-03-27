import { useState } from 'react';
import { useBooks, useCreateBook } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, BookUp, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBooks() {
  const { data: books, isLoading } = useBooks();
  const createMutation = useCreateBook();
  
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', language: 'Indonesian', pages: '' });

  const filtered = books?.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-violet-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      await createMutation.mutateAsync({ 
        ...formData, 
        pages: parseInt(formData.pages) || 100,
        coverColor: randomColor
      });
      toast.success('Book added to catalog');
      setIsCreateOpen(false);
      setFormData({ title: '', author: '', language: 'Indonesian', pages: '' });
    } catch {
      toast.error('Failed to add book');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Books Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage global book inventory available to all institutions.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg"><BookUp className="w-4 h-4 mr-2" /> Upload Book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Book to Catalog</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Book Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Laskar Pelangi" />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="e.g. Andrea Hirata" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input required value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Pages</Label>
                  <Input type="number" required value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <Label>PDF File</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                  <BookUp className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Click to upload or drag & drop</span>
                  <span className="text-xs">PDF up to 50MB</span>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Uploading...' : 'Save Book'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-white" 
            placeholder="Search titles or authors..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filtered?.map((book) => (
          <div key={book.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`aspect-[3/4] w-full ${book.coverColor} flex items-center justify-center p-6 text-center`}>
              <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-3 shadow-sm">{book.title}</h3>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-foreground truncate">{book.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{book.author}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{book.language}</span>
                <span>{book.pages} pages</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
