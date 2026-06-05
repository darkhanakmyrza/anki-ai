"use client";

import { Card } from "@/types/card";

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div
      onClick={onFlip}
      className="w-full max-w-2xl h-[460px] cursor-pointer perspective-1000 group mx-auto"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 dark:from-slate-900 dark:to-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-indigo-500/25 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full capitalize">
              {card.partOfSpeech}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider">
              Anki AI Card
            </span>
          </div>

          <div className="text-center py-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight capitalize select-none mb-2 bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              {card.word}
            </h2>
            {card.pronunciation && (
              <p className="text-indigo-300 font-mono text-sm md:text-base">
                {card.pronunciation}
              </p>
            )}
          </div>

          <div className="text-center text-xs text-indigo-400/80 font-medium tracking-wide animate-pulse">
            Click card to reveal translation
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
          {/* Card header */}
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 capitalize">
                {card.word}
              </h3>
              <p className="text-sm text-indigo-500 font-mono mt-1">
                {card.pronunciation} • <span className="italic">{card.partOfSpeech}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full capitalize">
              {card.partOfSpeech}
            </span>
          </div>

          {/* Core Card content */}
          <div className="flex-1 py-5 space-y-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Translation</span>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight">
                {card.translation}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Definition</span>
              <p className="text-slate-700 dark:text-slate-350 text-base leading-relaxed">
                {card.definition}
              </p>
            </div>

            {Array.isArray(card.examples) && card.examples.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Examples</span>
                <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-500 dark:text-slate-400 italic">
                  {card.examples.slice(0, 2).map((ex, idx) => (
                    <li key={idx}>&ldquo;{ex}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Synonyms and Antonyms */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              {Array.isArray(card.synonyms) && card.synonyms.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Synonyms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.synonyms.slice(0, 5).map((syn, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(card.antonyms) && card.antonyms.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Antonyms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.antonyms.slice(0, 5).map((ant, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded">
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5 font-medium">
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  );
}
