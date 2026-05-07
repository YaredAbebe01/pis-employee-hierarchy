import { NextResponse } from "next/server";

import {
  deletePositionById,
  findPositionById,
  updatePositionById,
} from "../data";
import type { Position } from "@/types/position";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
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
  const id = Number(params.id);
  const body = (await request.json()) as Position;

  if (!body.name || !body.description) {
    return NextResponse.json(
      { message: "Name and description are required." },
      { status: 400 }
    );
  }

  const updated = updatePositionById(id, {
    id,
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
  const id = Number(params.id);
  const removed = deletePositionById(id);

  if (!removed) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: "ok" });
}
