export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const questions: Question[] = [
  {
    id: 1,
    question:
      "Widget utama yang digunakan sebagai titik awal aplikasi Flutter adalah...",
    options: ["Container", "MaterialApp", "Scaffold", "Text"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question:
      "Bahasa pemrograman yang digunakan untuk membangun aplikasi Flutter adalah...",
    options: ["Java", "Kotlin", "Dart", "Swift"],
    correctAnswer: 2,
  },
  {
    id: 3,
    question:
      "Widget yang digunakan untuk menampilkan teks di Flutter adalah...",
    options: ["Label", "TextField", "Text", "String"],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "Fungsi setState() digunakan untuk...",
    options: [
      "Mengubah widget",
      "Menutup aplikasi",
      "Memperbarui tampilan ketika data berubah",
      "Membuka aplikasi",
    ],
    correctAnswer: 2,
  },
  {
    id: 5,
    question:
      "Perintah yang digunakan untuk menjalankan aplikasi Flutter adalah...",
    options: ["flutter create", "flutter build", "flutter run", "flutter start"],
    correctAnswer: 2,
  },
];
