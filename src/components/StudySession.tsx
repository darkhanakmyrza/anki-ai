"use client";

import { useState } from "react";
import { Card } from "@/types/card";
import FlashCard from "./FlashCard";
import Link from "next/link";

interface StudySessionProps {
  initialCards: Card[];
}

export default function StudySession({ initialCards }: StudySessionProps) {
  const [queue, setQueue] = useState<Card[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finishedCardsCount, setFinishedCardsCount] = useState(0);

  const totalCards = queue.length;
  const currentCard = queue[currentIndex];

  const handleRating = async (quality: number) => {
    if (isSubmitting || !currentCard) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/cards/${currentCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality }),
      });

      if (!res.ok) {
        throw new Error("Failed to update spaced repetition data.");
      }

      const updatedCard: Card = await res.json();

      // If the quality was "Again" (quality < 3), the SM-2 algorithm requires reviewing it again.
      // We push the card to the end of the queue so they review it in the same session.
      if (quality < 3) {
        setQueue((prevQueue) => {
          const nextQueue = [...prevQueue];
          // Create a duplicate of the card with the updated stats for subsequent review
          nextQueue.push(updatedCard);
          return nextQueue;
        });
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Otherwise, the card is finished for today
        setFinishedCardsCount((prev) => prev + 1);
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating review quality:", error);
      alert("An error occurred while saving your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if session is complete
  if (currentIndex >= queue.length) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-12 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/55 dark:border-slate-800 rounded-3xl shadow-xl space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Session Completed!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            You reviewed <strong className="text-indigo-500 dark:text-indigo-400">{finishedCardsCount}</strong> words. Excellent job!
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition duration-200 text-sm"
          >
            Go to Deck List
          </Link>
        </div>
      </div>
    );
  }

  // Calculate percentage progress
  const progressPercent = Math.min(
    100,
    Math.round((finishedCardsCount / totalCards) * 100)
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Review session</span>
          <span>
            {finishedCardsCount} / {totalCards} cards completed
          </span>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Flipping Flashcard */}
      <FlashCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
      />

      {/* Interactive Action Buttons */}
      <div className="min-h-[96px] flex flex-col items-center justify-center">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl shadow-lg transition duration-200 text-sm uppercase tracking-wider animate-bounce"
          >
            Show Answer
          </button>
        ) : (
          <div className="w-full grid grid-cols-4 gap-2 animate-fade-in-up">
            <button
              onClick={() => handleRating(0)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center p-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:active:bg-rose-500/30 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-500/30 rounded-2xl transition duration-150 disabled:opacity-50"
            >
              <span className="font-extrabold text-sm md:text-base">Again</span>
              <span className="text-[10px] opacity-75 mt-0.5">Incorrect</span>
            </button>

            <button
              onClick={() => handleRating(2)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center p-3 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:active:bg-amber-500/30 text-amber-600 dark:text-amber-450 border border-amber-200 dark:border-amber-500/30 rounded-2xl transition duration-150 disabled:opacity-50"
            >
              <span className="font-extrabold text-sm md:text-base">Hard</span>
              <span className="text-[10px] opacity-75 mt-0.5">Struggled</span>
            </button>

            <button
              onClick={() => handleRating(4)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:active:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl transition duration-150 disabled:opacity-50"
            >
              <span className="font-extrabold text-sm md:text-base">Good</span>
              <span className="text-[10px] opacity-75 mt-0.5">Hesitated</span>
            </button>

            <button
              onClick={() => handleRating(5)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:active:bg-emerald-500/30 text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl transition duration-150 disabled:opacity-50"
            >
              <span className="font-extrabold text-sm md:text-base">Easy</span>
              <span className="text-[10px] opacity-75 mt-0.5">Instant</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
