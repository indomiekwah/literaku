import { useState } from "react";
import { useBooks, useCreateBook, useDeleteBook } from "@/hooks/use-books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Library, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Books() {
  const { data: books, isLoading } = useBooks();
  const createMutation = useCreateBook();
  const deleteMutation = useDeleteBook();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ title: "", author: "", language: "id", level: "" });

  const filtered = books?.filter((b: any) => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    (b.author && b.author.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast({ title: "Book Added", description: `${formData.title} has been cataloged.` });
      setIsOpen(false);
      setFormData({ title: "", author: "", language: "id", level: "" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Delete book "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Deleted", description: "Book removed from catalog." });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Book Catalog</h2>
          <p className="text-slate-500 mt-1">Manage global available books for assignment.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2" size={18} /> Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Title</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Author</label>
                <Input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Language</label>
                  <select 
                    value={formData.language} 
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="id">Indonesian</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Level (Optional)</label>
                  <Input value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="h-12 rounded-xl" placeholder="e.g. A1, Beginner" />
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl mt-4">
                {createMutation.isPending ? "Adding..." : "Add to Catalog"}
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
              placeholder="Search books by title or author..." 
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
                <TableHead className="font-semibold text-slate-600">Title</TableHead>
                <TableHead className="font-semibold text-slate-600">Author</TableHead>
                <TableHead className="font-semibold text-slate-600">Language</TableHead>
                <TableHead className="font-semibold text-slate-600">Level</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center"><div className="animate-pulse flex justify-center"><Library className="text-slate-300" size={32} /></div></TableCell></TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No books found</TableCell></TableRow>
              ) : (
                filtered?.map((book: any) => (
                  <TableRow key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium text-slate-900">{book.title}</TableCell>
                    <TableCell className="text-slate-600">{book.author || "Unknown"}</TableCell>
                    <TableCell><span className="uppercase text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">{book.language}</span></TableCell>
                    <TableCell className="text-slate-500">{book.level || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(book.id, book.title)} className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg">
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
