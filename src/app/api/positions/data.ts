import type { Position } from "@/types/position";

type Store = {
  positions: Position[];
  nextId: number;
};

const seedData: Position[] = [
  { id: 1, name: "CEO", description: "Chief Executive Officer", parentId: null },
  { id: 2, name: "CTO", description: "Chief Technology Officer", parentId: 1 },
  { id: 3, name: "CFO", description: "Chief Financial Officer", parentId: 1 },
  { id: 4, name: "Project Manager", description: "Leads project delivery", parentId: 2 },
  { id: 5, name: "Product Owner", description: "Owns product backlog", parentId: 4 },
  { id: 6, name: "Tech Lead", description: "Guides engineering team", parentId: 5 },
  { id: 7, name: "Frontend Developer", description: "Builds UI", parentId: 6 },
  { id: 8, name: "Backend Developer", description: "Builds APIs", parentId: 6 },
  { id: 9, name: "DevOps Engineer", description: "Manages deployment", parentId: 6 },
  { id: 10, name: "QA Engineer", description: "Ensures quality", parentId: 5 },
  { id: 11, name: "Scrum Master", description: "Facilitates agile", parentId: 5 },
  { id: 12, name: "Chief Accountant", description: "Leads accounting", parentId: 3 },
  { id: 13, name: "Financial Analyst", description: "Analyzes finance", parentId: 12 },
  { id: 14, name: "Accounts Payable", description: "Pays invoices", parentId: 12 },
  { id: 15, name: "Internal Audit", description: "Audits processes", parentId: 3 },
  { id: 16, name: "COO", description: "Chief Operating Officer", parentId: 1 },
  { id: 17, name: "Product Manager", description: "Manages product", parentId: 16 },
  { id: 18, name: "Operations Manager", description: "Runs operations", parentId: 16 },
  { id: 19, name: "Customer Relations", description: "Handles customers", parentId: 16 },
  { id: 20, name: "HR", description: "Human Resources", parentId: 1 },
];

function getStore(): Store {
  const globalStore = globalThis as typeof globalThis & {
    __positionsStore?: Store;
  };

  if (!globalStore.__positionsStore) {
    globalStore.__positionsStore = {
      positions: [...seedData],
      nextId: Math.max(...seedData.map((item) => item.id)) + 1,
    };
  }

  return globalStore.__positionsStore;
}

export function listPositions(): Position[] {
  return getStore().positions;
}

export function addPosition(payload: Omit<Position, "id">): Position {
  const store = getStore();
  const newPosition: Position = { ...payload, id: store.nextId++ };
  store.positions.push(newPosition);
  return newPosition;
}

export function updatePositionById(
  id: number,
  payload: Position
): Position | null {
  const store = getStore();
  const index = store.positions.findIndex((item) => item.id === id);
  if (index < 0) {
    return null;
  }

  store.positions[index] = { ...payload, id };
  return store.positions[index];
}

export function deletePositionById(id: number): boolean {
  const store = getStore();
  const before = store.positions.length;
  store.positions = store.positions.filter((item) => item.id !== id);
  return store.positions.length !== before;
}

export function findPositionById(id: number): Position | null {
  return getStore().positions.find((item) => item.id === id) || null;
}
