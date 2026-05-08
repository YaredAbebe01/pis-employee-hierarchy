import { NextResponse } from "next/server";

import {
  deletePositionById,
  findPositionById,
  updatePositionById,
} from "../data";
type PositionPayload = {
  name: string;
  description: string;
  parentId: string | null;
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const position = findPositionById(id);

  if (!position) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(position);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = (await request.json()) as PositionPayload;

  if (!body.name || !body.description) {
    return NextResponse.json(
      { message: "Name and description are required." },
      { status: 400 }
    );
  }

  const updated = updatePositionById(id, {
    name: body.name,
    description: body.description,
    parentId: body.parentId ?? null,
  });

  if (!updated) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const removed = deletePositionById(id);

  if (!removed) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "ok" });
}
