export type ConversionStatus = "pending" | "processing" | "ready" | "error";

export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  conversionStatus: ConversionStatus;
  pages: number;
  content: string[];
  assignedTo: string[];
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  assignedBooks: string[];
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  adminEmail: string;
}

export interface ReadingHistory {
  id: string;
  bookId: string;
  title: string;
  lastPage: number;
  totalPages: number;
  timestamp: string;
}

export interface VoiceCommand {
  command: string;
  commandId?: string;
  description: string;
}

export interface NaturalVoiceHint {
  example: string;
  intent: string;
}

export const sampleInstitution: Institution = {
  id: "inst-1",
  name: "Universitas Indonesia",
  code: "UI2024",
  adminEmail: "admin@ui.ac.id",
};

export const sampleStudents: Student[] = [
  { id: "s1", name: "Andi Pratama", studentId: "STU001", assignedBooks: ["1", "2", "3"] },
  { id: "s2", name: "Siti Rahayu", studentId: "STU002", assignedBooks: ["1", "4", "5"] },
  { id: "s3", name: "Budi Santoso", studentId: "STU003", assignedBooks: ["2", "3", "5"] },
  { id: "s4", name: "Dewi Lestari", studentId: "STU004", assignedBooks: ["1", "2", "4"] },
];

export const sampleBooks: CatalogBook[] = [
  {
    id: "1",
    title: "Building Educational Strategies",
    author: "Prof. Dr. Achmad Sanusi",
    isbn: "978-602-1234-01-1",
    conversionStatus: "ready",
    pages: 30,
    assignedTo: ["s1", "s2", "s4"],
    content: [
      "Chapter 1: Foundations of Education\n\nEducation is the cornerstone of human civilization. Throughout history, societies have recognized the transformative power of learning and knowledge acquisition. This chapter explores the fundamental principles that underpin effective educational systems.\n\nThe purpose of education extends far beyond the mere transmission of facts and figures. At its core, education aims to develop critical thinking skills, foster creativity, and prepare individuals for active participation in society.",
      "The development of educational theory has been shaped by numerous philosophers and thinkers. From Plato's Academy to modern constructivist approaches, each era has contributed unique insights into how people learn and how teaching can be optimized.\n\nKey principles include:\n- Student-centered learning\n- Active engagement with material\n- Collaborative knowledge construction\n- Continuous assessment and feedback",
      "Chapter 2: Strategic Planning in Education\n\nStrategic planning is essential for educational institutions seeking to achieve their goals effectively. This process involves setting clear objectives, identifying resources, and developing action plans that align with the institution's mission.\n\nEffective strategic planning requires input from all stakeholders, including teachers, administrators, students, and community members.",
      "The implementation of educational strategies requires careful consideration of local context, available resources, and the specific needs of the student population. No single approach works universally.\n\nSuccessful educational institutions continuously evaluate and adapt their strategies based on outcomes data and emerging research findings.",
      "Chapter 3: Assessment and Evaluation\n\nAssessment plays a crucial role in the educational process. It provides valuable feedback to both teachers and students, helping to identify areas of strength and areas needing improvement.\n\nModern assessment approaches emphasize formative assessment, which is integrated into the learning process rather than being limited to end-of-unit tests.",
    ],
  },
  {
    id: "2",
    title: "The Art of Speaking",
    author: "Oh Su Hyang",
    isbn: "978-602-1234-02-8",
    conversionStatus: "ready",
    pages: 25,
    assignedTo: ["s1", "s3", "s4"],
    content: [
      "Chapter 1: The Power of Words\n\nWords have the power to inspire, motivate, and transform. The way we communicate shapes our relationships, our careers, and our lives. This book explores the art of effective communication and provides practical strategies for becoming a more compelling speaker.",
      "Effective communication begins with listening. Before we can speak well, we must learn to listen deeply and empathetically. Active listening involves paying attention not just to words, but to tone, body language, and the emotions behind the message.",
      "Chapter 2: Building Confidence\n\nMany people struggle with public speaking due to fear and anxiety. However, confidence in speaking can be developed through practice, preparation, and a shift in mindset. Rather than focusing on perfection, focus on connection with your audience.",
      "Tips for building speaking confidence:\n- Start with small groups and gradually increase audience size\n- Practice regularly in front of a mirror or recording device\n- Focus on your message rather than yourself\n- Remember that most audiences are supportive and want you to succeed",
      "Chapter 3: Storytelling\n\nStories are one of the most powerful tools in a speaker's arsenal. They create emotional connections, make abstract concepts concrete, and are far more memorable than bare facts and statistics.",
    ],
  },
  {
    id: "3",
    title: "The Miracle of Limitations",
    author: "Jihad Al-Malki",
    isbn: "978-602-1234-03-5",
    conversionStatus: "ready",
    pages: 20,
    assignedTo: ["s1", "s3"],
    content: [
      "Chapter 1: Embracing Limitations\n\nLimitations are often viewed as obstacles to success. However, this book argues that limitations can actually be powerful catalysts for growth and innovation. When we embrace our limitations, we discover creative solutions we might never have found otherwise.",
      "History is filled with examples of individuals who achieved greatness not despite their limitations, but because of them. These stories remind us that human potential is not defined by our circumstances but by our response to them.",
      "Chapter 2: The Growth Mindset\n\nA growth mindset is the belief that abilities and intelligence can be developed through dedication and hard work. This perspective transforms limitations from permanent barriers into temporary challenges that can be overcome.",
      "Developing a growth mindset requires practice and patience. It involves reframing failure as a learning opportunity and viewing challenges as chances to grow rather than threats to avoid.",
    ],
  },
  {
    id: "4",
    title: "Seeing the World Without Eyes",
    author: "Poppy Oleh",
    isbn: "978-602-1234-04-2",
    conversionStatus: "processing",
    pages: 22,
    assignedTo: ["s2", "s4"],
    content: [
      "Chapter 1: A Different Perspective\n\nThis book tells the remarkable story of individuals who navigate the world without sight. Through their experiences, we learn that vision is just one of many ways to perceive and understand the world around us.",
      "The human brain is remarkably adaptable. When one sense is unavailable, others become enhanced. Many blind individuals develop extraordinary abilities in hearing, touch, and spatial awareness.",
      "Chapter 2: Technology and Accessibility\n\nModern technology has opened up new possibilities for visually impaired individuals. From screen readers to navigation apps, technology is breaking down barriers and creating a more inclusive world.",
      "The development of assistive technologies represents one of the most impactful applications of innovation. These tools not only improve independence but also expand opportunities for education and employment.",
    ],
  },
  {
    id: "5",
    title: "World Without Light",
    author: "Dunya Cahaya",
    isbn: "978-602-1234-05-9",
    conversionStatus: "pending",
    pages: 18,
    assignedTo: ["s2", "s3"],
    content: [
      "Chapter 1: Into the Darkness\n\nWhat would the world be like without light? This thought-provoking book explores the concept of darkness — both literal and metaphorical — and how it shapes our understanding of existence.",
      "Throughout human history, darkness has been both feared and revered. Ancient civilizations built elaborate myths around the cycle of light and darkness, recognizing their fundamental importance to life.",
      "Chapter 2: Finding Light Within\n\nEven in the darkest times, the human spirit has the capacity to find and create light. This chapter explores stories of resilience and hope from people who have faced extreme adversity.",
    ],
  },
];

