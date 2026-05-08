import type { Position } from "@/types/position";

type Store = {
  positions: Position[];
  nextId: number;
};

const seedData: Position[] = [
  {
    id: "1",
    name: "CEO",
    description: "Chief Executive Officer",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "CTO",
    description: "Chief Technology Officer",
    parentId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "CFO",
    description: "Chief Financial Officer",
    parentId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Project Manager",
    description: "Leads project delivery",
    parentId: "2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Product Owner",
    description: "Owns product backlog",
    parentId: "4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Tech Lead",
    description: "Guides engineering team",
    parentId: "5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Frontend Developer",
    description: "Builds UI",
    parentId: "6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Backend Developer",
    description: "Builds APIs",
    parentId: "6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "DevOps Engineer",
    description: "Manages deployment",
    parentId: "6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "QA Engineer",
    description: "Ensures quality",
    parentId: "5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Scrum Master",
    description: "Facilitates agile",
    parentId: "5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "12",
    name: "Chief Accountant",
    description: "Leads accounting",
    parentId: "3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "13",
    name: "Financial Analyst",
    description: "Analyzes finance",
    parentId: "12",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "14",
    name: "Accounts Payable",
    description: "Pays invoices",
    parentId: "12",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "15",
    name: "Internal Audit",
    description: "Audits processes",
    parentId: "3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "16",
    name: "COO",
    description: "Chief Operating Officer",
    parentId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "17",
    name: "Product Manager",
    description: "Manages product",
    parentId: "16",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "18",
    name: "Operations Manager",
    description: "Runs operations",
    parentId: "16",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "19",
    name: "Customer Relations",
    description: "Handles customers",
    parentId: "16",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "20",
    name: "HR",
    description: "Human Resources",
    parentId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getStore(): Store {
  const globalStore = globalThis as typeof globalThis & {
    __positionsStore?: Store;
  };

  if (!globalStore.__positionsStore) {
    globalStore.__positionsStore = {
      positions: [...seedData],
      nextId: Math.max(...seedData.map((item) => Number(item.id))) + 1,
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
