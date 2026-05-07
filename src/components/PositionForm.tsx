"use client";

import { Button, Group, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import type { Position } from "@/types/position";

type PositionFormValues = {
  name: string;
  description: string;
  parentId: number | null;
};

const schema = yup
  .object({
    name: yup.string().trim().required("Name is required"),
    description: yup.string().trim().required("Description is required"),
    parentId: yup.number().nullable(),
  })
  .required();

type PositionFormProps = {
  positions: Position[];
  initialValues?: PositionFormValues;
  excludeId?: number;
  isSubmitting?: boolean;
  onSubmit: (values: PositionFormValues) => void;
  submitLabel: string;
  cancelLabel?: string;
  onCancel?: () => void;
  parentHelpText?: string;
};

export default function PositionForm({
  positions,
  initialValues,
  excludeId,
  isSubmitting,
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
  parentHelpText,
}: PositionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionFormValues>({
    defaultValues: initialValues || {
      name: "",
      description: "",
      parentId: null,
    },
    resolver: yupResolver(schema),
  });

  const options = positions
    .filter((item) => (excludeId ? item.id !== excludeId : true))
    .map((item) => ({
      value: String(item.id),
      label: item.name,
    }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Position name"
          placeholder="e.g. CTO"
          {...register("name")}
          error={errors.name?.message}
          withAsterisk
        />
        <Textarea
          label="Description"
          placeholder="Short description"
          minRows={3}
          {...register("description")}
          error={errors.description?.message}
          withAsterisk
        />
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <Select
              label="Parent position"
              placeholder="No parent (root)"
              data={options}
              description={parentHelpText}
              clearable
              value={field.value ? String(field.value) : null}
              onChange={(value) =>
                field.onChange(value ? Number(value) : null)
              }
            />
          )}
        />
        <Group justify={onCancel ? "space-between" : "flex-end"}>
          {onCancel ? (
            <Button variant="subtle" color="gray" onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button type="submit" color="orange" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
