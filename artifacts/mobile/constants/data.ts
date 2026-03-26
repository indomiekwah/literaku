export interface InstitutionInfo {
  code: string;
  name: string;
  type: string;
  location: string;
  admin: string;
  studentCount: number;
  tier: string;
}

export const validInstitutions: InstitutionInfo[] = [
  { code: "SMAN5-JKT", name: "SMAN 5 Jakarta", type: "Senior High School", location: "Jakarta, Indonesia", admin: "Ibu Sari Rahayu", studentCount: 320, tier: "Standard" },
  { code: "SMPN3-BDG", name: "SMPN 3 Bandung", type: "Junior High School", location: "Bandung, Indonesia", admin: "Pak Budi Santoso", studentCount: 280, tier: "Standard" },
  { code: "UGM-YK", name: "Universitas Gadjah Mada", type: "University", location: "Yogyakarta, Indonesia", admin: "Dr. Andi Wijaya", studentCount: 1500, tier: "Premium" },
  { code: "SLB-A-BDG", name: "SLB-A Wyata Guna Bandung", type: "Special Needs School", location: "Bandung, Indonesia", admin: "Ibu Maya Putri", studentCount: 85, tier: "Premium" },
  { code: "BLINDF-SG", name: "Singapore Blind Foundation", type: "Foundation", location: "Singapore", admin: "Mr. James Lee", studentCount: 200, tier: "Enterprise" },
];

