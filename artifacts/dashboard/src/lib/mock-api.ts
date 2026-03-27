// Mock Database and Services mimicking a real backend API

export type Role = 'admin' | 'operator';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  institutionId?: string;
  token: string;
}

export interface Institution {
  id: string;
  name: string;
  location: string;
  studentCount: number;
  operatorName: string;
  status: 'active' | 'inactive';
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  institutionId: string;
  institutionName: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  institutionId: string;
  booksAssigned: number;
  readingProgress: number; // 0-100
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  pages: number;
  coverColor: string;
}

export interface ReadingReport {
  studentId: string;
  bookId: string;
  bookTitle: string;
  progress: number;
  lastRead: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface DigitizationRequest {
  id: string;
  title: string;
  author: string;
  isbn: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  institutionId: string;
}

// Seed Data
let institutions: Institution[] = [
  { id: '1', name: 'Jakarta Central School', location: 'Jakarta, Indonesia', studentCount: 120, operatorName: 'Budi Santoso', status: 'active' },
  { id: '2', name: 'Bandung High', location: 'Bandung, Indonesia', studentCount: 85, operatorName: 'Siti Aminah', status: 'active' },
  { id: '3', name: 'Surabaya Academy', location: 'Surabaya, Indonesia', studentCount: 40, operatorName: 'Agus Setiawan', status: 'inactive' },
  { id: '4', name: 'Bali International', location: 'Bali, Indonesia', studentCount: 200, operatorName: 'Dewi Lestari', status: 'active' },
  { id: '5', name: 'Medan Public School', location: 'Medan, Indonesia', studentCount: 150, operatorName: 'Rudi Hartono', status: 'active' },
];

let operators: Operator[] = [
  { id: '1', name: 'Budi Santoso', email: 'operator@literaku.com', institutionId: '1', institutionName: 'Jakarta Central School', status: 'active' },
  { id: '2', name: 'Siti Aminah', email: 'siti@literaku.com', institutionId: '2', institutionName: 'Bandung High', status: 'active' },
];

let books: Book[] = [
  { id: '1', title: 'Laskar Pelangi', author: 'Andrea Hirata', language: 'Indonesian', pages: 529, coverColor: 'bg-blue-500' },
  { id: '2', title: 'Bumi Manusia', author: 'Andrea Hirata', language: 'Indonesian', pages: 400, coverColor: 'bg-emerald-500' },
  { id: '3', title: 'Cantik Itu Luka', author: 'Eka Kurniawan', language: 'Indonesian', pages: 350, coverColor: 'bg-rose-500' },
  { id: '4', title: 'Negeri 5 Menara', author: 'Ahmad Fuadi', language: 'Indonesian', pages: 423, coverColor: 'bg-amber-500' },
  { id: '5', title: 'Perahu Kertas', author: 'Ahmad Fuadi', language: 'Indonesian', pages: 380, coverColor: 'bg-indigo-500' },
  { id: '6', title: 'Sang Pemimpi', author: 'Andrea Hirata', language: 'Indonesian', pages: 292, coverColor: 'bg-violet-500' },
];

let students: Student[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `s${i + 1}`,
  name: `Student ${i + 1}`,
  grade: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'][Math.floor(Math.random() * 6)],
  institutionId: '1', // Assign mostly to operator 1 for mock purposes
  booksAssigned: Math.floor(Math.random() * 5) + 1,
  readingProgress: Math.floor(Math.random() * 100),
}));

