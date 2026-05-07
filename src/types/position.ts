export type Position = {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
};

export type PositionNode = Position & {
  children: PositionNode[];
};
