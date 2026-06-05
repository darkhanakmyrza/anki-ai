"use client";

import { useState } from "react";
import { Card } from "@/types/card";

interface CardListProps {
  cards: Card[];
  onCardUpdated: () => void;
  searchInput: string;
  setSearchInput: (val: string) => void;
  partOfSpeechFilter: string;
  setPartOfSpeechFilter: (val: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}

export default function CardList({
  cards,
  onCardUpdated,
  searchInput,
  setSearchInput,
  partOfSpeechFilter,
  setPartOfSpeechFilter,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: CardListProps) {
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editWord, setEditWord] = useState("");
  const [editTranslation, setEditTranslation] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editPronunciation, setEditPronunciation] = useState("");
  const [editPartOfSpeech, setEditPartOfSpeech] = useState("");
  const [editExamples, setEditExamples] = useState("");
  const [editSynonyms, setEditSynonyms] = useState("");
  const [editAntonyms, setEditAntonyms] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtered cards are handled entirely on the server side
  const filteredCards = cards;

  // Standard static parts of speech supported in the dictionary lookups
  const partsOfSpeech = ["all", "noun", "verb", "adjective", "adverb", "phrase"];

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete card");
      }

      onCardUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete card");
    }
  };

  const startEdit = (card: Card) => {
    setEditingCard(card);
    setEditWord(card.word);
    setEditTranslation(card.translation);
    setEditDefinition(card.definition);
    setEditPronunciation(card.pronunciation);
    setEditPartOfSpeech(card.partOfSpeech);
    setEditExamples(Array.isArray(card.examples) ? card.examples.join("\n") : "");
    setEditSynonyms(Array.isArray(card.synonyms) ? card.synonyms.join(", ") : "");
    setEditAntonyms(Array.isArray(card.antonyms) ? card.antonyms.join(", ") : "");
    setError(null);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setIsSaving(true);
    setError(null);

    // Process lists
    const parsedExamples = editExamples
      .split("\n")
      .map((ex) => ex.trim())
      .filter((ex) => ex.length > 0);
    const parsedSynonyms = editSynonyms
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const parsedAntonyms = editAntonyms
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    try {
      const res = await fetch(`/api/cards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: editWord,
          translation: editTranslation,
          definition: editDefinition,
          pronunciation: editPronunciation,
          partOfSpeech: editPartOfSpeech,
          examples: parsedExamples,
          synonyms: parsedSynonyms,
          antonyms: parsedAntonyms,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update card");
      }

      setEditingCard(null);
      onCardUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update card");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter bar (Phase 3 feature) */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/80">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-250 dark:border-slate-850 bg-white/60 dark:bg-slate-950/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          />
        </div>
        
        <select
          value={partOfSpeechFilter}
          onChange={(e) => setPartOfSpeechFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-250 dark:border-slate-850 bg-white/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition capitalize"
        >
          {partsOfSpeech.map((pos) => (
            <option key={pos} value={pos}>
              {pos === "all" ? "All Parts of Speech" : pos}
            </option>
          ))}
        </select>
      </div>

      {/* Cards list grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No cards found.</p>
          {searchInput || partOfSpeechFilter !== "all" ? (
            <button
              onClick={() => {
                setSearchInput("");
                setPartOfSpeechFilter("all");
              }}
              className="mt-3 text-sm text-indigo-500 hover:text-indigo-400 font-medium"
            >
              Clear filters
            </button>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try generating a new word to populate your deck!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg relative group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:border-slate-300/80 dark:hover:border-slate-700/80"
            >
              {/* Top Bar with metadata and Action buttons */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {card.word}
                  </h3>
                  <p className="text-sm text-indigo-500 font-mono mt-0.5">
                    {card.pronunciation} • <span className="italic">{card.partOfSpeech}</span>
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => startEdit(card)}
                    className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Edit Card"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Delete Card"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Translation & Definition */}
              <div className="space-y-1.5 mb-4">
                <p className="text-xl font-bold text-indigo-650 dark:text-indigo-400 tracking-tight">
                  {card.translation}
                </p>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.definition}
                </p>
              </div>

              {/* Examples */}
              {Array.isArray(card.examples) && card.examples.length > 0 && (
                <div className="mb-4 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850">
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-500 dark:text-slate-400 italic">
                    {card.examples.slice(0, 2).map((ex, idx) => (
                      <li key={idx}>&ldquo;{ex}&rdquo;</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Spaced Repetition Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    card.repetitions === 0
                      ? "bg-amber-400 animate-pulse"
                      : card.interval > 30
                      ? "bg-emerald-400"
                      : "bg-indigo-400"
                  }`} />
                  Interval: <strong className="text-slate-600 dark:text-slate-400">{card.interval}d</strong>
                </span>
                <span>Repetitions: <strong className="text-slate-600 dark:text-slate-400">{card.repetitions}</strong></span>
                <span>EF: <strong className="text-slate-600 dark:text-slate-400">{card.easeFactor.toFixed(1)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 shadow-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingMore && (
              <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoadingMore ? "Loading..." : "Load More Words"}
          </button>
        </div>
      )}

      {/* Edit Modal (Phase 3 feature) */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Edit Card: <span className="capitalize">{editingCard.word}</span>
              </h3>
              <button
                onClick={() => setEditingCard(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-lg p-1.5 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Word</label>
                  <input
                    type="text"
                    value={editWord}
                    onChange={(e) => setEditWord(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Pronunciation</label>
                  <input
                    type="text"
                    value={editPronunciation}
                    onChange={(e) => setEditPronunciation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Translation</label>
                  <input
                    type="text"
                    value={editTranslation}
                    onChange={(e) => setEditTranslation(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Part Of Speech</label>
                  <input
                    type="text"
                    value={editPartOfSpeech}
                    onChange={(e) => setEditPartOfSpeech(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Definition</label>
                <textarea
                  value={editDefinition}
                  onChange={(e) => setEditDefinition(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Examples (One per line)</label>
                <textarea
                  value={editExamples}
                  onChange={(e) => setEditExamples(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter example sentences, one per line..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Synonyms (Comma separated)</label>
                <textarea
                  value={editSynonyms}
                  onChange={(e) => setEditSynonyms(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="fleeting, transient, ephemeral..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Antonyms (Comma separated)</label>
                <textarea
                  value={editAntonyms}
                  onChange={(e) => setEditAntonyms(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="permanent, eternal..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