export function findInstitutionByCode(code: string): InstitutionInfo | undefined {
  const cleaned = code.replace(/[.,!?'";\-:\s()]/g, "").toUpperCase();
  return validInstitutions.find((inst) => inst.code.replace(/[\-\s]/g, "").toUpperCase() === cleaned);
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  category: string;
  synopsis: string;
  coverColor: string;
  content: string[];
  summary: string;
  pageSummaries: string[];
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
    genres: ["Psychological", "Thriller", "Mystery"],
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
    summary: "The Silent Patient tells the story of Alicia Berenson, a famous painter who shoots her husband Gabriel five times and then never speaks again. She is committed to a secure psychiatric facility called the Grove. Theo Faber, a criminal psychotherapist obsessed with her case, takes a job at the Grove determined to break her silence. As Theo digs deeper into Alicia's past, he discovers dark secrets about her childhood, her marriage, and the events leading to that fatal night. The twist reveals that Theo himself is deeply entangled in Alicia's story — he had been stalking her, and his obsession drove the very tragedy he sought to understand. Alicia's silence was not madness but a response to discovering the horrifying truth about the man who claimed to want to help her.",
    pageSummaries: [
      "Alicia Berenson, a famous 33-year-old painter, murders her husband Gabriel by shooting him five times. She makes no attempt to flee and waits for arrest.",
      "After the murder, Alicia refuses to speak a single word to anyone — police, lawyers, or doctors. The media dubs her 'the Silent Patient' and the case becomes a sensation.",
      "Theo Faber, a criminal psychotherapist with over ten years of experience, becomes obsessed with Alicia's case and the mystery behind her silence.",
      "Theo believes he can unlock the reason Alicia killed her husband if he can get her to talk. He applies for a position at the Grove, the psychiatric facility where she is held.",
      "Theo arrives at the Grove, a secure forensic hospital in North London, on his first day — filled with both excitement and apprehension about finally meeting Alicia.",
    ],
  },
  {
    id: "2",
    title: "Penance",
    author: "Miroku Kumar",
    genres: ["Psychological", "Drama", "Fiction"],
    category: "Fiction",
    synopsis: "Emirs mother refused to accept the life of poverty she was condemned to. In a small village, surrounded by corruption, she chose to fight. Four girls watched everything unfold. They were only children, but they understood more than anyone believed. Even though they had tried to forget, the past would not release them.\n\nEmils mother refused to accept the burden her family carried, a burden that stretched back generations. Find the perpetrator. Find what they took. These became the words that defined her existence, and eventually, the existence of those four girls.",
    coverColor: "#B71C1C",
    content: [
      "Chapter 1: The Beginning\n\nThe village was small, the kind of place where everyone knew everyone else's business. The houses were modest, built from weathered wood and corrugated iron. Rain collected in puddles along the unpaved roads.",
      "In one of these modest houses lived a woman who refused to accept her fate. She had four daughters, each born with the same fierce determination that burned in their mother's eyes.\n\nThe girls grew up hearing stories of injustice.",
      "Chapter 2: The Promise\n\nYears passed. The girls grew into young women, each carrying the weight of their mother's burden. They had made a promise — to find the truth, no matter the cost.\n\nThe search began in earnest on a cold morning in October.",
      "They split up, each taking a different path. One went to the city, one stayed in the village, one traveled abroad, and one went underground. Together, they would piece together the puzzle that had haunted their family.",
    ],
    summary: "Penance follows a mother in a poverty-stricken village who refuses to accept the injustice her family has endured for generations. She raises four daughters with fierce determination, teaching them to fight for truth. As the girls grow into women, they each take on a different path — city, village, abroad, and underground — to uncover a crime that was committed against their family long ago. Their search leads them through corruption, betrayal, and sacrifice. Ultimately, the four sisters piece together the truth and confront the perpetrator, but the cost of their penance is devastating, forcing them to choose between justice and the family bonds that held them together.",
    pageSummaries: [
      "A small impoverished village is introduced. A determined mother lives in a modest house, refusing to accept the poverty and injustice around her.",
      "The mother raises four daughters who inherit her fierce determination. They grow up hearing stories of the injustice done to their family.",
      "Years later, the four daughters make a solemn promise to find the truth about their family's past. Their search begins on a cold October morning.",
      "The sisters split up — one to the city, one stays in the village, one goes abroad, one goes underground — to piece together the puzzle haunting their family.",
    ],
  },
  {
    id: "3",
    title: "Confessions",
    author: "Miroku Kumar",
    genres: ["Psychological", "Mystery", "Thriller"],
    category: "Mystery",
    synopsis: "A gripping psychological mystery that delves into the darkest corners of human guilt and redemption. When a teacher discovers a horrifying truth about the death of her daughter, she decides to take justice into her own hands. But justice, she learns, is never as simple as it seems.\n\nEach chapter reveals a new perspective, a new confession, and a new layer of the truth that will leave you questioning everything you thought you knew.",
    coverColor: "#4A148C",
    content: [
      "Chapter 1: The Announcement\n\nThe classroom was silent. Thirty-seven pairs of eyes stared at the teacher standing before them. She had an announcement to make — one that would change everything.\n\n'Before we part ways for spring break,' she began, her voice steady, 'I have something to tell you.'",
      "She paused, letting the weight of the moment settle. The students shifted in their seats, some curious, some bored. None of them suspected what was coming.\n\n'My daughter did not die by accident,' she said.",
      "Chapter 2: The Truth\n\nThe words hung in the air like smoke. The students looked at each other, confused. Their teacher's daughter had drowned in the school swimming pool months ago. It was ruled an accident.\n\nBut now, standing before them, she told a different story.",
      "She told them about the evidence she had found. About the security camera footage that had been conveniently erased. About the witnesses who suddenly couldn't remember anything. And about the two students she believed were responsible.",
    ],
    summary: "Confessions is a psychological mystery about a schoolteacher who announces to her class that her daughter's drowning was not an accident but murder. She reveals that two students were responsible and that evidence — including security footage — was deliberately destroyed. Each chapter shifts perspective, with different characters confessing their roles in the cover-up. The teacher orchestrates her own form of justice, manipulating events so the guilty students face consequences the legal system failed to deliver. The story explores guilt, revenge, and whether true justice can exist outside the law, culminating in a devastating revelation about how far a grieving mother will go.",
    pageSummaries: [
      "A teacher stands before her class to make a shocking announcement before spring break. Thirty-seven students listen as she prepares to reveal something devastating.",
      "The teacher declares that her daughter did not die by accident in the school swimming pool. The students are stunned.",
      "She reveals it was not an accident — the drowning was deliberate. Security camera footage was erased and witnesses claimed to remember nothing.",
      "The teacher names the evidence that was covered up and identifies two students she believes murdered her daughter.",
    ],
  },
  {
    id: "4",
    title: "The Shorts Caller",
    author: "Dhiah Barhad",
    genres: ["Sci-Fi", "Mystery", "Suspense"],
    category: "Fiction",
    synopsis: "A mysterious figure known only as the Shorts Caller appears in different cities, always at moments of crisis. No one knows their identity or their purpose. All that is known is that when the Shorts Caller appears, everything changes.\n\nThis mind-bending sci-fi novel explores the nature of time, identity, and the connections that bind us across dimensions.",
    coverColor: "#006064",
    content: [
      "Chapter 1: The First Call\n\nThe phone rang at exactly 3:47 AM. Detective Sarah Chen reached for it in the darkness, her hand finding the device by muscle memory.\n\n'This is the Shorts Caller,' said a voice she didn't recognize. 'Listen carefully. You have exactly forty-seven minutes.'",
      "Sarah sat up in bed, immediately alert. She had heard of the Shorts Caller — everyone in the department had. But no one had ever spoken to them directly.\n\n'Forty-seven minutes until what?' she asked, but the line had already gone dead.",
      "Chapter 2: The Pattern\n\nSarah pulled up every case file connected to the Shorts Caller. There were seventeen in total, spanning three continents and five years. In each case, someone received a call with a countdown.\n\nAnd in each case, something extraordinary happened when the countdown reached zero.",
    ],
    summary: "The Shorts Caller is a sci-fi mystery about a mysterious figure who contacts people at moments of crisis, giving them cryptic countdowns. Detective Sarah Chen receives one such call at 3:47 AM — forty-seven minutes. She investigates seventeen connected cases spanning three continents and five years, discovering that each countdown leads to an extraordinary event. As Sarah uncovers the pattern, she learns the Shorts Caller operates across dimensions of time, choosing pivotal moments where a single decision can alter reality. The story explores whether fate can be changed and the cost of knowing the future, building to a climax where Sarah must decide what happens when her own countdown reaches zero.",
    pageSummaries: [
      "Detective Sarah Chen receives a mysterious phone call at 3:47 AM from someone calling themselves the Shorts Caller, who gives her a countdown of forty-seven minutes.",
      "Sarah realizes she has been contacted by a legendary figure no one in her department has ever spoken to directly. The caller hangs up before explaining the countdown.",
      "Sarah reviews seventeen case files linked to the Shorts Caller, spanning three continents and five years. Every case involved a countdown — and something extraordinary at the end.",
    ],
  },
  {
    id: "5",
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    genres: ["Drama", "Inspirational", "Coming-of-Age"],
    category: "Indonesian Literature",
    synopsis: "Kisah inspiratif tentang sepuluh anak dari keluarga miskin di Belitung yang berjuang mendapatkan pendidikan. Dipimpin oleh dua guru yang luar biasa berdedikasi, mereka membuktikan bahwa semangat belajar tidak bisa dihalangi oleh kemiskinan.\n\nNovel ini menjadi salah satu karya sastra Indonesia yang paling dicintai, menginspirasi jutaan pembaca di seluruh dunia.",
    coverColor: "#E65100",
    content: [
      "Bab 1: Sepuluh Murid Baru\n\nPagi itu, hanya sepuluh orang anak yang datang ke sekolah Muhammadiyah. Pak Harfan dan Bu Mus sudah menunggu dengan cemas — jika murid baru tidak mencapai sepuluh orang, sekolah akan ditutup.\n\nNamun takdir berkata lain. Tepat saat harapan hampir pupus, seorang anak lelaki berlari masuk.",
      "Anak itu bernama Harun. Dengan kedatangannya, genaplah sepuluh murid yang diperlukan. Bu Mus menghela napas lega. Sekolah mereka selamat — untuk saat ini.\n\nMereka menyebut diri mereka Laskar Pelangi.",
      "Bab 2: Lintang\n\nDi antara sepuluh murid itu, ada seorang anak bernama Lintang. Ia tinggal paling jauh dari sekolah — empat puluh kilometer jauhnya. Setiap hari ia bersepeda melewati hutan dan sungai.\n\nNamun Lintang adalah murid paling cerdas yang pernah dimiliki sekolah itu.",
    ],
    summary: "Laskar Pelangi menceritakan kisah sepuluh anak miskin di Belitung yang berjuang mempertahankan sekolah Muhammadiyah mereka. Dipimpin oleh Bu Mus dan Pak Harfan, mereka membuktikan bahwa kemiskinan tidak bisa menghalangi semangat belajar. Lintang, murid paling cerdas, bersepeda 40 km setiap hari melewati hutan dan sungai. Mahar si seniman, Ikal si pemimpi, dan teman-teman lainnya menghadapi tantangan dari perusahaan timah yang ingin menutup sekolah mereka. Meski fasilitas seadanya, mereka berhasil memenangkan lomba dan membuktikan kemampuan mereka. Novel ini mengajarkan bahwa pendidikan adalah hak semua orang dan semangat bisa mengalahkan segala keterbatasan.",
    pageSummaries: [
      "Pagi pertama sekolah Muhammadiyah — hanya sepuluh murid yang datang. Pak Harfan dan Bu Mus menunggu cemas karena jika kurang dari sepuluh, sekolah akan ditutup. Harun datang tepat waktu sebagai murid kesepuluh.",
      "Harun melengkapi sepuluh murid yang dibutuhkan. Bu Mus lega, sekolah selamat. Mereka menamai diri mereka Laskar Pelangi.",
      "Lintang diperkenalkan sebagai murid yang tinggal paling jauh — 40 km dari sekolah. Ia bersepeda setiap hari melewati hutan dan sungai, namun menjadi murid paling cerdas di sekolah.",
    ],
  },
  {
    id: "6",
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    genres: ["Historical", "Romance", "Political"],
    category: "Indonesian Literature",
    synopsis: "Set in the Dutch colonial era of Indonesia, this masterpiece tells the story of Minke, a young Javanese student who navigates love, politics, and identity. Through his eyes, we witness the awakening of a nation and the price of fighting for justice in an unjust world.",
    coverColor: "#33691E",
    content: [
      "Bab 1: Sebuah Pertemuan\n\nNamaku Minke. Aku adalah seorang murid di H.B.S. — satu-satunya sekolah menengah Belanda di Surabaya. Aku adalah satu dari sedikit pribumi yang beruntung bisa mengenyam pendidikan Eropa.",
      "Pada suatu sore yang panas, aku diajak temanku Robert Suurhof mengunjungi sebuah rumah besar di pinggir kota. Di sanalah aku pertama kali bertemu dengan Annelies Mellema — gadis Indo yang akan mengubah hidupku selamanya.",
      "Bab 2: Nyai Ontosoroh\n\nIbu Annelies, yang dipanggil Nyai Ontosoroh, adalah wanita yang luar biasa. Meskipun seorang gundik, ia mengelola seluruh bisnis keluarga Mellema dengan kecerdasan yang mengagumkan.",
    ],
    summary: "Bumi Manusia mengisahkan Minke, seorang pemuda Jawa yang menjadi salah satu dari sedikit pribumi yang bersekolah di H.B.S. Belanda di Surabaya pada era kolonial. Ia jatuh cinta pada Annelies Mellema, gadis Indo yang cantik. Melalui hubungannya dengan keluarga Mellema, Minke mengenal Nyai Ontosoroh — ibu Annelies yang meski berstatus gundik, mengelola bisnis keluarga dengan kecerdasan luar biasa. Novel ini menggambarkan kebangkitan kesadaran nasional Indonesia, perjuangan melawan ketidakadilan kolonial, dan harga yang harus dibayar untuk memperjuangkan martabat di dunia yang tidak adil. Minke akhirnya kehilangan Annelies karena hukum kolonial, namun pengalaman itu mengubahnya menjadi pejuang keadilan.",
    pageSummaries: [
      "Minke memperkenalkan dirinya sebagai murid H.B.S. — satu-satunya sekolah menengah Belanda di Surabaya. Ia adalah salah satu dari sedikit pribumi yang beruntung mendapat pendidikan Eropa.",
      "Minke diajak temannya Robert Suurhof mengunjungi rumah besar di pinggir kota. Di sana ia pertama kali bertemu Annelies Mellema, gadis Indo yang akan mengubah hidupnya.",
      "Nyai Ontosoroh, ibu Annelies, diperkenalkan sebagai wanita luar biasa. Meski berstatus gundik, ia mengelola seluruh bisnis keluarga Mellema dengan kecerdasan mengagumkan.",
    ],
  },
  {
    id: "7",
    title: "Ronggeng Dukuh Paruk",
    author: "Ahmad Tohari",
    genres: ["Drama", "Cultural", "Historical"],
    category: "Indonesian Literature",
    synopsis: "Kisah Srintil, seorang gadis desa yang menjadi ronggeng — penari tradisional Jawa — di dusun terpencil Paruk. Novel trilogi ini menggambarkan kehidupan desa, tradisi, cinta, dan tragedi politik 1965 yang menghancurkan segalanya.\n\nKarya sastra Indonesia yang paling kuat menggambarkan nasib rakyat kecil dalam pusaran sejarah.",
    coverColor: "#5D4037",
    content: [
      "Bab 1: Dukuh Paruk\n\nDukuh Paruk adalah sebuah pedukuhan kecil yang terpencil. Penduduknya hidup sederhana, bergantung pada apa yang bisa ditanam di tanah kering mereka. Namun Dukuh Paruk terkenal karena satu hal: ronggengnya.",
      "Srintil masih kecil ketika kedua orangtuanya meninggal karena tempe bongkrek beracun. Ia diasuh oleh kakeknya, Sakarya. Sejak kecil, dalam dirinya sudah terlihat bakat menari yang luar biasa.",
      "Bab 2: Menjadi Ronggeng\n\nKetika Srintil berusia sebelas tahun, ia mulai menari di halaman rumah kakeknya. Gerakan tubuhnya begitu indah sehingga membuat seluruh dukuh terpesona. Para tetua desa sepakat: Srintil harus menjadi ronggeng.",
    ],
    summary: "Ronggeng Dukuh Paruk mengisahkan Srintil, gadis yatim piatu dari dusun terpencil Paruk yang menjadi ronggeng — penari tradisional Jawa. Setelah kedua orangtuanya meninggal karena tempe bongkrek beracun, ia diasuh kakeknya Sakarya. Bakat menarinya yang luar biasa membuat tetua desa menjadikannya ronggeng pada usia sebelas tahun. Trilogi ini menggambarkan kehidupan desa, tradisi, dan cinta antara Srintil dan Rasus. Namun tragedi politik 1965 menghancurkan segalanya — Dukuh Paruk dihancurkan, penduduknya ditahan, dan Srintil menjadi korban kekerasan. Novel ini adalah potret kuat tentang nasib rakyat kecil yang tergilas roda sejarah.",
    pageSummaries: [
      "Dukuh Paruk diperkenalkan sebagai pedukuhan kecil terpencil dengan penduduk sederhana. Dukuh ini terkenal karena tradisi ronggengnya.",
      "Srintil kehilangan kedua orangtuanya karena tempe bongkrek beracun saat masih kecil. Ia diasuh kakeknya Sakarya dan sudah menunjukkan bakat menari sejak kecil.",
      "Pada usia sebelas tahun, Srintil mulai menari di halaman kakeknya dengan gerakan yang begitu indah hingga mempesona seluruh dukuh. Tetua desa sepakat menjadikannya ronggeng.",
    ],
  },
  {
    id: "8",
    title: "Cantik Itu Luka",
    author: "Eka Kurniawan",
    genres: ["Magical Realism", "Historical", "Epic"],
    category: "Indonesian Literature",
    synopsis: "Dewi Ayu, seorang pelacur cantik di kota Halimunda, bangkit dari kuburnya setelah dua puluh satu tahun. Novel epik ini menelusuri sejarah Indonesia dari era kolonial hingga reformasi melalui empat generasi keluarganya.\n\nDipuji oleh The New York Times dan diterjemahkan ke 30 bahasa, novel ini adalah mahakarya realisme magis Indonesia.",
    coverColor: "#880E4F",
    content: [
      "Bab 1: Kebangkitan\n\nPada suatu sore di akhir bulan Maret, Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun meninggal. Ia berjalan pulang ke rumahnya dengan gaun putih yang sudah lapuk dimakan waktu.",
      "Penduduk Halimunda yang melihatnya berjalan di jalan raya nyaris tak percaya. Mereka yang mengenalnya dulu ingat betul: Dewi Ayu adalah perempuan paling cantik yang pernah dilahirkan kota ini.",
      "Bab 2: Halimunda\n\nKota Halimunda terletak di pesisir selatan Jawa. Didirikan oleh Belanda sebagai kota perdagangan, Halimunda tumbuh menjadi kota yang penuh kontradiksi — indah namun menyimpan kekerasan, kaya namun dikelilingi kemiskinan.",
    ],
    summary: "Cantik Itu Luka adalah novel epik realisme magis yang dimulai dengan kebangkitan Dewi Ayu dari kuburnya setelah 21 tahun meninggal. Ia adalah pelacur paling cantik di kota Halimunda, pesisir selatan Jawa. Novel ini menelusuri empat generasi keluarganya dari era kolonial Belanda, pendudukan Jepang, kemerdekaan, hingga reformasi. Dewi Ayu memiliki empat anak perempuan — tiga sangat cantik, satu sangat buruk rupa. Melalui kisah mereka, Eka Kurniawan menggambarkan sejarah Indonesia yang penuh kekerasan, cinta, dan ironi. Novel ini dipuji The New York Times dan diterjemahkan ke 30 bahasa sebagai mahakarya sastra Indonesia kontemporer.",
    pageSummaries: [
      "Dewi Ayu bangkit dari kuburnya setelah 21 tahun meninggal pada suatu sore di akhir Maret. Ia berjalan pulang dengan gaun putih yang sudah lapuk.",
      "Penduduk Halimunda terkejut melihat Dewi Ayu berjalan di jalan raya. Mereka mengingat bahwa ia adalah perempuan paling cantik yang pernah dilahirkan kota ini.",
      "Kota Halimunda diperkenalkan — terletak di pesisir selatan Jawa, didirikan Belanda sebagai kota perdagangan, penuh kontradiksi antara keindahan dan kekerasan.",
    ],
  },
  {
    id: "9",
    title: "Negeri 5 Menara",
    author: "Ahmad Fuadi",
    genres: ["Drama", "Inspirational", "Religious"],
    category: "Indonesian Literature",
    synopsis: "Novel inspiratif tentang enam santri dari berbagai daerah di Indonesia yang bermimpi besar di sebuah pesantren di Jawa Timur. Dengan mantra 'man jadda wajada' — siapa yang bersungguh-sungguh pasti berhasil — mereka menempa diri menuju cita-cita.\n\nDiangkat dari kisah nyata penulis, novel ini menjadi best-seller dan menginspirasi jutaan pembaca muda Indonesia.",
    coverColor: "#1565C0",
    content: [
      "Bab 1: Keberangkatan\n\nAmak tidak pernah berhenti menangis sejak keputusan itu dibuat. Aku, Alif Fikri, anak bungsu dari keluarga Minangkabau, harus pergi ke pesantren di Jawa. Jauh dari kampung halaman.",
      "Perjalanan dari Maninjau ke Ponorogo memakan waktu dua hari. Aku duduk di bus dengan perasaan campur aduk — takut, penasaran, dan sedikit bersemangat. Di depanku menanti kehidupan yang sama sekali baru.",
      "Bab 2: Pondok Madani\n\nPondok Madani berdiri megah di tengah sawah hijau. Bangunannya sederhana namun tertata rapi. Di sinilah ribuan santri dari seluruh Indonesia belajar ilmu agama dan ilmu dunia secara bersamaan.",
    ],
    summary: "Negeri 5 Menara mengisahkan Alif Fikri, anak bungsu Minangkabau yang dikirim ke pesantren Pondok Madani di Jawa Timur. Bersama lima sahabatnya dari berbagai daerah Indonesia, mereka membentuk kelompok Sahibul Menara. Dengan mantra 'man jadda wajada' — siapa bersungguh-sungguh pasti berhasil — mereka menempa diri melalui pendidikan agama dan ilmu pengetahuan. Meski awalnya berat meninggalkan kampung halaman, Alif menemukan persahabatan sejati dan mimpi-mimpi besar. Keenam sahabat ini akhirnya meraih cita-cita mereka di berbagai negara — London, Washington, Kairo, dan kota-kota besar dunia. Novel ini diangkat dari kisah nyata penulis dan menginspirasi jutaan pembaca muda Indonesia.",
    pageSummaries: [
      "Amak (ibu Alif) menangis karena keputusan mengirim Alif ke pesantren di Jawa. Alif Fikri, anak bungsu Minangkabau, harus meninggalkan kampung halamannya.",
      "Perjalanan dari Maninjau ke Ponorogo memakan waktu dua hari. Alif duduk di bus dengan perasaan campur aduk — takut, penasaran, dan sedikit bersemangat.",
      "Pondok Madani diperkenalkan — berdiri megah di tengah sawah hijau dengan bangunan sederhana namun rapi. Ribuan santri dari seluruh Indonesia belajar di sini.",
    ],
  },
  {
    id: "10",
    title: "Supernova: Ksatria, Puteri, dan Bintang Jatuh",
    author: "Dewi Lestari",
    genres: ["Philosophical Fiction", "Sci-Fi", "Romance"],
    category: "Indonesian Literature",
    synopsis: "Dua sahabat — Dimas dan Reuben — menulis sebuah novel tentang Ksatria dan Puteri yang hidup dalam dunia yang berbeda. Sementara itu, seorang ilmuwan wanita bernama Bodhi mencari jawaban atas misteri alam semesta.\n\nNovel ini memadukan sains, spiritualitas, dan cinta dalam sebuah kisah yang menantang cara berpikir konvensional.",
    coverColor: "#311B92",
    content: [
      "Bab 1: Prolog\n\nDimas dan Reuben duduk di sebuah kafe kecil di Jakarta. Di antara mereka tergeletak tumpukan kertas — naskah novel yang telah mereka kerjakan selama berbulan-bulan. Mereka menyebutnya Supernova.",
      "Reuben mengangkat cangkir kopinya. 'Kita perlu seorang Ksatria,' katanya. 'Seseorang yang berani menantang semua aturan.' Dimas mengangguk. 'Dan seorang Puteri. Yang tidak butuh diselamatkan.'",
      "Bab 2: Bodhi\n\nDi sebuah laboratorium di Bandung, seorang wanita muda bernama Bodhi Arya sedang mengamati data. Ia adalah fisikawan teoretis — salah satu dari sedikit perempuan Indonesia di bidangnya.",
    ],
    summary: "Supernova mengisahkan Dimas dan Reuben, dua sahabat di Jakarta yang menulis novel tentang Ksatria dan Puteri — dua karakter yang hidup di dunia berbeda namun terhubung secara misterius. Sementara itu, Bodhi Arya, fisikawan teoretis wanita muda di Bandung, meneliti misteri alam semesta. Ketiga cerita ini terjalin: fiksi yang ditulis Dimas dan Reuben mulai mencerminkan kenyataan, dan Bodhi menemukan bahwa sains dan spiritualitas tidak bertentangan melainkan saling melengkapi. Novel ini memadukan fisika kuantum, filsafat, dan cinta dalam narasi yang menantang cara berpikir konvensional tentang realitas, kesadaran, dan koneksi antarmanusia.",
    pageSummaries: [
      "Dimas dan Reuben duduk di kafe kecil di Jakarta dengan tumpukan naskah novel yang telah mereka kerjakan berbulan-bulan. Mereka menyebutnya Supernova.",
      "Reuben mengusulkan tokoh Ksatria — seseorang yang berani menantang semua aturan. Dimas menambahkan Puteri — yang tidak butuh diselamatkan.",
      "Bodhi Arya, fisikawan teoretis muda di laboratorium Bandung, sedang mengamati data. Ia adalah salah satu dari sedikit perempuan Indonesia di bidangnya.",
    ],
  },
  {
    id: "11",
    title: "Ayat-Ayat Cinta",
    author: "Habiburrahman El Shirazy",
    genres: ["Romance", "Religious", "Drama"],
    category: "Indonesian Literature",
    synopsis: "Fahri, mahasiswa Indonesia di Universitas Al-Azhar, Kairo, hidup sederhana dan tekun belajar. Hidupnya berubah ketika ia bertemu empat wanita yang masing-masing memiliki perasaan terhadapnya.\n\nNovel ini menjadi fenomena sastra Indonesia dengan penjualan jutaan eksemplar dan diadaptasi ke film laris.",
    coverColor: "#004D40",
    content: [
      "Bab 1: Flat Zaitun\n\nFlat Zaitun terletak di lantai empat sebuah gedung tua di kawasan Hadayek Helwan, pinggiran Kairo. Di sinilah aku, Fahri, tinggal bersama tiga teman satu flat dari Indonesia.",
      "Pagi itu, seperti biasa, aku bangun sebelum subuh. Udara Kairo masih dingin. Aku berwudhu, shalat, lalu membuka mushaf Al-Quran. Setiap hari aku membaca tiga juz — target yang kupasang untuk menyelesaikan hafalan.",
      "Bab 2: Maria\n\nMaria Girgis adalah tetangga kami di lantai bawah. Ia seorang gadis Kristen Koptik yang cantik dan ramah. Setiap kali berpapasan di tangga, ia selalu menyapa dengan senyum.",
    ],
    summary: "Ayat-Ayat Cinta mengisahkan Fahri, mahasiswa Indonesia sederhana dan tekun di Universitas Al-Azhar, Kairo. Hidupnya berubah ketika empat wanita dari latar belakang berbeda memiliki perasaan terhadapnya: Aisha gadis Turki-Jerman, Maria tetangga Kristen Koptik, Nurul teman sesama Indonesia, dan Noura gadis Mesir yang ditindas ayahnya. Fahri menikahi Aisha namun difitnah atas tuduhan memerkosa Noura. Di penjara, Fahri berjuang membuktikan kebenaran sambil kesehatannya memburuk. Maria, yang diam-diam mencintai Fahri, memberikan kesaksian kunci yang membebaskannya. Novel ini mengeksplorasi cinta, iman, toleransi antaragama, dan keadilan, menjadi fenomena sastra Indonesia dengan penjualan jutaan eksemplar.",
    pageSummaries: [
      "Fahri tinggal di Flat Zaitun lantai empat di kawasan Hadayek Helwan, pinggiran Kairo, bersama tiga teman satu flat dari Indonesia.",
      "Fahri menjalani rutinitas — bangun sebelum subuh, shalat, dan membaca Al-Quran. Target hariannya tiga juz untuk menyelesaikan hafalan.",
      "Maria Girgis, tetangga Kristen Koptik di lantai bawah, diperkenalkan sebagai gadis cantik dan ramah yang selalu menyapa Fahri dengan senyum.",
    ],
  },
  {
    id: "12",
    title: "Perahu Kertas",
    author: "Dee Lestari",
    genres: ["Romance", "Coming-of-Age", "Drama"],
    category: "Indonesian Literature",
    synopsis: "Kugy, gadis nyentrik yang bermimpi menjadi penulis dongeng, dan Keenan, pelukis berbakat yang dipaksa kuliah ekonomi. Keduanya bertemu di Bandung dan memulai persahabatan yang perlahan berubah menjadi cinta.\n\nNovel dua jilid ini menggambarkan perjalanan menemukan passion dan cinta sejati dengan gaya bercerita yang hangat dan menyentuh.",
    coverColor: "#F57F17",
    content: [
      "Bab 1: Kugy\n\nNamaku Kugy. Lengkapnya Kugy Utami, tapi jangan panggil aku dengan nama lengkap karena aku tidak suka. Aku suka menulis dongeng. Dongeng tentang Jenderal Pilik dan pasukannya.",
      "Hari ini adalah hari pertamaku di Bandung. Aku pindah dari Jakarta untuk kuliah di sebuah universitas yang katanya bagus. Tapi yang paling membuatku senang adalah: Bandung punya banyak sudut yang bisa menginspirasi dongeng.",
      "Bab 2: Keenan\n\nKeenan duduk di depan kanvas kosong. Kuasnya tergenggam erat, tapi tangannya tidak bergerak. Sudah tiga jam ia duduk di situ, menunggu inspirasi yang tak kunjung datang.",
    ],
    summary: "Perahu Kertas mengisahkan Kugy, gadis nyentrik pemimpi yang ingin menjadi penulis dongeng, dan Keenan, pelukis berbakat yang dipaksa keluarganya kuliah ekonomi. Mereka bertemu di Bandung dan memulai persahabatan yang perlahan berubah menjadi cinta, namun keduanya terikat hubungan dengan orang lain. Kugy menemukan panggilannya sebagai penulis dongeng anak-anak, sementara Keenan akhirnya berani mengikuti hasratnya melukis. Novel dua jilid ini menggambarkan perjalanan menemukan passion dan cinta sejati — bahwa kadang kita harus tersesat dulu untuk menemukan jalan yang benar. Akhirnya Kugy dan Keenan menemukan bahwa cinta mereka tak pernah pudar meski sempat terpisah oleh kesalahpahaman dan rasa takut.",
    pageSummaries: [
      "Kugy memperkenalkan dirinya — nama lengkapnya Kugy Utami, penulis dongeng tentang Jenderal Pilik. Hari ini hari pertamanya di Bandung untuk kuliah.",
      "Kugy senang pindah ke Bandung karena kota ini punya banyak sudut yang bisa menginspirasi dongeng-dongengnya.",
      "Keenan duduk di depan kanvas kosong selama tiga jam, menunggu inspirasi yang tak kunjung datang. Kuasnya tergenggam erat tapi tangannya tidak bergerak.",
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

export const purchasedBookIds: string[] = [];

export const assignedBookIds: string[] = [];

export const voiceHints: Record<string, NaturalVoiceHint[]> = {
  login: [
    { example: "Sign in with Google", intent: "Sign in with Google" },
    { example: "Sign in with Microsoft", intent: "Sign in with Microsoft" },
  ],
  studentHome: [
    { example: "Open explorer", intent: "Open book explorer" },
    { example: "Open collection", intent: "Open my collection" },
    { example: "Open history", intent: "Open reading history" },
    { example: "Open institution", intent: "Open institution page" },
    { example: "Open settings", intent: "Open settings" },
    { example: "Open guide", intent: "Open voice guide" },
    { example: "Subscribe", intent: "Open subscription" },
    { example: "Read Penance", intent: "Open a book directly" },
  ],
  penjelajah: [
    { example: "Search cantik", intent: "Search for books" },
    { example: "Psychological books", intent: "Hear titles in a category" },
    { example: "Read Penance", intent: "Open book details" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  bookDetail: [
    { example: "Preview", intent: "Hear chapter 1 preview" },
    { example: "Synopsis", intent: "Hear the synopsis" },
    { example: "Read now", intent: "Read the full book" },
    { example: "Go back", intent: "Go back" },
  ],
  koleksi: [
    { example: "Paid books", intent: "Hear purchased books" },
    { example: "Assigned books", intent: "Hear institution books" },
    { example: "Read Penance", intent: "Open a book" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  riwayat: [
    { example: "Recent books", intent: "Hear recently read" },
    { example: "Bookmarked books", intent: "Hear bookmarks" },
    { example: "Read Penance", intent: "Open a book" },
    { example: "Go back to home", intent: "Go back to home" },
  ],
  institusi: [
    { example: "Join SMAN5-JKT", intent: "Join with institution code" },
    { example: "Request SMPN3-BDG", intent: "Request to join an institution" },
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
    { example: "About Literaku", intent: "Hear about the app" },
    { example: "Voice commands", intent: "How voice works" },
    { example: "Voice mode", intent: "Modes explained" },
    { example: "TalkBack", intent: "Screen reader help" },
  ],
  studentSettings: [
    { example: "Narrator", intent: "List narrator options" },
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
