# anki-ai — Agent Instructions

You are building a personal AI-powered flashcard app for learning English words.
The user studies alone (single user, no auth needed).

## Core User Flow
1. User types an English word
2. App calls Gemini API → AI fills the card automatically
3. User sees a preview → confirms → card saved to DB
4. User studies cards in flashcard mode (flip to reveal)
5. After each card: Again / Hard / Good / Easy → spaced repetition updates next review date

---

## Tech Stack (strictly follow this)

- **Framework:** Next.js 14, App Router, TypeScript strict mode
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **AI:** Google Gemini API (`gemini-1.5-flash` model)
- **Package manager:** npm

---

## Project Structure

```
anki-ai/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home: add word + card list
│   │   ├── study/page.tsx            # Study / flashcard mode
│   │   └── api/
│   │       ├── cards/route.ts        # GET all, POST new
│   │       ├── cards/[id]/route.ts   # PATCH review, DELETE
│   │       └── generate/route.ts     # POST: word → AI card data
│   ├── components/
│   │   ├── AddWordForm.tsx
│   │   ├── FlashCard.tsx
│   │   ├── CardList.tsx
│   │   └── StudySession.tsx
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── gemini.ts                 # Gemini API wrapper
│   │   └── sm2.ts                    # Spaced repetition algorithm
│   └── types/card.ts
├── .env.local                        # never commit
├── .env.example
└── REQUIREMENTS.md
```

---

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Card {
  id             Int       @id @default(autoincrement())
  word           String    @unique

  definition     String
  translation    String
  partOfSpeech   String
  forms          Json
  pronunciation  String
  examples       Json
  synonyms       Json
  antonyms       Json

  interval       Int       @default(1)
  easeFactor     Float     @default(2.5)
  repetitions    Int       @default(0)
  nextReview     DateTime  @default(now())
  lastReview     DateTime?

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

---

## API Contracts

### POST /api/generate
Request: `{ "word": "ephemeral" }`
Response:
```json
{
  "word": "ephemeral",
  "definition": "Lasting for a very short time",
  "translation": "мимолётный",
  "partOfSpeech": "adjective",
  "forms": { "comparative": "more ephemeral", "superlative": "most ephemeral" },
  "pronunciation": "/ɪˈfem.ər.əl/",
  "examples": ["Sentence one.", "Sentence two."],
  "synonyms": ["fleeting", "transient"],
  "antonyms": ["permanent", "eternal"]
}
```

### GET /api/cards
Returns all cards ordered by `createdAt` desc.

### POST /api/cards
Body: full card object from /api/generate. Saves to DB.

### PATCH /api/cards/[id]
Body: `{ "quality": 0 | 2 | 4 | 5 }`
Runs SM-2 algorithm, updates `interval`, `easeFactor`, `repetitions`, `nextReview`, `lastReview`.

### DELETE /api/cards/[id]
Deletes card by id.

---

## Gemini Prompt (use exactly this in gemini.ts)

```typescript
const prompt = `
You are an English dictionary assistant.
Return ONLY a valid JSON object for the word: "${word}"

{
  "definition": "short definition in English",
  "translation": "Russian translation",
  "partOfSpeech": "noun | verb | adjective | adverb | phrase",
  "forms": { "plural": "...", "pastTense": "...", "pastParticiple": "..." },
  "pronunciation": "/IPA/",
  "examples": ["example 1", "example 2"],
  "synonyms": ["word1", "word2", "word3"],
  "antonyms": ["word1", "word2"]
}

Rules:
- forms: only include keys relevant to the part of speech
- examples: natural modern sentences, not textbook style
- Return ONLY the JSON. No explanation, no markdown, no backticks.
`;
```

---

## SM-2 Algorithm (src/lib/sm2.ts)

```typescript
export interface SM2Input {
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: Date;
}

export function sm2(card: SM2Input, quality: number): SM2Output {
  let { repetitions, easeFactor, interval } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { repetitions, easeFactor, interval, nextReview };
}
```

---

## Key Rules for Codex

1. **Never call Gemini directly from components** — always through `src/lib/gemini.ts`
2. **Never access DB directly from components** — always through API routes
3. **Prisma client** — use singleton in `src/lib/prisma.ts`, never `new PrismaClient()` inline
4. **No `any` types** — TypeScript strict mode is on
5. **No `.then()` chains** — use `async/await` everywhere
6. **`forms`, `examples`, `synonyms`, `antonyms`** — stored as `Json` in Postgres, no need to JSON.parse/stringify manually with Prisma
7. **Error handling** — every API route must have try/catch and return proper HTTP status codes
8. **Environment variables** — `GEMINI_API_KEY` and `DATABASE_URL` come from `.env.local`

---

## Environment Variables

```bash
GEMINI_API_KEY=your_key_here
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/anki_ai"
```

---

## Commands

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```
