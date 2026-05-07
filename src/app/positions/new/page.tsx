"use client";

import Link from "next/link";
import { Button, Card, Container, Group, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import PositionForm from "@/components/PositionForm";
import { createPosition, fetchPositions } from "@/features/positions/positionsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export default function CreatePositionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status } = useAppSelector((state) => state.positions);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
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
            onSubmit={async (values) => {
              try {
                await dispatch(createPosition(values)).unwrap();
                notifications.show({
                  title: "Position created",
                  message: "The new position is now in the hierarchy.",
                  color: "orange",
                });
                router.push("/");
              } catch (err) {
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
