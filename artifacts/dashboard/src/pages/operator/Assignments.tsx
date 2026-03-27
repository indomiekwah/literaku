import { useState } from "react";
import { useStudents, useBulkAssignBooks } from "@/hooks/use-operator";
import { useBooks } from "@/hooks/use-books";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function Assignments() {
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: books, isLoading: loadingBooks } = useBooks();
  const assignMutation = useBulkAssignBooks();
  const { toast } = useToast();
  
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const handleToggleStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students?.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students?.map((s: any) => s.id) || []);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBookId || selectedStudentIds.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Select a book and at least one student." });
      return;
    }
    
    try {
      await assignMutation.mutateAsync({
        bookId: parseInt(selectedBookId),
        studentIds: selectedStudentIds
      });
      toast({ title: "Success", description: "Book assigned to selected students." });
      setSelectedStudentIds([]);
      setSelectedBookId("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Book Assignments</h2>
        <p className="text-slate-500 mt-1">Distribute books to students in your institution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-lg shadow-slate-200/40 rounded-2xl h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
            <CardTitle className="text-lg">Select Book</CardTitle>
            <CardDescription>Choose from global catalog</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger className="w-full h-12 rounded-xl">
                <SelectValue placeholder="Select a book..." />
              </SelectTrigger>
              <SelectContent>
                {books?.map((b: any) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.title} <span className="text-slate-400 text-xs">- {b.author}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBookId && (
              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <BookOpen className="text-primary mb-2" size={24} />
                <h4 className="font-semibold text-slate-900">{books?.find((b:any) => b.id.toString() === selectedBookId)?.title}</h4>
                <p className="text-sm text-slate-600 mt-1">Ready to be assigned to {selectedStudentIds.length} students.</p>
              </div>
            )}

            <Button 
              className="w-full mt-6 h-12 rounded-xl" 
              onClick={handleSubmit}
              disabled={assignMutation.isPending || !selectedBookId || selectedStudentIds.length === 0}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign to Students"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-lg shadow-slate-200/40 rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Select Students</CardTitle>
              <CardDescription>{selectedStudentIds.length} selected</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="rounded-lg">
              {selectedStudentIds.length === students?.length ? "Deselect All" : "Select All"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingStudents ? (
              <div className="p-8 text-center text-slate-400">Loading students...</div>
            ) : students?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No students registered yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {students?.map((student: any) => (
                  <label key={student.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <Checkbox 
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={() => handleToggleStudent(student.id)}
                      className="rounded text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
