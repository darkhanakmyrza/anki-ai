"use client";

import { useState } from "react";
import { CardData } from "@/types/card";

interface AddWordFormProps {
  onCardAdded: () => void;
}

export default function AddWordForm({ onCardAdded }: AddWordFormProps) {
  // Modes: AI Auto-fill (default) or Manual Entry
  const [isManualMode, setIsManualMode] = useState(false);
  const [word, setWord] = useState("");
  
  // AI States
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<CardData | null>(null);
  
  // Manual / Edit States
  const [translation, setTranslation] = useState("");
  const [definition, setDefinition] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [pronunciation, setPronunciation] = useState("");
  const [examples, setExamples] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");

  // Shared States
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI mode submit handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate word details");
      }

      const data: CardData = await res.json();
      setPreview(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please check your Gemini API key."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // AI preview save handler
  const handlePreviewSave = async () => {
    if (!preview) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save the card");
      }

      // Success! Clear state and trigger refresh
      setWord("");
      setPreview(null);
      onCardAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the card.");
    } finally {
      setIsSaving(false);
    }
  };

  // Manual entry save handler
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim() || !definition.trim()) {
      setError("Word, translation, and definition are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    // Parse list fields
    const parsedExamples = examples
      .split("\n")
      .map((ex) => ex.trim())
      .filter((ex) => ex.length > 0);
    const parsedSynonyms = synonyms
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const parsedAntonyms = antonyms
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const manualCard: CardData = {
      word: word.trim().toLowerCase(),
      translation: translation.trim(),
      definition: definition.trim(),
      partOfSpeech,
      forms: {}, // Empty forms for manual simple entry
      pronunciation: pronunciation.trim(),
      examples: parsedExamples,
      synonyms: parsedSynonyms,
      antonyms: parsedAntonyms,
    };

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualCard),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save the card");
      }

      // Success! Reset manual states
      setWord("");
      setTranslation("");
      setDefinition("");
      setPartOfSpeech("noun");
      setPronunciation("");
      setExamples("");
      setSynonyms("");
      setAntonyms("");
      
      onCardAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save manual card.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="flex h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
        Add New Word
      </h2>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-4 border border-slate-200/40 dark:border-slate-800/40">
        <button
          type="button"
          disabled={isLoading || isSaving}
          onClick={() => {
            setIsManualMode(false);
            setError(null);
            setPreview(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
            !isManualMode
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
          }`}
        >
          ✨ AI Auto-fill
        </button>
        <button
          type="button"
          disabled={isLoading || isSaving}
          onClick={() => {
            setIsManualMode(true);
            setError(null);
            setPreview(null);
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
            isManualMode
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
          }`}
        >
          ✍️ Manual Entry
        </button>
      </div>

      {/* ERROR FALLBACK */}
      {error && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-450 text-xs font-medium space-y-2">
          <p>{error}</p>
          {!isManualMode && (
            <button
              type="button"
              onClick={() => {
                setIsManualMode(true);
                setError(null);
              }}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold uppercase transition tracking-wider flex items-center gap-1"
            >
              ✍️ Switch to Manual Entry
            </button>
          )}
        </div>
      )}

      {/* AI AUTO-FILL VIEW */}
      {!isManualMode ? (
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter an English word (e.g. ephemeral)..."
            disabled={isLoading || isSaving}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || isSaving || !word.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </form>
      ) : (
        /* MANUAL ENTRY VIEW */
        <form onSubmit={handleManualSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Word</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. ephemeral"
              disabled={isSaving}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Translation</label>
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Russian translation"
                disabled={isSaving}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Part of Speech</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="phrase">Phrase</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pronunciation (IPA)</label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="e.g. /ɪˈfem.ər.əl/"
                disabled={isSaving}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Definition</label>
              <input
                type="text"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="Short English definition"
                disabled={isSaving}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Examples (One per line)</label>
            <textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Enter sentence examples..."
              disabled={isSaving}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Synonyms (Comma-separated)</label>
              <input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="synonym1, synonym2"
                disabled={isSaving}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Antonyms (Comma-separated)</label>
              <input
                type="text"
                value={antonyms}
                onChange={(e) => setAntonyms(e.target.value)}
                placeholder="antonym1, antonym2"
                disabled={isSaving}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-850 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving || !word.trim() || !translation.trim() || !definition.trim()}
            className="w-full py-3 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving Card...
              </>
            ) : (
              "Save Card to DB"
            )}
          </button>
        </form>
      )}

      {/* AI PREVIEW VIEW (AI MODE SAVING) */}
      {preview && !isManualMode && (
        <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-6 animate-fade-in">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Card Preview</div>
          
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight capitalize">
                  {preview.word}
                </h3>
                <p className="text-sm text-indigo-500 dark:text-indigo-400 font-mono mt-0.5">
                  {preview.pronunciation} • <span className="italic">{preview.partOfSpeech}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full capitalize">
                {preview.partOfSpeech}
              </span>
            </div>

            <div className="space-y-1.5">
              <p className="text-slate-700 dark:text-slate-300">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Definition</span>
                {preview.definition}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Translation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{preview.translation}</span>
              </p>
            </div>

            {preview.forms && Object.keys(preview.forms).length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Forms</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(preview.forms).map(([key, val]) => (
                    val && (
                      <span key={key} className="text-xs px-2 py-1 bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                        <strong className="font-medium">{key}:</strong> {val}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {preview.examples && preview.examples.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Examples</span>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {preview.examples.map((ex, idx) => (
                    <li key={idx} className="italic">&ldquo;{ex}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
              {preview.synonyms && preview.synonyms.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Synonyms</span>
                  <div className="flex flex-wrap gap-1">
                    {preview.synonyms.slice(0, 4).map((syn, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preview.antonyms && preview.antonyms.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Antonyms</span>
                  <div className="flex flex-wrap gap-1">
                    {preview.antonyms.slice(0, 4).map((ant, idx) => (
                      <span key={idx} className="text-xs px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded">
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                disabled={isSaving}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-lg text-sm transition"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handlePreviewSave}
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm shadow-md transition flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save to DB"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
