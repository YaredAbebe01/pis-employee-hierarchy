import { useMemo } from "react";

import {
  buildPositionTree,
  filterPositionsByQuery,
} from "@/lib/positionTree";
import type { Position, PositionNode } from "@/types/position";

export type UsePositionTreeResult = {
  tree: PositionNode[];
  filtered: Position[];
};

export function usePositionTree(
  items: Position[],
  query: string
): UsePositionTreeResult {
  return useMemo(() => {
    const filtered = filterPositionsByQuery(items, query);
    const tree = buildPositionTree(filtered);
    return { tree, filtered };
  }, [items, query]);
}