let digiRequests: DigitizationRequest[] = [
  { id: '1', title: 'Sejarah Indonesia', author: 'Unknown', isbn: '978-602-1234-56-7', notes: 'Needed for Grade 6 history class', status: 'pending', institutionId: '1' }
];

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    await delay(1000);
    if (email === 'admin@literaku.com' && password === 'admin123') {
      return { id: 'admin1', email, name: 'Super Admin', role: 'admin', token: 'mock-jwt-admin-token' };
    }
    if (email === 'operator@literaku.com' && password === 'operator123') {
      return { id: 'op1', email, name: 'Budi Santoso', role: 'operator', institutionId: '1', token: 'mock-jwt-op-token' };
    }
    throw new Error('Invalid email or password');
  },

  // Institutions
  getInstitutions: async () => { await delay(); return [...institutions]; },
  getInstitution: async (id: string) => { await delay(); return institutions.find(i => i.id === id); },
  createInstitution: async (data: Omit<Institution, 'id'>) => {
    await delay();
    const newInst = { ...data, id: Math.random().toString(36).substr(2, 9) };
    institutions.push(newInst);
    return newInst;
  },
  updateInstitution: async (id: string, data: Partial<Institution>) => {
    await delay();
    institutions = institutions.map(i => i.id === id ? { ...i, ...data } : i);
    return institutions.find(i => i.id === id);
  },
  deleteInstitution: async (id: string) => {
    await delay();
    institutions = institutions.filter(i => i.id !== id);
    return { success: true };
  },

  // Operators
  getOperators: async () => { await delay(); return [...operators]; },
  createOperator: async (data: Omit<Operator, 'id'>) => {
    await delay();
    const newOp = { ...data, id: Math.random().toString(36).substr(2, 9) };
    operators.push(newOp);
    return newOp;
  },
  deleteOperator: async (id: string) => {
    await delay();
    operators = operators.filter(o => o.id !== id);
    return { success: true };
  },

  // Books
  getBooks: async () => { await delay(); return [...books]; },
  createBook: async (data: Omit<Book, 'id'>) => {
    await delay();
    const newBook = { ...data, id: Math.random().toString(36).substr(2, 9) };
    books.push(newBook);
    return newBook;
  },

  // Students (Scoped to operator's institution usually)
  getStudents: async (institutionId?: string) => { 
    await delay(); 
    return institutionId ? students.filter(s => s.institutionId === institutionId) : [...students]; 
  },
  getStudent: async (id: string) => { await delay(); return students.find(s => s.id === id); },
  createStudent: async (data: Omit<Student, 'id' | 'readingProgress' | 'booksAssigned'>) => {
    await delay();
    const newStudent = { ...data, id: Math.random().toString(36).substr(2, 9), readingProgress: 0, booksAssigned: 0 };
    students.push(newStudent);
    return newStudent;
  },

  // Reading Reports
  getReadingReports: async (studentId: string): Promise<ReadingReport[]> => {
    await delay();
    // Generate mock reports for this student based on booksAssigned
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    return books.slice(0, student.booksAssigned).map(b => ({
      studentId,
      bookId: b.id,
      bookTitle: b.title,
      progress: Math.floor(Math.random() * 100),
      lastRead: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      status: Math.random() > 0.5 ? 'in_progress' : 'completed'
    }));
  },

  // Digitization
  getDigitizationRequests: async (institutionId?: string) => {
    await delay();
    return institutionId ? digiRequests.filter(d => d.institutionId === institutionId) : [...digiRequests];
  },
  createDigitizationRequest: async (data: Omit<DigitizationRequest, 'id' | 'status'>) => {
    await delay();
    const req = { ...data, id: Math.random().toString(36).substr(2, 9), status: 'pending' as const };
    digiRequests.push(req);
    return req;
  },

  // Dashboard Stats
  getAdminStats: async () => {
    await delay();
    return {
      totalInstitutions: institutions.length,
      totalStudents: 1450,
      totalBooks: books.length,
      activeReaders: 890,
    };
  },
  getOperatorStats: async (institutionId: string) => {
    await delay();
    const instStudents = students.filter(s => s.institutionId === institutionId);
    return {
      totalStudents: instStudents.length,
      booksAssigned: instStudents.reduce((acc, s) => acc + s.booksAssigned, 0),
      averageProgress: Math.floor(instStudents.reduce((acc, s) => acc + s.readingProgress, 0) / (instStudents.length || 1)),
      activeThisWeek: Math.floor(instStudents.length * 0.8)
    };
  }
};
