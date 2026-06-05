import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dueOnly = searchParams.get("dueOnly") === "true";

    if (dueOnly) {
      const now = new Date();
      const cards = await prisma.card.findMany({
        where: {
          nextReview: {
            lte: now,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(cards);
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const search = searchParams.get("search") || "";
    const partOfSpeech = searchParams.get("partOfSpeech") || "all";

    const skip = (page - 1) * limit;

    const where: Prisma.CardWhereInput = {};

    if (search.trim() !== "") {
      where.OR = [
        { word: { contains: search.trim().toLowerCase(), mode: "insensitive" } },
        { translation: { contains: search.trim().toLowerCase(), mode: "insensitive" } },
      ];
    }

    if (partOfSpeech !== "all") {
      where.partOfSpeech = {
        equals: partOfSpeech.toLowerCase(),
        mode: "insensitive",
      };
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.card.count({ where }),
    ]);

    const hasMore = skip + cards.length < total;

    return NextResponse.json({ cards, total, hasMore });
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
