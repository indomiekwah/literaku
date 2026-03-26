export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  category: string;
  synopsis: string;
  coverColor: string;
  content: string[];
}

export interface SubscriptionPlanInfo {
  id: string;
  name: string;
  price: string;
  priceId: string;
  features: string[];
}

export const subscriptionPlansInfo: SubscriptionPlanInfo[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceId: "free",
    features: ["Chapter 1 free preview", "Voice commands", "Basic narration"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$7/month",
    priceId: "premium_monthly",
    features: ["Full library access", "Voice narration", "AI summarization", "All voice types", "Priority support"],
  },
];

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastRead: string;
}

export interface BookmarkEntry {
  bookId: string;
  page: number;
  note?: string;
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

export const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Psychological",
    category: "Thriller",
    synopsis: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face. And then she never speaks another word.\n\nAlicia's refusal to talk, or offer any defense, turns the trial into a media circus. She is found guilty and committed to a secure forensic unit in North London where she remains, silent.\n\nTheo Faber is a criminal psychotherapist who has waited a long time for the opportunity to work with Alicia. His determination to get her to talk and unravel the mystery of why she shot her husband takes him down a path more unexpected than he ever imagined.",
    coverColor: "#1A237E",
    content: [
      "Chapter 1: The Silent Patient\n\nAlicia Berenson was thirty-three years old when she killed her husband. She shot Gabriel in the face five times. She then made no attempt to escape. She waited for the police to arrive.\n\nThe murder was shocking — not just because of the brutality of the act, but because Alicia Berenson was famous. She was a painter, known for her work in figurative art.",
      "She was also known for her silence. She didn't speak a single word after the murder. Not to the police, not to her lawyers, not to anyone. Her refusal to speak transformed the trial into a media frenzy.\n\nThe tabloids called her the Silent Patient. And this is where our story truly begins.",
      "Chapter 2: Theo Faber\n\nMy name is Theo Faber. I'm a criminal psychotherapist. I've worked in forensic institutions for over ten years. I've seen all kinds of patients — murderers, arsonists, violent offenders.\n\nBut Alicia Berenson's case has fascinated me from the start. The mystery of her silence consumed me.",
      "I wanted to understand why she stopped speaking. What drove her to kill the man she supposedly loved? I believed that if I could reach her, if I could get her to open up, I might find the answer.\n\nI applied for a position at the Grove — the secure forensic unit where Alicia was being held.",
      "Chapter 3: The Grove\n\nThe Grove was a secure forensic psychiatric hospital in North London. It housed a mix of patients — some dangerous, some simply lost. Alicia was in the latter category, or so I believed.\n\nOn my first day, I walked through the heavy security doors with a mixture of excitement and apprehension.",
    ],
  },
  {
    id: "2",
    title: "Penance",
    author: "Miroku Kumar",
    genre: "Psychological",
    category: "Fiction",
    synopsis: "Emirs mother refused to accept the life of poverty she was condemned to. In a small village, surrounded by corruption, she chose to fight. Four girls watched everything unfold. They were only children, but they understood more than anyone believed. Even though they had tried to forget, the past would not release them.\n\nEmils mother refused to accept the burden her family carried, a burden that stretched back generations. Find the perpetrator. Find what they took. These became the words that defined her existence, and eventually, the existence of those four girls.",
    coverColor: "#B71C1C",
    content: [
      "Chapter 1: The Beginning\n\nThe village was small, the kind of place where everyone knew everyone else's business. The houses were modest, built from weathered wood and corrugated iron. Rain collected in puddles along the unpaved roads.",
      "In one of these modest houses lived a woman who refused to accept her fate. She had four daughters, each born with the same fierce determination that burned in their mother's eyes.\n\nThe girls grew up hearing stories of injustice.",
      "Chapter 2: The Promise\n\nYears passed. The girls grew into young women, each carrying the weight of their mother's burden. They had made a promise — to find the truth, no matter the cost.\n\nThe search began in earnest on a cold morning in October.",
      "They split up, each taking a different path. One went to the city, one stayed in the village, one traveled abroad, and one went underground. Together, they would piece together the puzzle that had haunted their family.",
    ],
  },
  {
    id: "3",
    title: "Confessions",
    author: "Miroku Kumar",
    genre: "Psychological",
    category: "Mystery",
    synopsis: "A gripping psychological mystery that delves into the darkest corners of human guilt and redemption. When a teacher discovers a horrifying truth about the death of her daughter, she decides to take justice into her own hands. But justice, she learns, is never as simple as it seems.\n\nEach chapter reveals a new perspective, a new confession, and a new layer of the truth that will leave you questioning everything you thought you knew.",
    coverColor: "#4A148C",
    content: [
      "Chapter 1: The Announcement\n\nThe classroom was silent. Thirty-seven pairs of eyes stared at the teacher standing before them. She had an announcement to make — one that would change everything.\n\n'Before we part ways for spring break,' she began, her voice steady, 'I have something to tell you.'",
      "She paused, letting the weight of the moment settle. The students shifted in their seats, some curious, some bored. None of them suspected what was coming.\n\n'My daughter did not die by accident,' she said.",
      "Chapter 2: The Truth\n\nThe words hung in the air like smoke. The students looked at each other, confused. Their teacher's daughter had drowned in the school swimming pool months ago. It was ruled an accident.\n\nBut now, standing before them, she told a different story.",
      "She told them about the evidence she had found. About the security camera footage that had been conveniently erased. About the witnesses who suddenly couldn't remember anything. And about the two students she believed were responsible.",
    ],
  },
  {
    id: "4",
    title: "The Shorts Caller",
    author: "Dhiah Barhad",
    genre: "Sci-Fi",
    category: "Fiction",
    synopsis: "A mysterious figure known only as the Shorts Caller appears in different cities, always at moments of crisis. No one knows their identity or their purpose. All that is known is that when the Shorts Caller appears, everything changes.\n\nThis mind-bending sci-fi novel explores the nature of time, identity, and the connections that bind us across dimensions.",
    coverColor: "#006064",
    content: [
      "Chapter 1: The First Call\n\nThe phone rang at exactly 3:47 AM. Detective Sarah Chen reached for it in the darkness, her hand finding the device by muscle memory.\n\n'This is the Shorts Caller,' said a voice she didn't recognize. 'Listen carefully. You have exactly forty-seven minutes.'",
      "Sarah sat up in bed, immediately alert. She had heard of the Shorts Caller — everyone in the department had. But no one had ever spoken to them directly.\n\n'Forty-seven minutes until what?' she asked, but the line had already gone dead.",
      "Chapter 2: The Pattern\n\nSarah pulled up every case file connected to the Shorts Caller. There were seventeen in total, spanning three continents and five years. In each case, someone received a call with a countdown.\n\nAnd in each case, something extraordinary happened when the countdown reached zero.",
    ],
  },
  {
    id: "5",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    genre: "Drama",
    category: "Indonesian Literature",
    synopsis: "Kisah inspiratif tentang sepuluh anak dari keluarga miskin di Belitung yang berjuang mendapatkan pendidikan. Dipimpin oleh dua guru yang luar biasa berdedikasi, mereka membuktikan bahwa semangat belajar tidak bisa dihalangi oleh kemiskinan.\n\nNovel ini menjadi salah satu karya sastra Indonesia yang paling dicintai, menginspirasi jutaan pembaca di seluruh dunia.",
    coverColor: "#E65100",
    content: [
      "Bab 1: Sepuluh Murid Baru\n\nPagi itu, hanya sepuluh orang anak yang datang ke sekolah Muhammadiyah. Pak Harfan dan Bu Mus sudah menunggu dengan cemas — jika murid baru tidak mencapai sepuluh orang, sekolah akan ditutup.\n\nNamun takdir berkata lain. Tepat saat harapan hampir pupus, seorang anak lelaki berlari masuk.",
      "Anak itu bernama Harun. Dengan kedatangannya, genaplah sepuluh murid yang diperlukan. Bu Mus menghela napas lega. Sekolah mereka selamat — untuk saat ini.\n\nMereka menyebut diri mereka Laskar Pelangi.",
      "Bab 2: Lintang\n\nDi antara sepuluh murid itu, ada seorang anak bernama Lintang. Ia tinggal paling jauh dari sekolah — empat puluh kilometer jauhnya. Setiap hari ia bersepeda melewati hutan dan sungai.\n\nNamun Lintang adalah murid paling cerdas yang pernah dimiliki sekolah itu.",
    ],
  },
  {
    id: "6",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    genre: "Historical",
    category: "Indonesian Literature",
    synopsis: "Set in the Dutch colonial era of Indonesia, this masterpiece tells the story of Minke, a young Javanese student who navigates love, politics, and identity. Through his eyes, we witness the awakening of a nation and the price of fighting for justice in an unjust world.",
    coverColor: "#33691E",
    content: [
      "Bab 1: Sebuah Pertemuan\n\nNamaku Minke. Aku adalah seorang murid di H.B.S. — satu-satunya sekolah menengah Belanda di Surabaya. Aku adalah satu dari sedikit pribumi yang beruntung bisa mengenyam pendidikan Eropa.",
      "Pada suatu sore yang panas, aku diajak temanku Robert Suurhof mengunjungi sebuah rumah besar di pinggir kota. Di sanalah aku pertama kali bertemu dengan Annelies Mellema — gadis Indo yang akan mengubah hidupku selamanya.",
      "Bab 2: Nyai Ontosoroh\n\nIbu Annelies, yang dipanggil Nyai Ontosoroh, adalah wanita yang luar biasa. Meskipun seorang gundik, ia mengelola seluruh bisnis keluarga Mellema dengan kecerdasan yang mengagumkan.",
    ],
  },
  {
    id: "7",
    title: "Ronggeng Dukuh Paruk",
    author: "Ahmad Tohari",
    genre: "Drama",
    category: "Indonesian Literature",
    synopsis: "Kisah Srintil, seorang gadis desa yang menjadi ronggeng — penari tradisional Jawa — di dusun terpencil Paruk. Novel trilogi ini menggambarkan kehidupan desa, tradisi, cinta, dan tragedi politik 1965 yang menghancurkan segalanya.\n\nKarya sastra Indonesia yang paling kuat menggambarkan nasib rakyat kecil dalam pusaran sejarah.",
    coverColor: "#5D4037",
    content: [
      "Bab 1: Dukuh Paruk\n\nDukuh Paruk adalah sebuah pedukuhan kecil yang terpencil. Penduduknya hidup sederhana, bergantung pada apa yang bisa ditanam di tanah kering mereka. Namun Dukuh Paruk terkenal karena satu hal: ronggengnya.",
      "Srintil masih kecil ketika kedua orangtuanya meninggal karena tempe bongkrek beracun. Ia diasuh oleh kakeknya, Sakarya. Sejak kecil, dalam dirinya sudah terlihat bakat menari yang luar biasa.",
      "Bab 2: Menjadi Ronggeng\n\nKetika Srintil berusia sebelas tahun, ia mulai menari di halaman rumah kakeknya. Gerakan tubuhnya begitu indah sehingga membuat seluruh dukuh terpesona. Para tetua desa sepakat: Srintil harus menjadi ronggeng.",
    ],
  },
  {
    id: "8",
    title: "Cantik Itu Luka",
    author: "Eka Kurniawan",
    genre: "Magical Realism",
    category: "Indonesian Literature",
    synopsis: "Dewi Ayu, seorang pelacur cantik di kota Halimunda, bangkit dari kuburnya setelah dua puluh satu tahun. Novel epik ini menelusuri sejarah Indonesia dari era kolonial hingga reformasi melalui empat generasi keluarganya.\n\nDipuji oleh The New York Times dan diterjemahkan ke 30 bahasa, novel ini adalah mahakarya realisme magis Indonesia.",
    coverColor: "#880E4F",
    content: [
      "Bab 1: Kebangkitan\n\nPada suatu sore di akhir bulan Maret, Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun meninggal. Ia berjalan pulang ke rumahnya dengan gaun putih yang sudah lapuk dimakan waktu.",
      "Penduduk Halimunda yang melihatnya berjalan di jalan raya nyaris tak percaya. Mereka yang mengenalnya dulu ingat betul: Dewi Ayu adalah perempuan paling cantik yang pernah dilahirkan kota ini.",
      "Bab 2: Halimunda\n\nKota Halimunda terletak di pesisir selatan Jawa. Didirikan oleh Belanda sebagai kota perdagangan, Halimunda tumbuh menjadi kota yang penuh kontradiksi — indah namun menyimpan kekerasan, kaya namun dikelilingi kemiskinan.",
    ],
  },
  {
    id: "9",
    title: "Negeri 5 Menara",
    author: "Ahmad Fuadi",
    genre: "Drama",
    category: "Indonesian Literature",
    synopsis: "Novel inspiratif tentang enam santri dari berbagai daerah di Indonesia yang bermimpi besar di sebuah pesantren di Jawa Timur. Dengan mantra 'man jadda wajada' — siapa yang bersungguh-sungguh pasti berhasil — mereka menempa diri menuju cita-cita.\n\nDiangkat dari kisah nyata penulis, novel ini menjadi best-seller dan menginspirasi jutaan pembaca muda Indonesia.",
    coverColor: "#1565C0",
    content: [
      "Bab 1: Keberangkatan\n\nAmak tidak pernah berhenti menangis sejak keputusan itu dibuat. Aku, Alif Fikri, anak bungsu dari keluarga Minangkabau, harus pergi ke pesantren di Jawa. Jauh dari kampung halaman.",
      "Perjalanan dari Maninjau ke Ponorogo memakan waktu dua hari. Aku duduk di bus dengan perasaan campur aduk — takut, penasaran, dan sedikit bersemangat. Di depanku menanti kehidupan yang sama sekali baru.",
      "Bab 2: Pondok Madani\n\nPondok Madani berdiri megah di tengah sawah hijau. Bangunannya sederhana namun tertata rapi. Di sinilah ribuan santri dari seluruh Indonesia belajar ilmu agama dan ilmu dunia secara bersamaan.",
    ],
  },
  {
    id: "10",
    title: "Supernova: Ksatria, Puteri, dan Bintang Jatuh",
    author: "Dewi Lestari",
    genre: "Philosophical Fiction",
    category: "Indonesian Literature",
    synopsis: "Dua sahabat — Dimas dan Reuben — menulis sebuah novel tentang Ksatria dan Puteri yang hidup dalam dunia yang berbeda. Sementara itu, seorang ilmuwan wanita bernama Bodhi mencari jawaban atas misteri alam semesta.\n\nNovel ini memadukan sains, spiritualitas, dan cinta dalam sebuah kisah yang menantang cara berpikir konvensional.",
    coverColor: "#311B92",
    content: [
      "Bab 1: Prolog\n\nDimas dan Reuben duduk di sebuah kafe kecil di Jakarta. Di antara mereka tergeletak tumpukan kertas — naskah novel yang telah mereka kerjakan selama berbulan-bulan. Mereka menyebutnya Supernova.",
      "Reuben mengangkat cangkir kopinya. 'Kita perlu seorang Ksatria,' katanya. 'Seseorang yang berani menantang semua aturan.' Dimas mengangguk. 'Dan seorang Puteri. Yang tidak butuh diselamatkan.'",
      "Bab 2: Bodhi\n\nDi sebuah laboratorium di Bandung, seorang wanita muda bernama Bodhi Arya sedang mengamati data. Ia adalah fisikawan teoretis — salah satu dari sedikit perempuan Indonesia di bidangnya.",
    ],
  },
  {
    id: "11",
    title: "Ayat-Ayat Cinta",
    author: "Habiburrahman El Shirazy",
    genre: "Romance",
    category: "Indonesian Literature",
    synopsis: "Fahri, mahasiswa Indonesia di Universitas Al-Azhar, Kairo, hidup sederhana dan tekun belajar. Hidupnya berubah ketika ia bertemu empat wanita yang masing-masing memiliki perasaan terhadapnya.\n\nNovel ini menjadi fenomena sastra Indonesia dengan penjualan jutaan eksemplar dan diadaptasi ke film laris.",
    coverColor: "#004D40",
    content: [
      "Bab 1: Flat Zaitun\n\nFlat Zaitun terletak di lantai empat sebuah gedung tua di kawasan Hadayek Helwan, pinggiran Kairo. Di sinilah aku, Fahri, tinggal bersama tiga teman satu flat dari Indonesia.",
      "Pagi itu, seperti biasa, aku bangun sebelum subuh. Udara Kairo masih dingin. Aku berwudhu, shalat, lalu membuka mushaf Al-Quran. Setiap hari aku membaca tiga juz — target yang kupasang untuk menyelesaikan hafalan.",
      "Bab 2: Maria\n\nMaria Girgis adalah tetangga kami di lantai bawah. Ia seorang gadis Kristen Koptik yang cantik dan ramah. Setiap kali berpapasan di tangga, ia selalu menyapa dengan senyum.",
    ],
  },
  {
    id: "12",
    title: "Perahu Kertas",
    author: "Dee Lestari",
    genre: "Romance",
    category: "Indonesian Literature",
    synopsis: "Kugy, gadis nyentrik yang bermimpi menjadi penulis dongeng, dan Keenan, pelukis berbakat yang dipaksa kuliah ekonomi. Keduanya bertemu di Bandung dan memulai persahabatan yang perlahan berubah menjadi cinta.\n\nNovel dua jilid ini menggambarkan perjalanan menemukan passion dan cinta sejati dengan gaya bercerita yang hangat dan menyentuh.",
    coverColor: "#F57F17",
    content: [
      "Bab 1: Kugy\n\nNamaku Kugy. Lengkapnya Kugy Utami, tapi jangan panggil aku dengan nama lengkap karena aku tidak suka. Aku suka menulis dongeng. Dongeng tentang Jenderal Pilik dan pasukannya.",
      "Hari ini adalah hari pertamaku di Bandung. Aku pindah dari Jakarta untuk kuliah di sebuah universitas yang katanya bagus. Tapi yang paling membuatku senang adalah: Bandung punya banyak sudut yang bisa menginspirasi dongeng.",
      "Bab 2: Keenan\n\nKeenan duduk di depan kanvas kosong. Kuasnya tergenggam erat, tapi tangannya tidak bergerak. Sudah tiga jam ia duduk di situ, menunggu inspirasi yang tak kunjung datang.",
    ],
  },
];

