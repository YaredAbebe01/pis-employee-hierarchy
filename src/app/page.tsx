"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  ThemeIcon,
  ActionIcon,
  useComputedColorScheme,
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
  IconUsers,
  IconHierarchy2,
  IconTargetArrow,
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

type ConfirmActionModalProps = {
  body: React.ReactNode;
  confirmLabel: string;
  confirmColor: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

function ConfirmActionModal({
  body,
  confirmLabel,
  confirmColor,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="md">
      {body}
      <Group justify="flex-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button
          color={confirmColor}
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={handleConfirm}
        >
          {isSubmitting ? <Loader size="xs" color="white" /> : confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}

export default function PositionsListPage() {
  const dispatch = useAppDispatch();
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const { items, status, error } = useAppSelector((state) => state.positions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
    }
  }, [dispatch, status]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleDelete = (id: string) => {
    const position = items.find((item) => item.id === id);
    const directReports = items.filter((item) => item.parentId === id).length;
    const modalId = `delete-position-${id}`;

    modals.open({
      modalId,
      centered: true,
      withCloseButton: false,
      closeOnClickOutside: false,
      closeOnEscape: false,
      size: "sm",
      title: null,
      children: (
        <ConfirmActionModal
          confirmLabel="Delete"
          confirmColor="red"
          onCancel={() => modals.close(modalId)}
          onConfirm={async () => {
            const noticeId = `delete-${id}`;
            modals.close(modalId);
            notifications.show({
              id: noticeId,
              loading: true,
              title: "Deleting position",
              message: "Working on it...",
              autoClose: false,
            });
            try {
              await dispatch(deletePosition(id)).unwrap();
              notifications.update({
                id: noticeId,
                title: "Position deleted",
                message: "The position was removed successfully.",
                color: "orange",
                loading: false,
                autoClose: 2000,
              });
            } catch (err) {
              const status =
                typeof err === "object" && err !== null && "status" in err
                  ? Number((err as { status?: number }).status)
                  : null;
              notifications.update({
                id: noticeId,
                title: "Delete failed",
                message:
                  status === 409
                    ? "Cannot delete a position with direct reports—reassign them first."
                    : "Unable to delete the position.",
                color: "red",
                loading: false,
                autoClose: 3000,
              });
            }
          }}
          body={
            <Stack gap="sm">
              <Center>
                <ThemeIcon size={48} radius="xl" color="red" variant="light">
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
                  {directReports} employees currently reporting to this position
                  will need to be reassigned to a new supervisor.
                </Text>
              </Paper>
            </Stack>
          }
        />
      ),
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
              const modalId = `create-position-${Date.now()}`;
              modals.open({
                modalId,
                title: "Create position?",
                centered: true,
                children: (
                  <ConfirmActionModal
                    confirmLabel="Create"
                    confirmColor="blue"
                    onCancel={() => modals.close(modalId)}
                    onConfirm={async () => {
                      const noticeId = `create-${Date.now()}`;
                      modals.close(modalId);
                      notifications.show({
                        id: noticeId,
                        loading: true,
                        title: "Creating position",
                        message: "Working on it...",
                        autoClose: false,
                      });
                      try {
                        await dispatch(createPosition(values)).unwrap();
                        notifications.update({
                          id: noticeId,
                          title: "Position created",
                          message: "The new position is now in the hierarchy.",
                          color: "orange",
                          loading: false,
                          autoClose: 2000,
                        });
                      } catch (err) {
                        notifications.update({
                          id: noticeId,
                          title: "Create failed",
                          message: "Unable to create the position.",
                          color: "red",
                          loading: false,
                          autoClose: 3000,
                        });
                      }
                    }}
                    body={
                      <Text size="sm">
                        Are you sure you want to create the position
                        {values.name ? ` "${values.name}"` : ""}?
                      </Text>
                    }
                  />
                ),
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

  const openEditModal = (id: string) => {
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
              const modalId = `edit-position-${position.id}-${Date.now()}`;
              modals.open({
                modalId,
                title: "Save changes?",
                centered: true,
                children: (
                  <ConfirmActionModal
                    confirmLabel="Save"
                    confirmColor="blue"
                    onCancel={() => modals.close(modalId)}
                    onConfirm={async () => {
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
                    body={
                      <Text size="sm">
                        Save updates to
                        {values.name ? ` "${values.name}"` : " this position"}?
                      </Text>
                    }
                  />
                ),
              });
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
    if (!selectedId) {
      return null;
    }
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
    <main className="app-shell py-10">
      <Container size="xl">
        <div className="hero-shell mb-10">
          <Group justify="space-between" align="center" wrap="wrap" mb="xl">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconSitemap size={20} />
              </ThemeIcon>
              <div>
                <Title order={2} mt={6}>
                  OrgDirector Console
                </Title>
                <Text c="dimmed" mt={4}>
                  A polished command center for shaping leadership structure and reporting lines.
                </Text>
              </div>
            </Group>
            <Group gap="sm">
              <ActionIcon
                variant="light"
                color="teal"
                size="lg"
                aria-label="Toggle color scheme"
                onClick={() => toggleColorScheme()}
              >
                {isMounted ? (
                  computedColorScheme === "dark" ? (
                    <IconSun size={18} />
                  ) : (
                    <IconMoonStars size={18} />
                  )
                ) : (
                  <span className="block h-[18px] w-[18px]" />
                )}
              </ActionIcon>
              <Button
                color="teal"
                radius="md"
                leftSection={<IconPlus size={18} />}
                onClick={openCreateModal}
              >
                Add Position
              </Button>
            </Group>
          </Group>
          <div className="hero-grid">
            <div className="stat-card">
              <Group gap="sm" align="center">
                <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                  <IconUsers size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    TOTAL POSITIONS
                  </Text>
                  <Text fw={700} size="lg">
                    {items.length}
                  </Text>
                </div>
              </Group>
            </div>
            <div className="stat-card">
              <Group gap="sm" align="center">
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconHierarchy2 size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    ROOT ROLES
                  </Text>
                  <Text fw={700} size="lg">
                    {items.filter((item) => !item.parentId).length}
                  </Text>
                </div>
              </Group>
            </div>
            <div className="stat-card">
              <Group gap="sm" align="center">
                <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                  <IconTargetArrow size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    SEARCH MATCHES
                  </Text>
                  <Text fw={700} size="lg">
                    {filtered.length}
                  </Text>
                </div>
              </Group>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="tree-panel self-start" radius="xl" padding="lg">
            <Stack gap="md">
              <Group justify="space-between" align="center" wrap="wrap">
                <div>
                  <Text fw={700}>Organization Tree</Text>
                  <Text size="xs" c="dimmed">
                    Expand nodes to view reporting structure.
                  </Text>
                </div>
                <TextInput
                  placeholder="Search roles"
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

          <Card className="details-panel self-start" radius="xl" padding="lg">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={700}>Position Intelligence</Text>
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
                    <div className="rounded-xl bg-white/70 px-3 py-2">
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
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">
                    Select a node to see insights, reporting lines, and context.
                  </Text>
                  <Paper radius="lg" p="md" className="bg-white/70">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Tip
                    </Text>
                    <Text size="sm">
                      Use the search field to quickly locate roles by title or description.
                    </Text>
                  </Paper>
                </Stack>
              )}
            </Stack>
          </Card>
        </div>
      </Container>
    </main>
  );
}