export const sampleHistory: ReadingHistory[] = [
  { id: "h1", bookId: "1", title: "Building Educational Strategies", lastPage: 3, totalPages: 5, timestamp: "10 minutes ago" },
  { id: "h2", bookId: "2", title: "The Art of Speaking", lastPage: 2, totalPages: 5, timestamp: "2 hours ago" },
  { id: "h3", bookId: "3", title: "The Miracle of Limitations", lastPage: 1, totalPages: 4, timestamp: "1 day ago" },
];

export const voiceHints: Record<string, NaturalVoiceHint[]> = {
  roleSelect: [
    { example: "Saya seorang siswa", intent: "Open student login" },
    { example: "I'm an administrator", intent: "Open institution login" },
    { example: "Buka login admin", intent: "Open institution login" },
  ],
  institutionLogin: [
    { example: "Masuk ke akun saya", intent: "Sign in" },
    { example: "Sign me in", intent: "Sign in" },
    { example: "Kembali ke awal", intent: "Go back" },
  ],
  institutionDashboard: [
    { example: "Upload buku baru", intent: "Open upload form" },
    { example: "I want to assign books", intent: "Open assignments" },
    { example: "Lihat semua buku", intent: "Open book catalog" },
    { example: "Keluar dari akun", intent: "Log out" },
  ],
  institutionBooks: [
    { example: "Tambah buku baru", intent: "Upload new book" },
    { example: "Go back to dashboard", intent: "Return to dashboard" },
  ],
  institutionUpload: [
    { example: "Upload bukunya", intent: "Submit the book" },
    { example: "Kembali", intent: "Go back" },
  ],
  institutionAssign: [
    { example: "Assign buku ini ke Andi", intent: "Assign a book" },
    { example: "Give this book to Siti", intent: "Assign a book" },
    { example: "Kembali ke dashboard", intent: "Return to dashboard" },
  ],
  studentLogin: [
    { example: "Masuk", intent: "Sign in" },
    { example: "Let me in", intent: "Sign in" },
    { example: "Kembali", intent: "Go back" },
  ],
  studentHome: [
    { example: "Bacakan buku The Art of Speaking", intent: "Open a specific book" },
    { example: "Lanjutkan membaca", intent: "Continue last book" },
    { example: "Buka perpustakaan saya", intent: "Open library" },
    { example: "Buka pengaturan", intent: "Open settings" },
  ],
  studentLibrary: [
    { example: "Baca buku yang pertama", intent: "Open a book" },
    { example: "Read The Miracle of Limitations", intent: "Open a specific book" },
    { example: "Kembali ke beranda", intent: "Go back to home" },
  ],
  reader: [
    { example: "Halaman selanjutnya", intent: "Go to next page" },
    { example: "Go back one page", intent: "Previous page" },
    { example: "Mundur 10 detik", intent: "Rewind narration" },
    { example: "Skip ahead", intent: "Forward narration" },
    { example: "Berhenti dulu", intent: "Pause narration" },
    { example: "Lanjutkan", intent: "Resume narration" },
    { example: "Tolong ringkasin halaman ini", intent: "AI summarize" },
    { example: "Kembali ke perpustakaan", intent: "Go back to library" },
  ],
  studentGuide: [
    { example: "Kembali ke beranda", intent: "Go back to home" },
    { example: "Bacakan buku", intent: "Start reading a book" },
  ],
  studentSettings: [
    { example: "Kembali", intent: "Go back to home" },
    { example: "Ganti suara ke Budi", intent: "Change voice" },
  ],
};
