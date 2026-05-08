export type Position = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PositionNode = Position & {
  children: PositionNode[];
};
