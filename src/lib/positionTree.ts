import type { Position, PositionNode } from "@/types/position";

export function buildPositionTree(items: Position[]): PositionNode[] {
  const nodes = new Map<number, PositionNode>();
  const roots: PositionNode[] = [];

  items.forEach((item) => {
    nodes.set(item.id, { ...item, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function buildPositionMap(items: Position[]): Map<number, Position> {
  return new Map(items.map((item) => [item.id, item]));
}

export function getPositionPath(
  selectedId: number | null,
  items: Position[]
): Position[] {
  if (!selectedId) {
    return [];
  }

  const map = buildPositionMap(items);
  const path: Position[] = [];
  let current = map.get(selectedId) || null;

  while (current) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) || null : null;
  }

  return path;
}

export function filterPositionsByQuery(
  items: Position[],
  query: string
): Position[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  const map = buildPositionMap(items);
  const includeIds = new Set<number>();

  items.forEach((item) => {
    const matches =
      item.name.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized);

    if (matches) {
      includeIds.add(item.id);
      let parentId = item.parentId;
      while (parentId) {
        includeIds.add(parentId);
        parentId = map.get(parentId)?.parentId ?? null;
      }
    }
  });

  return items.filter((item) => includeIds.has(item.id));
}
