import { NextResponse } from "next/server";
import { generateCardData } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { word } = body;

    if (!word || typeof word !== "string" || word.trim() === "") {
      return NextResponse.json(
        { error: "Word is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const cardData = await generateCardData(word);
    return NextResponse.json(cardData);
  } catch (error) {
    console.error("Error generating card:", error);
    const message = error instanceof Error ? error.message : "An error occurred while generating the card.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
