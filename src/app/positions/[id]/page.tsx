"use client";

import Link from "next/link";
import { Button, Card, Container, Group, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import PositionForm from "@/components/PositionForm";
import { fetchPositions, updatePosition } from "@/features/positions/positionsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

type EditPositionPageProps = {
  params: { id: string };
};

export default function EditPositionPage({ params }: EditPositionPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status } = useAppSelector((state) => state.positions);
  const positionId = Number(params.id);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPositions());
    }
  }, [dispatch, status]);

  const position = useMemo(
    () => items.find((item) => item.id === positionId),
    [items, positionId]
  );

  if (status !== "loading" && !position) {
    return (
      <main className="app-shell py-10">
        <Container size="sm">
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
    <main className="app-shell py-10">
      <Container size="sm">
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Edit position</Title>
            <Text c="dimmed">Update role details or move it in the tree.</Text>
          </div>
          <Button component={Link} href="/" variant="subtle" color="orange">
            Back to list
          </Button>
        </Group>
        <Card className="surface" radius="xl" padding="lg">
          {position ? (
            <PositionForm
              positions={items}
              excludeId={position.id}
              initialValues={{
                name: position.name,
                description: position.description,
                parentId: position.parentId,
              }}
              submitLabel="Save changes"
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
                  router.push("/");
                } catch (err) {
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
