export interface Article {
  id: string;
  title: string;
  source: string;
  year: number;
  snippet: string;
  citations: number;
  relatedArticles: number;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  content: string[];
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  type: "article" | "book";
}

export const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Covid 19 — navigating the uncharted",
    source: "AS Fauci, HC Lane, RR Redfield - 2020 - Mass Medical Soc",
    year: 2020,
    snippet:
      "On a February, the International Virus Taxonomy Committee designated the virus as SARS-CoV-2, and the WHO designated the disease as COVID-19. The emergence of this novel virus has placed the global community on high alert.",
    citations: 863,
    relatedArticles: 18,
    content:
      "This study aims to examine the impact of COVID-19 on global health systems and the response measures taken by various countries. The rapid spread of the virus has highlighted the need for coordinated international efforts in pandemic preparedness and response.\n\nThe novel coronavirus (SARS-CoV-2) was first identified in Wuhan, China, in December 2019. Since then, it has spread to virtually every country in the world, causing unprecedented disruption to healthcare systems, economies, and daily life.\n\nKey findings indicate that early intervention measures, including social distancing, mask-wearing, and vaccination campaigns, have been crucial in reducing transmission rates. The development of multiple effective vaccines within a year of the virus's identification represents a remarkable achievement in medical science.\n\nHowever, challenges remain in ensuring equitable vaccine distribution globally, addressing vaccine hesitancy, and preparing for potential future variants. The pandemic has also exposed significant disparities in healthcare access and outcomes across different populations.",
  },
  {
    id: "2",
    title: "The COVID-19 epidemic",
    source:
      "TT Zhnag, OI Mwan - Tropical medicine & international health, 2020 - ncbi.nlm.nih.gov",
    year: 2020,
    snippet:
      "The current outbreak of the novel coronavirus SARS-CoV 2 and its associated disease COVID-19 has been declared a Public Health Emergency of International Concern and represents a threat to global health security.",
    citations: 1148,
    relatedArticles: 99,
    content:
      "The COVID-19 pandemic has fundamentally changed the landscape of global public health. This paper examines the epidemiological characteristics of the novel coronavirus and its impact on healthcare systems worldwide.\n\nOur analysis reveals that the virus spreads primarily through respiratory droplets and aerosols, with an incubation period of 2-14 days. The case fatality rate varies significantly by age group and underlying health conditions.\n\nThe study emphasizes the importance of robust surveillance systems, rapid diagnostic capabilities, and coordinated public health responses in managing pandemic threats.",
  },
  {
    id: "3",
    title: "COVID-19: immunopathology and its implications for therapy",
    source: "X Cao - Nature reviews Immunology, 2020 - nature.com",
    year: 2020,
    snippet:
      "Severe coronavirus disease 2019 (COVID-19) is characterized by pneumonia, lymphopenia, exhausted lymphocytes and a cytokine storm. Understanding the immunopathology is key to developing effective treatments.",
    citations: 892,
    relatedArticles: 45,
    content:
      "This review examines the immunological mechanisms underlying COVID-19 pathogenesis and discusses potential therapeutic approaches. The immune response to SARS-CoV-2 involves both innate and adaptive immunity, with severe cases often characterized by hyperinflammation.\n\nThe cytokine storm observed in severe COVID-19 patients involves elevated levels of IL-6, IL-1β, and TNF-α, which contribute to tissue damage and organ failure. Understanding these mechanisms is crucial for developing targeted therapies.\n\nSeveral therapeutic approaches have shown promise, including monoclonal antibodies, convalescent plasma therapy, and immunomodulatory drugs. However, further research is needed to optimize treatment protocols.",
  },
];

export const sampleBooks: Book[] = [
  {
    id: "1",
    title: "Building Educational Strategies",
    author: "Prof. Dr. Achmad Sanusi",
    pages: 30,
    content: [
      "Chapter 1: Foundations of Education\n\nEducation is the cornerstone of human civilization. Throughout history, societies have recognized the transformative power of learning and knowledge acquisition. This chapter explores the fundamental principles that underpin effective educational systems.\n\nThe purpose of education extends far beyond the mere transmission of facts and figures. At its core, education aims to develop critical thinking skills, foster creativity, and prepare individuals for active participation in society.",
      "The development of educational theory has been shaped by numerous philosophers and thinkers. From Plato's Academy to modern constructivist approaches, each era has contributed unique insights into how people learn and how teaching can be optimized.\n\nKey principles include:\n- Student-centered learning\n- Active engagement with material\n- Collaborative knowledge construction\n- Continuous assessment and feedback",
      "Chapter 2: Strategic Planning in Education\n\nStrategic planning is essential for educational institutions seeking to achieve their goals effectively. This process involves setting clear objectives, identifying resources, and developing action plans that align with the institution's mission.\n\nEffective strategic planning requires input from all stakeholders, including teachers, administrators, students, and community members. A collaborative approach ensures that diverse perspectives are considered.",
      "The implementation of educational strategies requires careful consideration of local context, available resources, and the specific needs of the student population. No single approach works universally.\n\nSuccessful educational institutions continuously evaluate and adapt their strategies based on outcomes data and emerging research findings.",
      "Chapter 3: Assessment and Evaluation\n\nAssessment plays a crucial role in the educational process. It provides valuable feedback to both teachers and students, helping to identify areas of strength and areas needing improvement.\n\nModern assessment approaches emphasize formative assessment, which is integrated into the learning process rather than being limited to end-of-unit tests.",
    ],
  },
  {
    id: "2",
    title: "The Art of Speaking",
    author: "Oh Su Hyang",
    pages: 25,
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
    pages: 20,
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
    pages: 22,
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
    pages: 18,
    content: [
      "Chapter 1: Into the Darkness\n\nWhat would the world be like without light? This thought-provoking book explores the concept of darkness — both literal and metaphorical — and how it shapes our understanding of existence.",
      "Throughout human history, darkness has been both feared and revered. Ancient civilizations built elaborate myths around the cycle of light and darkness, recognizing their fundamental importance to life.",
      "Chapter 2: Finding Light Within\n\nEven in the darkest times, the human spirit has the capacity to find and create light. This chapter explores stories of resilience and hope from people who have faced extreme adversity.",
    ],
  },
];

export const sampleHistory: HistoryItem[] = [
  { id: "a1", title: "The Covid-19 Epidemic", timestamp: "1 minute ago", type: "article" },
  { id: "b2", title: "Reading Window House...", timestamp: "40 minutes ago", type: "article" },
  { id: "b1", title: "Building Educational S...", timestamp: "1 hour ago", type: "book" },
  { id: "a3", title: "Strategy for Improvin...", timestamp: "5 hours ago", type: "article" },
  { id: "a2", title: "Speech Recognition Te...", timestamp: "6 hours ago", type: "article" },
  { id: "b3", title: "Computer Utilization", timestamp: "1 day ago", type: "article" },
];

export const guideCommands = [
  { command: "Search (keyword)", description: "to search the Internet." },
  { command: "Continue last reading", description: "to resume reading history." },
  { command: "Open Collection", description: "to find readings in the available collection." },
  { command: "How to use Literaku", description: "to learn about available features." },
  { command: "Open Help", description: "to see available commands." },
];
