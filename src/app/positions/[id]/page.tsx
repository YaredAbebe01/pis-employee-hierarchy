"use client";

import Link from "next/link";
import {
  Button,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import PositionForm from "@/components/PositionForm";
import {
  clearMutationErrors,
  fetchPositionById,
  fetchPositions,
  fetchPositionsTree,
  updatePosition,
} from "@/features/positions/positionsSlice";
import type { ApiError } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getDescendantIds } from "@/lib/positionTree";

type EditPositionPageProps = {
  params: { id: string };
};

export default function EditPositionPage({ params }: EditPositionPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status, selected, mutationStatus, fieldErrors } = useAppSelector(
    (state) => state.positions
  );
  const positionId = params.id;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
      dispatch(fetchPositionsTree());
    }
    dispatch(fetchPositionById({ id: positionId, includeChildren: true }));
  }, [dispatch, positionId, status]);

  const position = useMemo(
    () => items.find((item) => item.id === positionId) || selected,
    [items, positionId, selected]
  );
  const isLoading = status === "idle" || status === "loading" || !position;

  if (!position && status === "succeeded") {
    return (
      <main className="app-shell py-12">
        <Container size="md">
          <Card className="surface" radius="xl" padding="lg">
            <Title order={3}>Position not found</Title>
            <Text c="dimmed" mt="sm">
              The position you are looking for does not exist.
            </Text>
            <Button component={Link} href="/" mt="md" color="orange">
              Back to list
            </Button>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="app-shell py-12">
      <Container size="md">
        <Group justify="space-between" align="flex-start" mb="xl">
          <div>
            <Title order={2}>Edit position</Title>
            <Text c="dimmed">Update role details or move it in the tree.</Text>
          </div>
          <Button component={Link} href="/" variant="subtle" color="orange">
            Back to list
          </Button>
        </Group>
        <Card className="surface rounded-3xl" padding="xl">
          {isLoading ? (
            <Stack gap="sm" align="center" py="xl">
              <Loader color="orange" />
              <Text c="dimmed">Loading position details...</Text>
            </Stack>
          ) : null}
          {position && !isLoading ? (
            <PositionForm
              positions={items}
              excludeId={position.id}
              excludeIds={Array.from(getDescendantIds(position.id, items))}
              initialValues={{
                name: position.name,
                description: position.description,
                parentId: position.parentId,
              }}
              submitLabel="Save changes"
              isSubmitting={mutationStatus === "loading"}
              serverErrors={fieldErrors}
              onSubmit={async (values) => {
                dispatch(clearMutationErrors());
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
                  router.push("/");
                } catch (err) {
                  const apiError = err as ApiError;
                  if (apiError?.status === 400) {
                    return { fieldErrors: apiError.fieldErrors };
                  }
                  if (apiError?.status === 409) {
                    notifications.show({
                      title: "Cannot move",
                      message: "Cannot delete/move due to hierarchy rule.",
                      color: "red",
                    });
                    return;
                  }
                  notifications.show({
                    title: "Update failed",
                    message: "Unable to update the position.",
                    color: "red",
                  });
                }
              }}
            />
          ) : null}
        </Card>
      </Container>
    </main>
  );
}
