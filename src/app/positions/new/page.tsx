"use client";

import Link from "next/link";
import { Button, Card, Container, Group, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import PositionForm from "@/components/PositionForm";
import {
  clearMutationErrors,
  createPosition,
  fetchPositions,
  fetchPositionsTree,
} from "@/features/positions/positionsSlice";
import type { ApiError } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function CreatePositionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status } = useAppSelector((state) => state.positions);
  const { mutationStatus, fieldErrors } = useAppSelector(
    (state) => state.positions
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
      dispatch(fetchPositionsTree());
    }
  }, [dispatch, status]);

  return (
    <main className="app-shell py-10">
      <Container size="sm">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Create position</Title>
            <Text c="dimmed">Add a role and place it in the hierarchy.</Text>
          </div>
          <Button component={Link} href="/" variant="subtle" color="orange">
            Back to list
          </Button>
        </Group>
        <Card className="surface" radius="xl" padding="lg">
          <PositionForm
            positions={items}
            submitLabel="Create position"
            isSubmitting={mutationStatus === "loading"}
            serverErrors={fieldErrors}
            onSubmit={async (values) => {
              dispatch(clearMutationErrors());
              try {
                await dispatch(createPosition(values)).unwrap();
                notifications.show({
                  title: "Position created",
                  message: "The new position is now in the hierarchy.",
                  color: "orange",
                });
                router.push("/");
              } catch (err) {
                const apiError = err as ApiError;
                if (apiError?.status === 400) {
                  return { fieldErrors: apiError.fieldErrors };
                }
                notifications.show({
                  title: "Create failed",
                  message: "Unable to create the position.",
                  color: "red",
                });
              }
            }}
          />
        </Card>
      </Container>
    </main>
  );
}
