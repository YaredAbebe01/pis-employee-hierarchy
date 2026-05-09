import type { Position } from "@/types/position";

type Store = {
  positions: Position[];
  nextId: number;
};

function getStore(): Store {
  const globalStore = globalThis as typeof globalThis & {
    __positionsStore?: Store;
  };

  if (!globalStore.__positionsStore) {
    globalStore.__positionsStore = {
      positions: [],
      nextId: 1,
    };
  }

  return globalStore.__positionsStore;
}

export function listPositions(): Position[] {
  return getStore().positions;
}

type PositionPayload = {
  name: string;
  description: string;
  parentId: string | null;
};

export function addPosition(payload: PositionPayload): Position {
  const store = getStore();
  const timestamp = new Date().toISOString();
  const newPosition: Position = {
    ...payload,
    id: String(store.nextId++),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.positions.push(newPosition);
  return newPosition;
}

export function updatePositionById(
  id: string,
  payload: PositionPayload
): Position | null {
  const store = getStore();
  const index = store.positions.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  store.positions[index] = {
    ...store.positions[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };
  return store.positions[index];
}

export function deletePositionById(id: string): boolean {
  const store = getStore();
  const before = store.positions.length;
  store.positions = store.positions.filter((item) => item.id !== id);
  return store.positions.length !== before;
}

export function findPositionById(id: string): Position | null {
  return getStore().positions.find((item) => item.id === id) || null;
}
