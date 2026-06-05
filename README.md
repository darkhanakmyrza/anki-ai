# 📚 anki-ai

> **An AI-Powered Spaced Repetition Flashcard Application for Learning English Vocabulary.**
>
> Built with **Next.js 14 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, and the **Google Gemini API**.

---

## 🌟 Key Features

* **✨ AI-Powered Auto-Fill**: Simply type an English word. The application calls the Google Gemini API to automatically fetch the definition, translation, part of speech, IPA pronunciation, modern example sentences, synonyms, and antonyms.
* **✍️ Robust Manual Fallback**: Fully functional without AI keys. Switch to **Manual Entry** mode at any time, or let the app automatically direct you to manual entry if API limits or errors occur.
* **🧠 Spaced Repetition System (SM-2)**: Implements the **SuperMemo-2 (SM-2)** algorithm. Rate card recall difficulty (*Again*, *Hard*, *Good*, *Easy*) to dynamically schedule review dates.
* **✏️ Integrated Card Editor**: Edit card details (spelling, definition, translation, synonyms, antonyms, examples) inline via a custom modal dialog.
* **🔍 Search & Filter**: Instantly search cards by keyword or filter the deck by Part of Speech (*noun*, *verb*, *adjective*, *adverb*, *phrase*).
* **🎨 Modern Responsive UI**: Clean interface built with Tailwind CSS, featuring glassmorphism elements, a learning dashboard, and custom 3D card flipping animations.

---

## 🛠 Tech Stack

* **Core Framework**: [Next.js 14](https://nextjs.org/) (App Router, strict TypeScript mode)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & CSS 3D Transforms (for card flips)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
* **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (utilizing a dynamic model fallback pipeline: `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ `gemini-1.5-flash`)
* **Spaced Repetition**: Standard SM-2 mathematical scheduler

---

## 🧠 Spaced Repetition Algorithm (SM-2)

The app schedules reviews using the SuperMemo-2 algorithm. Each card tracks:
- `repetitions` ($n$): Count of consecutive successful reviews.
- `easeFactor` ($EF$): Ease of recalling the word (starts at $2.5$).
- `interval` ($I$): Number of days to wait until the next review.

### Algorithm Rules:
For a given quality score $q$ ($0$ to $5$):

1. **Incorrect Recall ($q < 3$)**:
   - Reset repetitions to $0$.
   - Set next review interval to $1$ day.
2. **Correct Recall ($q \geq 3$)**:
   - If $repetitions = 0 \implies I = 1$ day.
   - If $repetitions = 1 \implies I = 6$ days.
   - If $repetitions > 1 \implies I = \text{round}(I \times EF)$ days.
   - Increment repetitions.
3. **Ease Factor Update**:
   $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
   *(Minimum $EF$ capped at $1.3$)*

---

## 📁 Project Structure

```
anki-ai/
├── prisma/
│   └── schema.prisma         # Database schema (PostgreSQL)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage (Stats, Add Form, Deck List)
│   │   ├── study/page.tsx    # Study view / active card review queue
│   │   └── api/
│   │       ├── cards/        # GET (all cards) & POST (create card)
│   │       ├── cards/[id]/   # PATCH (review / edit) & DELETE (remove card)
│   │       └── generate/     # POST (word lookup via Gemini AI)
│   ├── components/
│   │   ├── AddWordForm.tsx   # Word input form (AI / Manual toggle)
│   │   ├── FlashCard.tsx     # 3D Flip Flashcard component
│   │   ├── CardList.tsx      # Filterable deck list & inline manual editor
│   │   └── StudySession.tsx  # Active study queue, progress bar, SM-2 buttons
│   ├── lib/
│   │   ├── prisma.ts         # Prisma singleton client
│   │   ├── gemini.ts         # Gemini SDK wrapper with model fallback loop
│   │   └── sm2.ts            # SM-2 scheduling algorithm implementation
│   └── types/
│       └── card.ts           # TypeScript type definitions
├── .env                      # Environment config (git-ignored)
└── .env.example              # Sample environment template
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18 or higher
- A running PostgreSQL database instance
- A Google Gemini API Key (obtainable for free from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
Clone the repository, navigate to the directory, and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure the environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="postgresql://username:password@localhost:5432/anki_ai?schema=public"
```

### 4. Database Setup
Push the schema to your PostgreSQL database and generate the Prisma client:
```bash
npx prisma db push
```

### 5. Running the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to start learning!

---

## 🛡 License
This project is open-source and available under the [MIT License](LICENSE).