export const sampleReadingProgress: ReadingProgress[] = [
  { bookId: "2", currentPage: 2, totalPages: 4, lastRead: "10 min ago" },
  { bookId: "3", currentPage: 1, totalPages: 4, lastRead: "2 hours ago" },
  { bookId: "5", currentPage: 3, totalPages: 3, lastRead: "1 day ago" },
  { bookId: "8", currentPage: 2, totalPages: 3, lastRead: "3 days ago" },
  { bookId: "11", currentPage: 1, totalPages: 3, lastRead: "1 week ago" },
];

export const sampleBookmarks: BookmarkEntry[] = [
  { bookId: "1", page: 1, note: "Great opening" },
  { bookId: "3", page: 2 },
  { bookId: "6", page: 1 },
  { bookId: "7", page: 1, note: "Srintil" },
  { bookId: "10", page: 2 },
];

export const sampleHistory: ReadingHistory[] = [
  { id: "h1", bookId: "2", title: "Penance", lastPage: 2, totalPages: 4, timestamp: "10 min ago" },
  { id: "h2", bookId: "3", title: "Confessions", lastPage: 1, totalPages: 4, timestamp: "2 hours ago" },
  { id: "h3", bookId: "5", title: "Laskar Pelangi", lastPage: 3, totalPages: 3, timestamp: "1 day ago" },
  { id: "h4", bookId: "8", title: "Cantik Itu Luka", lastPage: 2, totalPages: 3, timestamp: "3 days ago" },
  { id: "h5", bookId: "11", title: "Ayat-Ayat Cinta", lastPage: 1, totalPages: 3, timestamp: "1 week ago" },
];

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export const voiceHints: Record<string, NaturalVoiceHint[]> = {
  login: [
    { example: "Sign in with Google", intent: "Sign in with Google" },
    { example: "Sign in with Microsoft", intent: "Sign in with Microsoft" },
  ],
  studentHome: [
    { example: "Open explorer", intent: "Open book explorer" },
    { example: "Open collection", intent: "Open my collection" },
    { example: "Open history", intent: "Open reading history" },
    { example: "Open settings", intent: "Open settings" },
    { example: "Open guide", intent: "Open voice guide" },
    { example: "Subscribe", intent: "Open subscription" },
    { example: "Read Penance", intent: "Open a book directly" },
  ],
  penjelajah: [
    { example: "Search The Silent Patient", intent: "Search for a book" },
    { example: "Read Penance", intent: "Open book details" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  bookDetail: [
    { example: "Open preview", intent: "Preview first chapter free" },
    { example: "Read now", intent: "Start reading the book" },
    { example: "Play", intent: "Start reading" },
    { example: "Go back", intent: "Go back" },
  ],
  koleksi: [
    { example: "Read Penance", intent: "Open a specific book" },
    { example: "Read The Silent Patient", intent: "Open a specific book" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  riwayat: [
    { example: "Continue reading", intent: "Continue last book" },
    { example: "Books from school", intent: "View institution books" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  reader: [
    { example: "Play", intent: "Start reading aloud" },
    { example: "Pause", intent: "Pause narration" },
    { example: "Next page", intent: "Go to next page" },
    { example: "Increase speed", intent: "Speed up reading" },
    { example: "Decrease speed", intent: "Slow down reading" },
    { example: "Summarize", intent: "Summarize this page" },
    { example: "Read aloud", intent: "Read summary aloud" },
  ],
  studentGuide: [
    { example: "Go back to home", intent: "Go back to home" },
    { example: "Read a book", intent: "Start reading a book" },
  ],
  studentSettings: [
    { example: "Voice", intent: "List voice options" },
    { example: "Language", intent: "List language options" },
    { example: "Subscribe", intent: "Open subscription" },
    { example: "Log out", intent: "Sign out" },
    { example: "Increase speed", intent: "Speed up" },
    { example: "Decrease speed", intent: "Slow down" },
  ],
  subscription: [
    { example: "Subscribe premium", intent: "Subscribe to premium" },
    { example: "Go back", intent: "Go back" },
  ],
};
