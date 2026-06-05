import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const {
      word,
      definition,
      translation,
      partOfSpeech,
      forms,
      pronunciation,
      examples,
      synonyms,
      antonyms,
    } = body;

    if (!word || typeof word !== "string" || word.trim() === "") {
      return NextResponse.json(
        { error: "Word is required." },
        { status: 400 }
      );
    }

    const cleanWord = word.trim().toLowerCase();

    // Check if the card already exists
    const existingCard = await prisma.card.findUnique({
      where: { word: cleanWord },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "A card for this word already exists." },
        { status: 409 }
      );
    }

    const newCard = await prisma.card.create({
      data: {
        word: cleanWord,
        definition: definition || "",
        translation: translation || "",
        partOfSpeech: partOfSpeech || "noun",
        forms: forms || {},
        pronunciation: pronunciation || "",
        examples: examples || [],
        synonyms: synonyms || [],
        antonyms: antonyms || [],
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card." },
      { status: 500 }
    );
  }
}
