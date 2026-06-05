"use client";

import { useEffect, useState } from "react";
import { Card } from "@/types/card";
import StudySession from "@/components/StudySession";
import Link from "next/link";

export default function StudyPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState({ total: 0, due: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCardsAndStats() {
      try {
        const [cardsRes, statsRes] = await Promise.all([
          fetch("/api/cards?dueOnly=true"),
          fetch("/api/cards/stats"),
        ]);
        
        if (!cardsRes.ok) throw new Error("Failed to fetch cards.");
        if (!statsRes.ok) throw new Error("Failed to fetch stats.");
        
        const [cardsData, statsData] = await Promise.all([
          cardsRes.json(),
          statsRes.json(),
        ]);
        
        setCards(cardsData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cards.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCardsAndStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium">Loading your study session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-100">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 p-6 rounded-2xl max-w-md text-center space-y-4 shadow-lg">
          <p className="font-semibold text-lg">Error loading study session</p>
          <p className="text-sm">{error}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Filter cards where nextReview is less than or equal to now.
  const now = new Date();
  const dueCards = cards.filter((card) => {
    const nextReviewDate = new Date(card.nextReview);
    return nextReviewDate <= now;
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50/50 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950/80 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation header */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Deck list
          </Link>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            Study Mode
          </h1>
        </header>

        {dueCards.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/80 rounded-3xl shadow-xl space-y-5">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-500 mb-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                All Caught Up!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No cards due for review right now.
              </p>
              {stats.total > 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  You have {stats.total} total cards in your deck. Next review items will appear as their intervals expire.
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Your deck is currently empty. Go back and add some words to start learning!
                </p>
              )}
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition"
              >
                Go to Deck List
              </Link>
            </div>
          </div>
        ) : (
          <StudySession initialCards={dueCards} />
        )}
      </div>
    </div>
  );
}
