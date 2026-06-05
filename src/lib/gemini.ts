import { GoogleGenerativeAI } from "@google/generative-ai";
import { CardData } from "@/types/card";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateCardData(word: string): Promise<CardData> {
  if (!apiKey || apiKey === "your_key_here") {
    throw new Error("Please configure a valid GEMINI_API_KEY in your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

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

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    const data = JSON.parse(responseText);
    return {
      word: word.trim().toLowerCase(),
      definition: data.definition || "",
      translation: data.translation || "",
      partOfSpeech: data.partOfSpeech || "noun",
      forms: data.forms || {},
      pronunciation: data.pronunciation || "",
      examples: Array.isArray(data.examples) ? data.examples : [],
      synonyms: Array.isArray(data.synonyms) ? data.synonyms : [],
      antonyms: Array.isArray(data.antonyms) ? data.antonyms : [],
    };
  } catch (error) {
    console.error("Error parsing Gemini response JSON:", responseText, error);
    throw new Error("Failed to parse the AI dictionary response.");
  }
}
