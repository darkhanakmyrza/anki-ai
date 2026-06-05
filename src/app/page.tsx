"use client";

import { useEffect, useState } from "react";
import { Card } from "@/types/card";
import AddWordForm from "@/components/AddWordForm";
import CardList from "@/components/CardList";
import Link from "next/link";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Server-side stats and pagination states
  const [stats, setStats] = useState({ total: 0, due: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState("all");

  const loadStats = async () => {
    try {
      const res = await fetch("/api/cards/stats");
      if (!res.ok) throw new Error("Failed to fetch stats.");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const loadCards = async (currentPage: number, search: string, filter: string, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        search: search.trim(),
        partOfSpeech: filter,
      });
      const res = await fetch(`/api/cards?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch cards.");
      const data = await res.json();
      
      if (append) {
        setCards((prev) => [...prev, ...data.cards]);
      } else {
        setCards(data.cards);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 1. Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // 2. Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 3. Fetch cards when debounced search or filter changes
  useEffect(() => {
    setPage(1);
    loadCards(1, searchQuery, partOfSpeechFilter, false);
  }, [searchQuery, partOfSpeechFilter]);

  const handleCardAddedOrUpdated = () => {
    loadStats();
    setPage(1);
    loadCards(1, searchQuery, partOfSpeechFilter, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCards(nextPage, searchQuery, partOfSpeechFilter, true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-50/50 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950/80 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-600/30">
              A
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                anki-ai
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI-powered vocabulary spaced repetition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stats.due > 0 ? (
              <Link
                href="/study"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 text-sm flex items-center gap-2"
              >
                <span>Study Now</span>
                <span className="h-5 w-5 bg-white/20 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1">
                  {stats.due}
                </span>
              </Link>
            ) : (
              <Link
                href="/study"
                className="px-6 py-3 bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-white dark:text-slate-200 font-semibold rounded-xl text-sm transition"
              >
                Study Deck
              </Link>
            )}
          </div>
        </header>

        {/* Dashboard Statistics (Phase 3 feature) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Total Words</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Due Today</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.due}</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Word Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6">
              <AddWordForm onCardAdded={handleCardAddedOrUpdated} />
            </div>
          </div>

          {/* Card List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="h-5 w-5 bg-indigo-500/10 text-indigo-500 rounded flex items-center justify-center">
                📚
              </span>
              Your Deck
            </h2>

            {isLoading && cards.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 text-sm font-medium">Loading your cards...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-450 text-sm font-medium">
                {error}
              </div>
            ) : (
              <CardList
                cards={cards}
                onCardUpdated={handleCardAddedOrUpdated}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                partOfSpeechFilter={partOfSpeechFilter}
                setPartOfSpeechFilter={setPartOfSpeechFilter}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
