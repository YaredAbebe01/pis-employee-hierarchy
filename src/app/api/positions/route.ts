import { NextResponse } from "next/server";

import { addPosition, listPositions } from "./data";
type PositionPayload = {
  name: string;
  description: string;
  parentId: string | null;
};

export async function GET() {
  return NextResponse.json(listPositions());
}

export async function POST(request: Request) {
  const body = (await request.json()) as PositionPayload;

  if (!body.name || !body.description) {
    return NextResponse.json(
      { message: "Name and description are required." },
      { status: 400 }
    );
  }

  const newPosition = addPosition({
    name: body.name,
    description: body.description,
    parentId: body.parentId ?? null,
  });

  return NextResponse.json(newPosition, { status: 201 });
}
