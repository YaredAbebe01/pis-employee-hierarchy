"use client";

import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  ThemeIcon,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconPlus,
  IconSitemap,
  IconMoonStars,
  IconSun,
} from "@tabler/icons-react";

import PositionForm from "@/components/PositionForm";
import PositionTree from "@/components/PositionTree";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
} from "@/features/positions/positionsSlice";
import { usePositionTree } from "@/hooks/usePositionTree";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getPositionPath } from "@/lib/positionTree";

export default function PositionsListPage() {
  const dispatch = useAppDispatch();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
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
      setExpandedIds(new Set());
    }
  }, [items, searchQuery]);

  const handleDelete = (id: number) => {
    const position = items.find((item) => item.id === id);
    const directReports = items.filter((item) => item.parentId === id).length;

    modals.openConfirmModal({
      centered: true,
      withCloseButton: false,
      closeOnClickOutside: false,
      size: "sm",
      title: null,
      children: (
        <Stack gap="sm">
          <Center>
            <ThemeIcon
              size={48}
              radius="xl"
              color="red"
              variant="light"
            >
              <IconAlertTriangle size={24} />
            </ThemeIcon>
          </Center>
          <div className="text-center">
            <Text fw={700} size="lg">
              Delete Position?
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Are you sure you want to delete the
              {position ? ` "${position.name}"` : " this"} position? This will
              affect its direct reports.
            </Text>
          </div>
          <Paper
            radius="md"
            p="sm"
            className="border border-slate-200 bg-slate-50"
          >
            <Text size="xs" c="dimmed">
              {directReports} employees currently reporting to this position will
              need to be reassigned to a new supervisor.
            </Text>
          </Paper>
        </Stack>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red", radius: "md" },
      cancelProps: { radius: "md" },
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

  const openCreateModal = () => {
    modals.open({
      title: "Add New Position",
      centered: true,
      size: "lg",
      children: (
        <Stack gap="md">
          <PositionForm
            positions={items}
            submitLabel="Create Position"
            cancelLabel="Cancel"
            parentHelpText="This position will report directly to the selected manager."
            onCancel={() => modals.closeAll()}
            onSubmit={(values) => {
              modals.openConfirmModal({
                title: "Create position?",
                centered: true,
                labels: { confirm: "Create", cancel: "Cancel" },
                confirmProps: { color: "blue" },
                children: (
                  <Text size="sm">
                    Are you sure you want to create the position
                    {values.name ? ` "${values.name}"` : ""}?
                  </Text>
                ),
                onConfirm: async () => {
                  try {
                    await dispatch(createPosition(values)).unwrap();
                    notifications.show({
                      title: "Position created",
                      message: "The new position is now in the hierarchy.",
                      color: "orange",
                    });
                    modals.closeAll();
                  } catch (err) {
                    notifications.show({
                      title: "Create failed",
                      message: "Unable to create the position.",
                      color: "red",
                    });
                  }
                },
              });
            }}
          />
          <Alert
            color="blue"
            variant="light"
            icon={<IconInfoCircle size={16} />}
            title="Hierarchy Tip"
          >
            Adding a position here will automatically update the organizational
            tree for all downstream reports.
          </Alert>
        </Stack>
      ),
    });
  };

  const openEditModal = (id: number) => {
    const position = items.find((item) => item.id === id);
    if (!position) {
      return;
    }

    modals.open({
      title: "Edit Position",
      centered: true,
      size: "lg",
      children: (
        <Stack gap="md">
          <PositionForm
            positions={items}
            excludeId={position.id}
            initialValues={{
              name: position.name,
              description: position.description,
              parentId: position.parentId,
            }}
            submitLabel="Save Changes"
            cancelLabel="Cancel"
            parentHelpText="Updating the parent will reposition this role in the hierarchy."
            onCancel={() => modals.closeAll()}
            onSubmit={async (values) => {
              try {
                await dispatch(
                  updatePosition({
                    id: position.id,
                    name: values.name,
                    description: values.description,
                    parentId: values.parentId,
                  })
                ).unwrap();
                notifications.show({
                  title: "Position updated",
                  message: "Changes saved successfully.",
                  color: "orange",
                });
                modals.closeAll();
              } catch (err) {
                notifications.show({
                  title: "Update failed",
                  message: "Unable to update the position.",
                  color: "red",
                });
              }
            }}
          />
          <Alert
            color="blue"
            variant="light"
            icon={<IconInfoCircle size={16} />}
            title="Hierarchy Tip"
          >
            Changes will cascade to downstream reports and update the tree
            instantly.
          </Alert>
        </Stack>
      ),
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
          <Group gap="sm">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              aria-label="Toggle color scheme"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoonStars size={18} />
              )}
            </ActionIcon>
            <Button
              color="blue"
              leftSection={<IconPlus size={18} />}
              onClick={openCreateModal}
            >
              Add Position
            </Button>
          </Group>
        </Group>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="surface self-start" radius="xl" padding="lg">
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
                  onEdit={openEditModal}
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

          <Card className="surface self-start" radius="xl" padding="lg">
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
