export interface CardForms {
  plural?: string;
  pastTense?: string;
  pastParticiple?: string;
  comparative?: string;
  superlative?: string;
  [key: string]: string | undefined;
}

export interface CardData {
  word: string;
  definition: string;
  translation: string;
  partOfSpeech: string;
  forms: CardForms;
  pronunciation: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
}

export interface Card extends CardData {
  id: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: Date;
  lastReview: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
