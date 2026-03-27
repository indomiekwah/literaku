import { Platform } from "react-native";
import type { Book } from "@/constants/data";

const API_BASE = Platform.OS === "web"
  ? "/api"
  : `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface ApiBookMetadata {
  id: string;
  title: string;
  author: string;
  genres: string[];
  category: string;
  synopsis: string;
  coverColor: string;
  language: string;
  totalPages: number;
  uploadedAt: string;
  pdfBlobName: string;
}

interface ApiPagesResponse {
  bookId: string;
  totalPages: number;
  pages: string[];
}

interface ApiSinglePageResponse {
  bookId: string;
  page: number;
  totalPages: number;
  content: string;
}

export async function fetchBooksFromApi(): Promise<Book[]> {
  const resp = await fetch(`${API_BASE}/books`, {
    headers: { "Accept": "application/json" },
  });
  if (!resp.ok) throw new Error(`Failed to fetch books: ${resp.status}`);
  const data = await resp.json();
  const apiBooks: ApiBookMetadata[] = data.books || [];
  return apiBooks.map(apiBookToBook);
}

export async function fetchBookPages(bookId: string): Promise<string[]> {
  const resp = await fetch(`${API_BASE}/books/${bookId}/pages`, {
    headers: { "Accept": "application/json" },
  });
  if (!resp.ok) throw new Error(`Failed to fetch pages: ${resp.status}`);
  const data: ApiPagesResponse = await resp.json();
  return data.pages;
}

export async function fetchBookPage(bookId: string, page: number): Promise<string> {
  const resp = await fetch(`${API_BASE}/books/${bookId}/pages?page=${page}`, {
    headers: { "Accept": "application/json" },
  });
  if (!resp.ok) throw new Error(`Failed to fetch page: ${resp.status}`);
  const data: ApiSinglePageResponse = await resp.json();
  return data.content;
}

function apiBookToBook(api: ApiBookMetadata): Book {
  return {
    id: api.id,
    title: api.title,
    author: api.author,
    genres: api.genres,
    category: api.category,
    synopsis: api.synopsis,
    coverColor: api.coverColor,
    content: [],
    summary: "",
    pageSummaries: [],
  };
}
