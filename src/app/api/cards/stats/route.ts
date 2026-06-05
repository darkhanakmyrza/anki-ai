import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    
    const [total, due] = await Promise.all([
      prisma.card.count(),
      prisma.card.count({
        where: {
          nextReview: {
            lte: now,
          },
        },
      }),
    ]);

    return NextResponse.json({ total, due });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
