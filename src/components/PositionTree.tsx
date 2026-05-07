"use client";

import Link from "next/link";
import { ActionIcon, Group, Text, ThemeIcon } from "@mantine/core";
import {
  IconBriefcase,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import type { PositionNode } from "@/types/position";

type PositionTreeProps = {
  nodes: PositionNode[];
  onDelete: (id: number) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
};

export default function PositionTree({
  nodes,
  onDelete,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
}: PositionTreeProps) {
  return (
    <ul className="space-y-4">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onDelete={onDelete}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}

type TreeItemProps = {
  node: PositionNode;
  onDelete: (id: number) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
};

function TreeItem({
  node,
  onDelete,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
}: TreeItemProps) {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={`surface rounded-2xl border px-4 py-3 transition ${
          selectedId === node.id
            ? "border-orange-300 bg-orange-50/40"
            : "border-transparent"
        }`}
        onClick={() => onSelect(node.id)}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" align="center" wrap="nowrap">
            {hasChildren ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                aria-label={isExpanded ? "Collapse node" : "Expand node"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggle(node.id);
                }}
              >
                {isExpanded ? (
                  <IconChevronDown size={16} />
                ) : (
                  <IconChevronRight size={16} />
                )}
              </ActionIcon>
            ) : (
              <span className="w-5" />
            )}
            <ThemeIcon
              size="lg"
              radius="xl"
              variant="light"
              color={selectedId === node.id ? "orange" : "gray"}
            >
              <IconBriefcase size={18} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">
                {node.name}
              </Text>
              <Text size="xs" c="dimmed">
                {node.description || "No description"}
              </Text>
            </div>
          </Group>
          <Group gap={6} onClick={(event) => event.stopPropagation()}>
            <ActionIcon
              component={Link}
              href={`/positions/${node.id}`}
              variant="light"
              color="orange"
              size="sm"
              aria-label="Edit position"
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              aria-label="Delete position"
              onClick={() => onDelete(node.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </div>
      {hasChildren && isExpanded ? (
        <ul className="mt-3 space-y-3 border-l border-dashed border-orange-200 pl-5">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
