import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sm2 } from "@/lib/sm2";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid card ID." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { quality, ...manualData } = body;

    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found." },
        { status: 404 }
      );
    }

    let updatedCard;

    if (typeof quality === "number") {
      // Spaced repetition review update
      if (quality < 0 || quality > 5) {
        return NextResponse.json(
          { error: "Quality must be a number between 0 and 5." },
          { status: 400 }
        );
      }

      const { repetitions, easeFactor, interval, nextReview } = sm2(
        {
          repetitions: card.repetitions,
          easeFactor: card.easeFactor,
          interval: card.interval,
        },
        quality
      );

      updatedCard = await prisma.card.update({
        where: { id },
        data: {
          repetitions,
          easeFactor,
          interval,
          nextReview,
          lastReview: new Date(),
        },
      });
    } else {
      // Manual field updates (Phase 3)
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
        interval,
        easeFactor,
        repetitions,
        nextReview,
      } = manualData;

      updatedCard = await prisma.card.update({
        where: { id },
        data: {
          word: word !== undefined ? word.trim().toLowerCase() : undefined,
          definition: definition !== undefined ? definition : undefined,
          translation: translation !== undefined ? translation : undefined,
          partOfSpeech: partOfSpeech !== undefined ? partOfSpeech : undefined,
          forms: forms !== undefined ? forms : undefined,
          pronunciation: pronunciation !== undefined ? pronunciation : undefined,
          examples: examples !== undefined ? examples : undefined,
          synonyms: synonyms !== undefined ? synonyms : undefined,
          antonyms: antonyms !== undefined ? antonyms : undefined,
          interval: interval !== undefined ? interval : undefined,
          easeFactor: easeFactor !== undefined ? easeFactor : undefined,
          repetitions: repetitions !== undefined ? repetitions : undefined,
          nextReview: nextReview !== undefined ? new Date(nextReview) : undefined,
        },
      });
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid card ID." },
        { status: 400 }
      );
    }

    await prisma.card.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card." },
      { status: 500 }
    );
  }
}
