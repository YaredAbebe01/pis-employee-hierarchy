"use client";

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
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  showActions?: boolean;
};

export default function PositionTree({
  nodes,
  onDelete,
  onEdit,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
  showActions = true,
}: PositionTreeProps) {
  return (
    <ul className="org-tree">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onDelete={onDelete}
          onEdit={onEdit}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
          showActions={showActions}
        />
      ))}
    </ul>
  );
}

type TreeItemProps = {
  node: PositionNode;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  showActions: boolean;
};

function TreeItem({
  node,
  onDelete,
  onEdit,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
  showActions,
}: TreeItemProps) {
  const isExpanded = expandedIds.has(node.id);
  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;

  return (
    <li className="org-node-item">
      <div
        className={`org-node ${
          selectedId === node.id ? "org-node--selected" : ""
        }`}
        onClick={() => onSelect(node.id)}
      >
        <Group
          justify="space-between"
          align="center"
          wrap="nowrap"
          className="org-node__header"
        >
          <Group gap="sm" align="center" wrap="nowrap">
            {hasChildren ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                className="org-node__toggle"
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
              <span className="org-node__toggle-spacer" />
            )}
            <ThemeIcon
              size="lg"
              radius="xl"
              variant="light"
              color={selectedId === node.id ? "orange" : "gray"}
            >
              <IconBriefcase size={18} />
            </ThemeIcon>
            <div className="org-node__text">
              <Text fw={600} size="sm" className="org-node__title">
                {node.name}
              </Text>
              <Text size="xs" c="dimmed" className="org-node__meta">
                {node.description || "No description"}
              </Text>
            </div>
          </Group>
          {showActions ? (
            <Group
              gap={6}
              className="org-node__actions"
              onClick={(event) => event.stopPropagation()}
            >
              <ActionIcon
                variant="light"
                color="orange"
                size="sm"
                aria-label="Edit position"
                onClick={() => onEdit?.(node.id)}
              >
                <IconPencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                aria-label="Delete position"
                onClick={() => onDelete?.(node.id)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ) : null}
        </Group>
      </div>
      {hasChildren && isExpanded ? (
        <ul className="org-children">
          {children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onDelete={onDelete}
              onEdit={onEdit}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
              showActions={showActions}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
