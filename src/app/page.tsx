"use client";

import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconSitemap } from "@tabler/icons-react";

import PositionTree from "@/components/PositionTree";
import { deletePosition, fetchPositions } from "@/features/positions/positionsSlice";
import { usePositionTree } from "@/hooks/usePositionTree";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getPositionPath } from "@/lib/positionTree";

export default function PositionsListPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.positions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
    }
  }, [dispatch, status]);

  const { tree, filtered } = usePositionTree(items, searchQuery);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const stillExists = items.some((item) => item.id === selectedId);
    if (!stillExists) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedIds(new Set(filtered.map((item) => item.id)));
    }
  }, [filtered, searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setExpandedIds(new Set(items.map((item) => item.id)));
    }
  }, [items, searchQuery]);

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      title: "Delete position",
      children: (
        <Text size="sm">
          Delete this position? Child items will become root positions.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await dispatch(deletePosition(id)).unwrap();
          notifications.show({
            title: "Position deleted",
            message: "The position was removed successfully.",
            color: "orange",
          });
        } catch (err) {
          notifications.show({
            title: "Delete failed",
            message: "Unable to delete the position.",
            color: "red",
          });
        }
      },
    });
  };

  const selectedPath = useMemo(() => {
    return getPositionPath(selectedId, items);
  }, [items, selectedId]);

  const selectedPosition = useMemo(() => {
    return items.find((item) => item.id === selectedId) || null;
  }, [items, selectedId]);

  const selectedParent = useMemo(() => {
    if (!selectedPosition?.parentId) {
      return null;
    }
    return items.find((item) => item.id === selectedPosition.parentId) || null;
  }, [items, selectedPosition]);

  const directReportsCount = useMemo(() => {
    if (!selectedPosition) {
      return 0;
    }
    return items.filter((item) => item.parentId === selectedPosition.id).length;
  }, [items, selectedPosition]);

  return (
    <main className="app-shell py-8">
      <Container size="lg">
        <Group justify="space-between" align="center" mb="xl">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconSitemap size={20} />
            </ThemeIcon>
            <Title order={3}>OrgDirector</Title>
          </Group>
          <Button
            component={Link}
            href="/positions/new"
            color="blue"
            leftSection={<IconPlus size={18} />}
          >
            Add Position
          </Button>
        </Group>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="surface" radius="xl" padding="lg">
            <Stack gap="md">
              <Group justify="space-between" align="center" wrap="wrap">
                <Text fw={600}>Organization Tree</Text>
                <TextInput
                  placeholder="Search positions"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.currentTarget.value)
                  }
                  w={{ base: "100%", sm: 240 }}
                />
              </Group>
              {status === "loading" ? (
                <Stack gap="sm">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={64} radius="lg" />
                  ))}
                </Stack>
              ) : null}
              {error ? <Alert color="red">{error}</Alert> : null}
              {status !== "loading" && items.length === 0 ? (
                <Text>No positions yet. Create the first one.</Text>
              ) : null}
              {status !== "loading" && items.length > 0 && filtered.length === 0 ? (
                <Text>No matches for the current search.</Text>
              ) : null}
              {items.length > 0 && filtered.length > 0 ? (
                <PositionTree
                  nodes={tree}
                  onDelete={handleDelete}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  expandedIds={expandedIds}
                  onToggle={(id) => {
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) {
                        next.delete(id);
                      } else {
                        next.add(id);
                      }
                      return next;
                    });
                  }}
                />
              ) : null}
            </Stack>
          </Card>

          <Card className="surface" radius="xl" padding="lg">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={600}>Position Details</Text>
                <Badge color="blue" variant="light">
                  ACTIVE
                </Badge>
              </Group>
              {selectedPosition ? (
                <>
                  <Text size="sm" c="dimmed">
                    Selected: {selectedPosition.name}
                  </Text>
                  <Divider />
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="xs" c="dimmed">
                        REPORTS TO
                      </Text>
                      <Text fw={600} size="sm">
                        {selectedParent?.name || "None"}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">
                        DIRECT REPORTS
                      </Text>
                      <Text fw={600} size="sm">
                        {directReportsCount} People
                      </Text>
                    </div>
                  </Group>
                  <Divider />
                  <div>
                    <Text size="xs" c="dimmed">
                      DESCRIPTION
                    </Text>
                    <Text size="sm" mt={6}>
                      {selectedPosition.description || "No description yet."}
                    </Text>
                  </div>
                  {selectedPath.length > 0 ? (
                    <div className="rounded-xl bg-orange-50 px-3 py-2">
                      <Text size="xs" c="dimmed">
                        PATH
                      </Text>
                      <Text size="sm">
                        {selectedPath.map((item) => item.name).join(" / ")}
                      </Text>
                    </div>
                  ) : null}
                  <Button
                    component={Link}
                    href={`/positions/${selectedPosition.id}`}
                    variant="filled"
                    color="blue"
                    fullWidth
                  >
                    View Position
                  </Button>
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  Select a node to see details.
                </Text>
              )}
            </Stack>
          </Card>
        </div>
      </Container>
    </main>
  );
}
