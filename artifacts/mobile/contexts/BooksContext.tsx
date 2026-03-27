import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { Book } from "@/constants/data";
import { sampleBooks } from "@/constants/data";
import { fetchBooksFromApi, fetchBookPages } from "@/services/books";

interface BooksContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  refreshBooks: () => Promise<void>;
  getBookById: (id: string) => Book | undefined;
  getBookContent: (bookId: string) => Promise<string[]>;
  findBookByTitle: (query: string) => Book | undefined;
}

const BooksContext = createContext<BooksContextType | null>(null);

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const contentCache = new Map<string, string[]>();

function cleanForSearch(str: string): string {
  return str.replace(/[.,!?'";\-:\s()]/g, "").toLowerCase();
}

export function BooksProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(sampleBooks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBooks = await fetchBooksFromApi();
      if (apiBooks.length > 0) {
        const merged = mergeBooks(sampleBooks, apiBooks);
        setBooks(merged);
      } else {
        setBooks(sampleBooks);
      }
    } catch (err: any) {
      console.warn("Failed to fetch books from API, using local data:", err.message);
      setError(err.message);
      setBooks(sampleBooks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBooks();
    intervalRef.current = setInterval(refreshBooks, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshBooks]);

  const getBookById = useCallback(
    (id: string) => books.find((b) => b.id === id),
    [books]
  );

  const getBookContent = useCallback(async (bookId: string): Promise<string[]> => {
    const cached = contentCache.get(bookId);
    if (cached) return cached;

    const local = books.find((b) => b.id === bookId);
    if (local && local.content.length > 0) {
      return local.content;
    }

    try {
      const pages = await fetchBookPages(bookId);
      contentCache.set(bookId, pages);
      return pages;
    } catch (err: any) {
      console.warn("Failed to fetch book content:", err.message);
      return local?.content || ["Content not available."];
    }
  }, [books]);

  const findBookByTitle = useCallback(
    (query: string): Book | undefined => {
      const cleaned = cleanForSearch(query);
      const exact = books.find((b) => cleanForSearch(b.title) === cleaned);
      if (exact) return exact;
      return books.find((b) => cleanForSearch(b.title).includes(cleaned) || cleaned.includes(cleanForSearch(b.title)));
    },
    [books]
  );

  return (
    <BooksContext.Provider
      value={{ books, loading, error, refreshBooks, getBookById, getBookContent, findBookByTitle }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks(): BooksContextType {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error("useBooks must be used within a BooksProvider");
  return ctx;
}

function mergeBooks(local: Book[], api: Book[]): Book[] {
  const apiMap = new Map(api.map((b) => [b.id, b]));
  const localMap = new Map(local.map((b) => [b.id, b]));

  const merged: Book[] = [];

  for (const book of local) {
    merged.push(book);
  }

  for (const book of api) {
    if (!localMap.has(book.id)) {
      merged.push(book);
    }
  }

  return merged;
}
